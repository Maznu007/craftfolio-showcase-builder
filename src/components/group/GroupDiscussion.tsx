import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GroupComment } from '@/types/group';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface GroupDiscussionProps {
  groupId: string;
}

const GroupDiscussion: React.FC<GroupDiscussionProps> = ({ groupId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<GroupComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('group-comments')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_comments',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          handleNewComment(payload.new as GroupComment);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [comments]);
  
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchComments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('group_comments')
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            email
          )
        `)
        .eq('group_id', groupId)
        .order('created_at');
      
      if (error) throw error;
      
      if (data) {
        // Transform data to match our interface
        const typedComments: GroupComment[] = data.map(item => {
          // Check if profiles is an error and handle it - fixed null check
          const profileData = (item.profiles && typeof item.profiles === 'object' && 
              !('error' in item.profiles)) ? item.profiles : null;
              
          return {
            ...item,
            profiles: profileData
          };
        });
        
        setComments(typedComments);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading comments',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewComment = async (comment: GroupComment) => {
    // If the comment is from the current user, we already have it in the UI
    if (comment.user_id === user?.id) return;
    
    try {
      // Fetch profile info for the comment
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('id', comment.user_id)
        .single();
        
      if (!profileError && profileData) {
        const enrichedComment: GroupComment = {
          ...comment,
          profiles: profileData
        };
        
        setComments(prev => [...prev, enrichedComment]);
      } else {
        // Add the comment even without profile data
        setComments(prev => [...prev, { ...comment, profiles: null }]);
      }
    } catch (error) {
      console.error('Error fetching profile for new comment:', error);
      // Add the comment even without profile data
      setComments(prev => [...prev, { ...comment, profiles: null }]);
    }
  };
  
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('group_comments')
        .insert({
          group_id: groupId,
          user_id: user.id,
          comment: newComment.trim()
        });
      
      if (error) throw error;
      
      // Add the new comment to the UI immediately
      const newCommentObj: GroupComment = {
        id: 'temp-' + Date.now(),
        group_id: groupId,
        user_id: user.id,
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: {
          id: user.id,
          display_name: user.user_metadata?.display_name || null,
          email: user.email || ''
        },
        portfolio_id: null
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      
      // Refetch to get the actual comment with real ID
      await fetchComments();
    } catch (error: any) {
      toast({
        title: 'Error posting comment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderCommentContent = (text: string) => {
    // Simple formatting: convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };
  
  return (
    <div className="bg-white rounded-lg p-1">
      <div className="mb-4 h-[400px] overflow-y-auto border rounded-lg p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500">
            <p>No comments yet.</p>
            <p className="text-sm mt-2">Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const profile = comment.profiles;
              // Fixed: Added proper null-safe access with defaults
              const displayName = profile?.display_name || 
                (profile?.email ? profile.email.split('@')[0] : 'Anonymous User');
              const initials = displayName.substring(0, 2).toUpperCase();
              const isCurrentUser = user?.id === comment.user_id;
              
              return (
                <div 
                  key={comment.id} 
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  
                  <div 
                    className={`
                      flex-1 max-w-[80%] p-3 rounded-lg
                      ${isCurrentUser 
                        ? 'bg-blue-50 text-blue-900' 
                        : 'bg-gray-100 text-gray-800'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{displayName}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{renderCommentContent(comment.comment)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>
      
      <div className="pt-3">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
          disabled={!user || submitting}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmitComment();
            }
          }}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment} 
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussion;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, Share, Loader2, Link, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Portfolio } from '@/types/portfolio';
import CommentForm from './CommentForm';
import PortfolioCommentItem from './PortfolioComment';

type PortfolioComment = Tables<'portfolio_comments'> & {
  user_name?: string;
};

interface PortfolioEngagementProps {
  portfolio: Portfolio;
}

const PortfolioEngagement: React.FC<PortfolioEngagementProps> = ({ portfolio }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('comments');
  const [comments, setComments] = useState<PortfolioComment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (portfolio) {
      fetchComments();
      fetchLikes();
    }
  }, [portfolio]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_comments')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const userIds = [...new Set(data.map(comment => comment.user_id))];
      
      let userNames: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
          
        if (!profilesError && profilesData) {
          userNames = profilesData.reduce((acc: Record<string, string>, profile: any) => {
            acc[profile.id] = profile.display_name || `User ${profile.id.substring(0, 4)}`;
            return acc;
          }, {});
        }
      }
      
      const commentsWithUserNames = data.map(comment => ({
        ...comment,
        user_name: userNames[comment.user_id] || `User ${comment.user_id.substring(0, 4)}`
      }));
      
      setComments(commentsWithUserNames);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Failed to load comments",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    try {
      const { count, error } = await supabase
        .from('portfolio_likes')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_id', portfolio.id);
        
      if (error) throw error;
      
      setLikeCount(count || 0);
      
      if (user) {
        const { data, error: userLikeError } = await supabase
          .from('portfolio_likes')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (userLikeError) throw userLikeError;
        
        setUserLiked(!!data);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      toast({
        title: "Failed to load likes",
        description: "Unable to retrieve portfolio likes.",
        variant: "destructive"
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like portfolios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (userLiked) {
        const { error } = await supabase
          .from('portfolio_likes')
          .delete()
          .eq('portfolio_id', portfolio.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setLikeCount(prev => Math.max(0, prev - 1));
        setUserLiked(false);
        
        toast({
          title: "Like removed",
          description: "You've removed your like from this portfolio."
        });
      } else {
        const { error } = await supabase
          .from('portfolio_likes')
          .insert({
            portfolio_id: portfolio.id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        setLikeCount(prev => prev + 1);
        setUserLiked(true);
        
        toast({
          title: "Portfolio liked",
          description: "You've liked this portfolio!"
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Failed to update like",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async (comment: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment on portfolios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('portfolio_comments')
        .insert({
          portfolio_id: portfolio.id,
          user_id: user.id,
          comment
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      const newComment: PortfolioComment = {
        ...data,
        user_name: user.email?.split('@')[0] || `User ${user.id.substring(0, 4)}`
      };
      
      setComments(prev => [newComment, ...prev]);
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Failed to post comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed."
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Failed to delete comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      const portfolioUrl = `${window.location.origin}/community?portfolio=${portfolio.id}`;
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      
      toast({
        title: "Link copied!",
        description: "Portfolio link has been copied to clipboard."
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Failed to copy link",
        description: "Please try manually copying the URL.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="border-t mt-4 pt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            disabled={isSubmitting || !user}
            className={`flex items-center gap-2 ${userLiked ? 'text-blue-600' : ''}`}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className={`h-4 w-4 ${userLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
            )}
            <span>Like</span>
            {likeCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {likeCount}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveTab('comments')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comment</span>
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {comments.length}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            {copied ? <Link className="h-4 w-4 text-green-600" /> : <Share className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="comments">
            Comments {comments.length > 0 && `(${comments.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="space-y-4">
          {!user && (
            <div className="bg-amber-50 p-3 rounded-md flex items-center gap-2 text-sm text-amber-700 mb-4">
              <AlertTriangle className="h-4 w-4" />
              <p>Please log in to leave a comment.</p>
            </div>
          )}
          
          <CommentForm onSubmit={handleComment} disabled={!user} />
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">
              {comments.length === 0 ? 'No comments yet' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map(comment => (
                  <PortfolioCommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onDelete={handleDeleteComment} 
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioEngagement;

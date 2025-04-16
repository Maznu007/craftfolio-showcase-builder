
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Portfolio } from '@/types/portfolio';

type PortfolioComment = Tables<'portfolio_comments'> & {
  user_name?: string;
};

export const usePortfolioEngagement = (portfolio: Portfolio) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<PortfolioComment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return {
    comments,
    likeCount,
    userLiked,
    loading,
    handleComment,
    handleDeleteComment,
    fetchComments
  };
};

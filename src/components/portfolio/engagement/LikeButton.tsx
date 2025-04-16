
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio } from '@/types/portfolio';

interface LikeButtonProps {
  portfolio: Portfolio;
  initialLikeCount: number;
  initialUserLiked: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  portfolio, 
  initialLikeCount, 
  initialUserLiked 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
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
  );
};

export default LikeButton;

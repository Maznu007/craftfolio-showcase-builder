
import React, { useState } from 'react';
import { Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Tables } from '@/integrations/supabase/types';
import { Portfolio } from '@/types/portfolio';
import CommentForm from '../CommentForm';
import PortfolioCommentItem from '../PortfolioComment';

type PortfolioComment = Tables<'portfolio_comments'> & {
  user_name?: string;
};

interface CommentSectionProps {
  portfolio: Portfolio;
  comments: PortfolioComment[];
  loading: boolean;
  onAddComment: (comment: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  portfolio, 
  comments, 
  loading, 
  onAddComment, 
  onDeleteComment 
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {!user && (
        <div className="bg-amber-50 p-3 rounded-md flex items-center gap-2 text-sm text-amber-700 mb-4">
          <AlertTriangle className="h-4 w-4" />
          <p>Please log in to leave a comment.</p>
        </div>
      )}
      
      <CommentForm onSubmit={onAddComment} disabled={!user} />
      
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
                onDelete={onDeleteComment} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;

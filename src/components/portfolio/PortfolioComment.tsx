
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

type PortfolioComment = Tables<'portfolio_comments'> & {
  user_name?: string;
};

interface PortfolioCommentProps {
  comment: PortfolioComment;
  onDelete: (id: string) => void;
}

const PortfolioComment: React.FC<PortfolioCommentProps> = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const canDelete = user && user.id === comment.user_id;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
  
  const handleDelete = () => {
    if (canDelete) {
      onDelete(comment.id);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex space-x-3 py-3 border-b last:border-b-0">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
          {comment.user_name ? getInitials(comment.user_name) : 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">{comment.user_name || 'Anonymous User'}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="h-8 w-8 p-0">
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              <span className="sr-only">Delete comment</span>
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-700">{comment.comment}</p>
      </div>
    </div>
  );
};

export default PortfolioComment;

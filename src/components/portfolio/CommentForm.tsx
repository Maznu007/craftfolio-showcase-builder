
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
  disabled?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, disabled = false }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Comment cannot be empty",
        description: "Please write something before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(comment);
      setComment('');
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully."
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Failed to post comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={disabled || isSubmitting}
        className="min-h-[80px] resize-none"
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={disabled || isSubmitting || !comment.trim()} 
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;

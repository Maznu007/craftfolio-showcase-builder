
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { Portfolio } from '@/types/portfolio';
import { usePortfolioEngagement } from '@/hooks/usePortfolioEngagement';
import LikeButton from './engagement/LikeButton';
import ShareButton from './engagement/ShareButton';
import CommentSection from './engagement/CommentSection';

interface PortfolioEngagementProps {
  portfolio: Portfolio;
}

const PortfolioEngagement: React.FC<PortfolioEngagementProps> = ({ portfolio }) => {
  const [activeTab, setActiveTab] = useState('comments');
  const { 
    comments, 
    likeCount,
    userLiked,
    loading,
    handleComment,
    handleDeleteComment
  } = usePortfolioEngagement(portfolio);

  return (
    <div className="border-t mt-4 pt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <LikeButton 
            portfolio={portfolio} 
            initialLikeCount={likeCount} 
            initialUserLiked={userLiked} 
          />
          
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
          
          <ShareButton portfolio={portfolio} />
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="comments">
            Comments {comments.length > 0 && `(${comments.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments">
          <CommentSection 
            portfolio={portfolio}
            comments={comments}
            loading={loading}
            onAddComment={handleComment}
            onDeleteComment={handleDeleteComment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioEngagement;

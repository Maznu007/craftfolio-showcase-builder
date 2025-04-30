import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GroupPortfolio } from '@/types/group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';

interface GroupPortfolioListProps {
  portfolios: GroupPortfolio[];
  onRefresh: () => void;
  isCurrentUserOwner: boolean;
}

const GroupPortfolioList: React.FC<GroupPortfolioListProps> = ({ 
  portfolios, 
  onRefresh,
  isCurrentUserOwner 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="mb-4">No portfolios have been shared in this group yet.</p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => navigate('/portfolio')}
            variant="outline"
          >
            View My Portfolios
          </Button>
          <Button onClick={() => navigate('/portfolio/create')}>Create New Portfolio</Button>
        </div>
      </div>
    );
  }
  
  const handleRemovePortfolio = async (portfolioShareId: string) => {
    try {
      setRemovingId(portfolioShareId);
      
      const { error } = await supabase
        .from('group_portfolios')
        .delete()
        .eq('id', portfolioShareId);
      
      if (error) throw error;
      
      toast({
        title: 'Portfolio removed',
        description: 'The portfolio has been removed from this group',
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error removing portfolio',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };
  
  const handleViewPortfolio = (portfolioId: string) => {
    navigate(`/portfolio/view/${portfolioId}`);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolios.map((item) => {
        const portfolio = item.portfolios;
        const sharedBy = item.profiles;
        const displayName = sharedBy?.display_name || 
          (sharedBy?.email ? sharedBy.email.split('@')[0] : 'Anonymous User');
        const canRemove = user?.id === item.shared_by || isCurrentUserOwner;
        
        return (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-1">{portfolio.title}</h3>
              <p className="text-sm text-gray-500 mb-3">
                Shared by {displayName}
              </p>
              
              {portfolio.description && (
                <p className="text-gray-600 text-sm line-clamp-3">{portfolio.description}</p>
              )}
            </CardContent>
            
            <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <div className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Shared {formatDistanceToNow(new Date(item.shared_at), { addSuffix: true })}
              </div>
              
              <div className="flex gap-2">
                {canRemove && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePortfolio(item.id);
                    }}
                    disabled={removingId === item.id}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    {removingId === item.id ? (
                      <span className="animate-pulse">Removing...</span>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-1" /> 
                        Remove
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  size="sm"
                  onClick={() => handleViewPortfolio(portfolio.id)}
                >
                  View Portfolio
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default GroupPortfolioList;

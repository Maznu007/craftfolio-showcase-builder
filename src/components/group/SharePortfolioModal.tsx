
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio, safeParsePortfolioContent } from '@/types/portfolio';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SharePortfolioModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  onShareSuccess: () => void;
}

const SharePortfolioModal: React.FC<SharePortfolioModalProps> = ({
  open,
  onClose,
  groupId,
  onShareSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  
  useEffect(() => {
    if (open && user) {
      fetchUserPortfolios();
    }
  }, [open, user]);
  
  const fetchUserPortfolios = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user's portfolios
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Fetch already shared portfolios in this group
      const { data: alreadyShared, error: sharedError } = await supabase
        .from('group_portfolios')
        .select('portfolio_id')
        .eq('group_id', groupId);
      
      if (sharedError) throw sharedError;
      
      // Filter out already shared portfolios
      const sharedIds = alreadyShared?.map(item => item.portfolio_id) || [];
      
      if (data) {
        // Convert the raw data to correctly typed Portfolio objects
        const typedPortfolios = data.map(p => ({
          ...p,
          content: safeParsePortfolioContent(p.content)
        }));
        
        const availablePortfolios = typedPortfolios.filter(portfolio => !sharedIds.includes(portfolio.id));
        setPortfolios(availablePortfolios);
        
        if (availablePortfolios.length > 0) {
          setSelectedPortfolioId(availablePortfolios[0].id);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error loading portfolios',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSharePortfolio = async () => {
    if (!selectedPortfolioId || !user) return;
    
    try {
      setSharing(true);
      
      const { error } = await supabase
        .from('group_portfolios')
        .insert({
          group_id: groupId,
          portfolio_id: selectedPortfolioId,
          shared_by: user.id
        });
      
      if (error) throw error;
      
      toast({
        title: 'Portfolio shared successfully',
        description: 'Your portfolio has been shared with the group',
      });
      
      onShareSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error sharing portfolio',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };
  
  const handleClose = () => {
    if (!sharing) {
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Portfolio with Group</DialogTitle>
          <DialogDescription>
            Select a portfolio to share with this group. All group members will be able to view it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">You have no portfolios available to share.</p>
              <p className="text-sm">Either all your portfolios are already shared with this group, or you need to create one first.</p>
            </div>
          ) : (
            <RadioGroup value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                  <RadioGroupItem value={portfolio.id} id={portfolio.id} />
                  <Label htmlFor={portfolio.id} className="cursor-pointer flex-1">
                    <div className="font-medium">{portfolio.title}</div>
                    {portfolio.description && (
                      <div className="text-sm text-gray-500 line-clamp-1">{portfolio.description}</div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={handleClose} disabled={sharing}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSharePortfolio}
            disabled={loading || portfolios.length === 0 || !selectedPortfolioId || sharing}
          >
            {sharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              'Share Portfolio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SharePortfolioModal;

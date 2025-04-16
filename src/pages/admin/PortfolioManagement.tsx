
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Eye, Trash2, Search, MessageSquare, Heart,
  FileText, Star, StarOff, UserX, Clock, Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  category: string | null;
  template_id: string;
  display_name: string | null;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
}

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [actionPortfolio, setActionPortfolio] = useState<Portfolio | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      
      // Fetch public portfolios with join to get creator name
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          profiles:user_id (display_name),
          like_count:portfolio_likes (count),
          comment_count:portfolio_comments (count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to flatten the structure
      const transformedData = data.map(portfolio => ({
        ...portfolio,
        display_name: portfolio.profiles?.display_name || null,
        like_count: portfolio.like_count?.length || 0,
        comment_count: portfolio.comment_count?.length || 0,
        is_featured: false // We'll add this field for demo purposes
      }));
      
      setPortfolios(transformedData);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        variant: "destructive",
        title: "Failed to load portfolios",
        description: "There was a problem fetching portfolio data."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHidePortfolio = async (portfolioId: string) => {
    try {
      // Update the portfolio to be private
      const { error } = await supabase
        .from('portfolios')
        .update({ is_public: false })
        .eq('id', portfolioId);
      
      if (error) throw error;
      
      // Update local state
      setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      
      toast({
        title: "Portfolio hidden",
        description: "The portfolio has been hidden from the community"
      });
    } catch (error) {
      console.error('Error hiding portfolio:', error);
      toast({
        variant: "destructive",
        title: "Failed to hide portfolio",
        description: "There was a problem updating the portfolio visibility."
      });
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      // Delete the portfolio
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);
      
      if (error) throw error;
      
      // Update local state
      setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      
      toast({
        title: "Portfolio deleted",
        description: "The portfolio has been permanently deleted"
      });
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete portfolio",
        description: "There was a problem deleting the portfolio."
      });
    }
  };

  const handleToggleFeatured = (portfolioId: string, currentStatus: boolean) => {
    // Toggle featured status (this would connect to a real API in production)
    setPortfolios(prev => 
      prev.map(p => 
        p.id === portfolioId 
          ? { ...p, is_featured: !currentStatus } 
          : p
      )
    );
    
    toast({
      title: currentStatus ? "Portfolio unfeatured" : "Portfolio featured",
      description: currentStatus 
        ? "The portfolio is no longer featured" 
        : "The portfolio is now featured on the community page"
    });
  };

  const openActionDialog = (portfolio: Portfolio, action: string) => {
    setActionPortfolio(portfolio);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (!actionPortfolio || !actionType) return;
    
    switch (actionType) {
      case 'hide':
        handleHidePortfolio(actionPortfolio.id);
        break;
      case 'delete':
        handleDeletePortfolio(actionPortfolio.id);
        break;
      case 'feature':
        handleToggleFeatured(actionPortfolio.id, actionPortfolio.is_featured);
        break;
      default:
        break;
    }
    
    setShowDialog(false);
    setActionPortfolio(null);
    setActionType(null);
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      (portfolio.title && portfolio.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (portfolio.description && portfolio.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (portfolio.display_name && portfolio.display_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply category filter
    const matchesCategory = !filterCategory || portfolio.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(portfolios.map(p => p.category).filter(Boolean))] as string[];

  const getActionTitle = () => {
    if (!actionType || !actionPortfolio) return '';
    
    switch (actionType) {
      case 'hide':
        return `Hide "${actionPortfolio.title}" from community?`;
      case 'delete':
        return `Delete portfolio "${actionPortfolio.title}"?`;
      case 'feature':
        return actionPortfolio.is_featured
          ? `Remove "${actionPortfolio.title}" from featured?`
          : `Feature "${actionPortfolio.title}" on community page?`;
      default:
        return '';
    }
  };

  const getActionDescription = () => {
    if (!actionType || !actionPortfolio) return '';
    
    switch (actionType) {
      case 'hide':
        return 'This will remove the portfolio from the community page but it will still be available to the creator.';
      case 'delete':
        return 'This will permanently delete the portfolio. This action cannot be undone.';
      case 'feature':
        return actionPortfolio.is_featured
          ? 'This will remove the portfolio from the featured section of the community page.'
          : 'This will highlight the portfolio in the featured section of the community page.';
      default:
        return '';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Portfolio Management</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search portfolios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filterCategory === null ? "default" : "outline"}
              onClick={() => setFilterCategory(null)}
              size="sm"
            >
              All
            </Button>
            
            {categories.map(category => (
              <Button
                key={category}
                variant={filterCategory === category ? "default" : "outline"}
                onClick={() => setFilterCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Portfolio</TableHead>
                  <TableHead className="hidden md:table-cell">Creator</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Engagement</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPortfolios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No portfolios found matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPortfolios.map((portfolio) => (
                    <TableRow key={portfolio.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center">
                              {portfolio.title}
                              {portfolio.is_featured && (
                                <Star className="h-4 w-4 ml-1 text-amber-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {portfolio.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        {portfolio.display_name || 'Unknown user'}
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        {portfolio.category ? (
                          <Badge variant="outline">
                            {portfolio.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not specified</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1 text-red-500" />
                            <span>{portfolio.like_count}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                            <span>{portfolio.comment_count}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm">
                            {new Date(portfolio.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="View Portfolio"
                            onClick={() => navigate(`/portfolio/view/${portfolio.id}`)}
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            title={portfolio.is_featured ? "Unfeature" : "Feature"}
                            onClick={() => openActionDialog(portfolio, 'feature')}
                          >
                            {portfolio.is_featured ? (
                              <StarOff className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Star className="h-4 w-4 text-amber-500" />
                            )}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="Hide from Community"
                            onClick={() => openActionDialog(portfolio, 'hide')}
                          >
                            <UserX className="h-4 w-4 text-gray-500" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            title="Delete Portfolio"
                            onClick={() => openActionDialog(portfolio, 'delete')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'delete' ? 'destructive' : 'default'} 
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PortfolioManagement;

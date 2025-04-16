
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreHorizontal, EyeOff, Trash2, ExternalLink, AlertTriangle, Search, Filter } from 'lucide-react';

interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  category: string | null;
  profileData?: {
    display_name: string | null;
  };
}

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
  const [deletePortfolioId, setDeletePortfolioId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          id, 
          title, 
          description, 
          user_id, 
          created_at, 
          updated_at, 
          is_public, 
          category
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user display names
      const portfoliosWithUsers = await Promise.all(
        data.map(async (portfolio) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', portfolio.user_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return {
              ...portfolio,
              profileData: { display_name: 'Unknown User' }
            };
          }

          return {
            ...portfolio,
            profileData
          };
        })
      );

      setPortfolios(portfoliosWithUsers);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        variant: "destructive",
        title: "Failed to load portfolios",
        description: "There was a problem fetching portfolio data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({ is_public: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPortfolios(prev =>
        prev.map(p =>
          p.id === id ? { ...p, is_public: !currentStatus } : p
        )
      );

      toast({
        title: `Portfolio ${currentStatus ? 'hidden' : 'made public'}`,
        description: `The portfolio has been ${currentStatus ? 'hidden from' : 'made visible to'} the community.`,
      });

    } catch (error) {
      console.error('Error updating portfolio visibility:', error);
      toast({
        variant: "destructive",
        title: "Failed to update portfolio",
        description: "There was a problem updating the portfolio visibility.",
      });
    }
  };

  const handleDeletePortfolio = async () => {
    if (!deletePortfolioId) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', deletePortfolioId);

      if (error) throw error;

      // Update local state
      setPortfolios(prev => prev.filter(p => p.id !== deletePortfolioId));

      toast({
        title: "Portfolio deleted",
        description: "The portfolio has been permanently deleted.",
      });

      setDeletePortfolioId(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete portfolio",
        description: "There was a problem deleting the portfolio.",
      });
    }
  };

  const confirmDelete = (id: string) => {
    setDeletePortfolioId(id);
    setShowDeleteDialog(true);
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    // Apply search filter
    const matchesSearch = searchQuery === '' ||
      portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (portfolio.description && portfolio.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (portfolio.profileData?.display_name && portfolio.profileData.display_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply category filter
    const matchesCategory = categoryFilter === null || portfolio.category === categoryFilter;

    // Apply status filter
    const matchesStatus = statusFilter === null || portfolio.is_public === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(portfolios.map(p => p.category).filter(Boolean))) as string[];

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

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                  All Categories
                </DropdownMenuItem>
                {categories.map(category => (
                  <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Visibility
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(true)}>
                  Public Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter(false)}>
                  Private Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <TableHead className="w-[300px]">Portfolio</TableHead>
                  <TableHead className="hidden md:table-cell">Creator</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead>Status</TableHead>
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
                        <div>
                          <div className="font-medium">{portfolio.title}</div>
                          {portfolio.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {portfolio.description}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {portfolio.profileData?.display_name || 'Unknown User'}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {portfolio.category ? (
                          <Badge variant="outline">{portfolio.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Uncategorized</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {new Date(portfolio.created_at).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {portfolio.is_public ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Private
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Portfolio"
                            onClick={() => window.open(`/portfolio/view/${portfolio.id}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            title={portfolio.is_public ? "Make Private" : "Make Public"}
                            onClick={() => handleVisibilityToggle(portfolio.id, portfolio.is_public)}
                          >
                            {portfolio.is_public ? (
                              <EyeOff className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-green-500" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            title="Delete Portfolio"
                            onClick={() => confirmDelete(portfolio.id)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Portfolio</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this portfolio? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePortfolio}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PortfolioManagement;

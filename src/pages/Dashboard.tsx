
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, Eye, Pencil, Trash2, DownloadCloud, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PortfolioView from '@/components/portfolio/PortfolioView';
import { Portfolio, safeParsePortfolioContent } from '@/types/portfolio';

const Dashboard = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletePortfolioId, setDeletePortfolioId] = useState<string | null>(null);
  const [viewPortfolio, setViewPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchPortfolios();
  }, [user, navigate]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform and parse the portfolio content
      const parsedPortfolios = (data || []).map(p => ({
        ...p,
        content: safeParsePortfolioContent(p.content)
      }));

      setPortfolios(parsedPortfolios);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        variant: "destructive",
        title: "Error fetching portfolios",
        description: "There was a problem loading your portfolios."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = () => {
    navigate('/portfolio/create');
  };

  const handleEditPortfolio = (portfolioId: string) => {
    // Store the portfolio ID in localStorage for the edit page to pick up
    localStorage.setItem('editPortfolioId', portfolioId);
    navigate('/portfolio/create');
  };

  const handleDeletePortfolio = async () => {
    if (!deletePortfolioId) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', deletePortfolioId);

      if (error) throw error;

      setPortfolios(prevPortfolios => 
        prevPortfolios.filter(p => p.id !== deletePortfolioId)
      );

      toast({
        title: "Portfolio deleted",
        description: "Your portfolio has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        variant: "destructive",
        title: "Error deleting portfolio",
        description: "There was a problem deleting your portfolio."
      });
    } finally {
      setDeletePortfolioId(null);
    }
  };

  const confirmDelete = (portfolioId: string) => {
    setDeletePortfolioId(portfolioId);
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Portfolios</h1>
            <Button onClick={handleCreatePortfolio}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Portfolio
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-gray-500">Loading your portfolios...</p>
            </div>
          ) : portfolios.length === 0 ? (
            <Card className="text-center p-12">
              <CardContent className="pt-10">
                <div className="flex flex-col items-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Portfolios Found</h2>
                  <p className="text-gray-500 mb-6">
                    You haven't created any portfolios yet. Create your first portfolio to showcase your skills and projects.
                  </p>
                  <Button onClick={handleCreatePortfolio}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="truncate">{portfolio.title}</CardTitle>
                    <CardDescription className="truncate">
                      {portfolio.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-sm text-gray-500 mb-2">
                      Last updated: {new Date(portfolio.updated_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      Template: <span className="font-medium capitalize">{portfolio.template_id.replace('-', ' ')}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4 border-t">
                    <div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewPortfolio(portfolio)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPortfolio(portfolio.id)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(portfolio.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-6 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePortfolioId} onOpenChange={() => setDeletePortfolioId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this portfolio? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePortfolioId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePortfolio}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Portfolio View Modal */}
      {viewPortfolio && (
        <PortfolioView 
          portfolio={viewPortfolio} 
          onClose={() => setViewPortfolio(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;

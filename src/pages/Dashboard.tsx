
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PlusIcon, FileIcon, LockIcon, PencilIcon, EyeIcon, Trash2Icon } from 'lucide-react';

const Dashboard = () => {
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      // Show welcome toast when a user successfully arrives at the dashboard
      toast({
        title: "Welcome to your dashboard",
        description: `Logged in as ${user.email}`,
      });
      
      // Load user's portfolios
      loadPortfolios();
    }
  }, [user, navigate]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPortfolios(data || []);
    } catch (error) {
      console.error("Error loading portfolios:", error);
      toast({
        variant: "destructive",
        title: "Error loading portfolios",
        description: error.message || "There was an error loading your portfolios.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Portfolio deleted",
        description: "Your portfolio has been deleted successfully.",
      });
      
      // Refresh the portfolios list
      loadPortfolios();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast({
        variant: "destructive",
        title: "Error deleting portfolio",
        description: error.message || "There was an error deleting your portfolio.",
      });
    }
  };

  const handleViewPortfolio = (portfolio) => {
    // For now, just display portfolio details in a toast
    toast({
      title: "View Portfolio",
      description: "Portfolio viewing feature coming soon!",
    });
  };

  const handleEditPortfolio = (portfolio) => {
    // For now, just navigate to create portfolio page
    // In a real implementation, this would pre-populate the form with the portfolio data
    toast({
      title: "Edit Portfolio",
      description: "Portfolio editing feature coming soon!",
    });
    navigate('/portfolio/create');
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium break-all">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium capitalize">{userType} User</p>
                </div>
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/profile')}
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {userType === 'premium' ? 
                    'You have a premium account with advanced portfolio features.' : 
                    'Upgrade to premium to unlock all portfolio features.'}
                </p>
                <div className="pt-4 flex gap-4">
                  <Button 
                    className="flex-1"
                    onClick={() => navigate('/portfolio/create')}
                  >
                    Create Portfolio
                  </Button>
                  {userType === 'free' && (
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate('/upgrade')}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Portfolios Section */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Portfolios</h2>
              <Button onClick={() => navigate('/portfolio/create')} className="flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading your portfolios...</div>
            ) : portfolios.length === 0 ? (
              <Card className="border-dashed border-2 p-8">
                <div className="text-center">
                  <FileIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No portfolios yet</h3>
                  <p className="text-gray-500 mb-6">Create your first portfolio to showcase your skills and experience.</p>
                  <Button onClick={() => navigate('/portfolio/create')}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Portfolio
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg truncate">{portfolio.title}</CardTitle>
                      <CardDescription className="truncate">{portfolio.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pb-2">
                      <div className="text-sm text-gray-500">
                        <p>Created: {new Date(portfolio.created_at).toLocaleDateString()}</p>
                        <p className="capitalize">Template: {portfolio.template_id.replace('-', ' ')}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPortfolio(portfolio)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPortfolio(portfolio)}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Premium Features Section */}
          {userType !== 'premium' && (
            <div className="mt-12">
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LockIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <span className="text-yellow-500 font-bold mr-2">✓</span>
                      Access to premium portfolio templates
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 font-bold mr-2">✓</span>
                      Create unlimited portfolios
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 font-bold mr-2">✓</span>
                      Custom domain for your portfolios
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 font-bold mr-2">✓</span>
                      Advanced analytics and tracking
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => navigate('/upgrade')}
                  >
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-6 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

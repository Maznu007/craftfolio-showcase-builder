
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Upgrade = () => {
  const { user, userType, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleUpgrade = async () => {
    if (!user) return;
    
    try {
      // Update the user type in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'premium' })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh the user profile to get the latest user type
      await refreshUserProfile();
      
      toast({
        title: "Upgrade successful!",
        description: "You are now a premium user. Enjoy all the premium features!",
      });
      
      // In a real application, this would also include payment processing
      // and would only update the subscription after successful payment
    } catch (error: any) {
      console.error('Error upgrading plan:', error);
      toast({
        variant: "destructive",
        title: "Upgrade failed",
        description: error.message || "Failed to upgrade your plan. Please try again.",
      });
    }
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Upgrade Your Plan</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className={`border-2 ${userType === 'free' ? 'border-gray-500' : 'border-transparent'}`}>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Basic portfolio features</CardDescription>
                <div className="text-3xl font-bold mt-2">$0</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>1 portfolio</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Basic templates</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Standard support</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={userType === 'free'}
                >
                  {userType === 'free' ? 'Current Plan' : 'Downgrade'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card className={`border-2 ${userType === 'premium' ? 'border-gray-500' : 'border-transparent'}`}>
              <CardHeader>
                <CardTitle>Premium Plan</CardTitle>
                <CardDescription>Advanced portfolio features</CardDescription>
                <div className="text-3xl font-bold mt-2">$9.99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Unlimited portfolios</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Premium templates</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Custom domain</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Analytics</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={userType === 'premium'}
                >
                  {userType === 'premium' ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardFooter>
            </Card>
          </div>
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

export default Upgrade;

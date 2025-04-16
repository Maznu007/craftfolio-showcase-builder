
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const { user, userType, loading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Refresh user profile to get the latest status
      if (user) {
        await refreshUserProfile();
      }
      
      // Redirect if already logged in as admin
      if (!loading && user && userType === 'admin') {
        navigate('/admin/dashboard');
      }
    };
    
    checkAdminStatus();
  }, [user, loading, userType, navigate, refreshUserProfile]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      // Attempt login
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Verify admin status using RPC function
      const { data: isAdmin, error: adminCheckError } = await supabase
        .rpc('is_admin', { check_user_id: data.user.id });
      
      if (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError);
        
        // Fallback to profile check
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          throw new Error('Failed to verify admin status');
        }
        
        if (!profileData || profileData.user_type !== 'admin') {
          // Sign out if not an admin
          await supabase.auth.signOut();
          
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "This area is restricted to administrators only."
          });
          
          setLoginLoading(false);
          return;
        }
      } else if (!isAdmin) {
        // Sign out if not an admin
        await supabase.auth.signOut();
        
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "This area is restricted to administrators only."
        });
        
        setLoginLoading(false);
        return;
      }
      
      // Refresh the user profile to update the userType in context
      await refreshUserProfile();
      
      // Success - redirect to admin dashboard
      toast({
        title: "Admin login successful",
        description: "Welcome to the administration panel."
      });
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center w-full max-w-md p-8 mx-auto">
        <div className="w-full bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input 
                id="admin-email"
                type="email" 
                placeholder="admin@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input 
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loginLoading}
            >
              {loginLoading ? 'Authenticating...' : 'Admin Login'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              Return to homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

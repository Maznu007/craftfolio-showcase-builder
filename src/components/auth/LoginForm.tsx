
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LoginFormProps {
  onResetPassword: () => void;
}

const LoginForm = ({ onResetPassword }: LoginFormProps) => {
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("Login successful:", data);
      
      // Refresh user profile to get user type
      await refreshUserProfile();
      
      // Check if user is admin using the is_admin function
      const { data: isAdmin, error: adminCheckError } = await supabase
        .rpc('is_admin', { check_user_id: data.user.id });
        
      if (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError);
        // Fallback to profile check if RPC fails
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
        
        if (!profileError && profileData && profileData.user_type === 'admin') {
          toast({
            title: "Logged in successfully",
            description: `Welcome back, ${email}!`,
          });
          navigate('/admin/dashboard');
          return;
        }
      } else if (isAdmin) {
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${email}!`,
        });
        navigate('/admin/dashboard');
        return;
      }
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${email}!`,
      });
      
      // Redirect to portfolio creation if not admin
      navigate('/portfolio/create');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error logging in",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input 
          id="login-email"
          type="email" 
          placeholder="your@email.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <button 
            type="button"
            className="text-xs text-muted-foreground hover:underline" 
            onClick={onResetPassword}
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input 
            id="login-password"
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
      
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;

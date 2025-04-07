
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const SignupForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'free' // Default to free user
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Success!",
          description: "Account created successfully. You are now logged in.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Success!",
          description: "Check your email for the confirmation link.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message,
      });
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email"
          type="email" 
          placeholder="your@email.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input 
          id="signup-password"
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 6 characters
        </p>
      </div>
      
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </div>

      <div className="text-xs text-center text-muted-foreground mt-4 space-y-2">
        <p>By signing up, you agree to our:</p>
        <p><a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a></p>
      </div>
    </form>
  );
};

export default SignupForm;

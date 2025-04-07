
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import AuthContainer from '@/components/auth/AuthContainer';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a hash parameter in the URL, which indicates we're on a valid reset password flow
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "This doesn't appear to be a valid password reset link.",
      });
      // Redirect to auth page after a short delay
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    }
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password should be at least 6 characters.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
      
      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error resetting password",
        description: error.message,
      });
      console.error("Password update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground mt-2">Enter your new password below</p>
      </div>
      
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input 
            id="new-password"
            type="password" 
            placeholder="••••••••" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            minLength={6}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input 
            id="confirm-password"
            type="password" 
            placeholder="••••••••" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            minLength={6}
          />
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </Button>
        </div>
      </form>
    </AuthContainer>
  );
};

export default ResetPassword;

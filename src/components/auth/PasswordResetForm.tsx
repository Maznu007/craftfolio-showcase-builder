
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface PasswordResetFormProps {
  onBack: () => void;
}

const PasswordResetForm = ({ onBack }: PasswordResetFormProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get the current URL's origin for redirection (rather than hardcoding localhost)
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
      onBack();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error resetting password",
        description: error.message,
      });
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground mt-2">Enter your email to receive a password reset link</p>
      </div>
      
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email" 
            placeholder="your@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </div>
        
        <div className="text-center">
          <button 
            type="button"
            className="text-sm text-muted-foreground hover:underline" 
            onClick={onBack}
          >
            Back to login
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetForm;

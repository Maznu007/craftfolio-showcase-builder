
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import AuthContainer from '@/components/auth/AuthContainer';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resetPassword, setResetPassword] = useState(false);
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const defaultTab = location.state?.defaultTab === 'signup' ? 'signup' : 'login';

  if (resetPassword) {
    return <PasswordResetForm onBack={() => setResetPassword(false)} />;
  }

  return (
    <AuthContainer>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Log In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="mt-4">
          <LoginForm onResetPassword={() => setResetPassword(true)} />
        </TabsContent>
        
        <TabsContent value="signup" className="mt-4">
          <SignupForm />
        </TabsContent>
      </Tabs>
    </AuthContainer>
  );
};

export default Auth;

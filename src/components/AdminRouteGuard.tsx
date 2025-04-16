
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, loading, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate('/admin/login');
        return;
      }

      if (userType !== 'admin') {
        toast({
          title: "Access denied",
          description: "You don't have permission to access the admin area",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }
    }
  }, [user, loading, userType, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || userType !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;

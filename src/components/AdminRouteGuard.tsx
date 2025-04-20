
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, loading, userType, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        navigate('/admin/login');
        return;
      }

      try {
        // Double-check admin status directly with the database
        const { data, error } = await supabase
          .rpc('is_admin', { check_user_id: user.id });
        
        if (error) {
          console.error("Error verifying admin status:", error);
          throw error;
        }

        // Cast userType to string to avoid TypeScript error
        // This allows us to safely compare with 'admin' string
        const userTypeString = userType as string;
        const isAdmin = data === true || userTypeString === 'admin';
        
        if (!isAdmin) {
          // Refresh user profile to make sure we have the latest data
          await refreshUserProfile();
          
          // Compare the refreshed userType with 'admin' string
          const refreshedUserType = userType as string;
          if (refreshedUserType !== 'admin') {
            toast({
              title: "Access denied",
              description: "You don't have permission to access the admin area",
              variant: "destructive",
            });
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        toast({
          title: "Access denied",
          description: "You don't have permission to access the admin area",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setIsVerifying(false);
      }
    };

    if (!loading) {
      verifyAdminStatus();
    }
  }, [user, loading, userType, navigate, refreshUserProfile]);

  if (loading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" 
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Cast userType to string to avoid TypeScript error when comparing with 'admin'
  if (!user || (userType as string) !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;


import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userType: 'free' | 'premium' | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  userType: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'free' | 'premium' | null>(null);

  // Function to fetch user profile from the profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      // Use the metadata approach as fallback until profiles table is properly set up
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
      
      // Check if user has premium status in metadata
      if (userData.user?.user_metadata?.user_type) {
        setUserType(userData.user.user_metadata.user_type as 'free' | 'premium');
        return;
      }
      
      // Default to free if no user type is found
      setUserType('free');
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Default to free if there's an error
      setUserType('free');
    }
  };

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch user profile if user is logged in
        if (currentSession?.user) {
          fetchUserProfile(currentSession.user.id);
        } else {
          setUserType(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch user profile if user is logged in
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, userType, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

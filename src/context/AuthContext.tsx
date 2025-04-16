
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userType: 'free' | 'premium' | 'admin' | null;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  userType: null,
  signOut: async () => {},
  refreshUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'free' | 'premium' | 'admin' | null>(null);

  // Function to fetch user profile from the profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First try to fetch from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // Use the metadata approach as fallback
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        
        // Check if user has premium status in metadata
        if (userData.user?.user_metadata?.user_type) {
          setUserType(userData.user.user_metadata.user_type as 'free' | 'premium' | 'admin');
          return;
        }
        
        // Default to free if no user type is found
        setUserType('free');
        return;
      }
      
      console.log('Profile data retrieved:', profileData);
      
      // Set user type from profiles table
      if (profileData && profileData.user_type) {
        setUserType(profileData.user_type as 'free' | 'premium' | 'admin');
      } else {
        setUserType('free');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Default to free if there's an error
      setUserType('free');
    }
  };

  // Function to manually refresh user profile data
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
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
    <AuthContext.Provider value={{ session, user, loading, userType, signOut, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

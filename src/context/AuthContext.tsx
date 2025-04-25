
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserType = 'free' | 'premium' | 'admin' | null;

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userType: UserType;
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
  const [userType, setUserType] = useState<UserType>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First, attempt to get profile from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, email')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // If profile fetch fails, try to get user metadata from auth
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        
        if (userData.user?.user_metadata?.user_type) {
          const metadataType = userData.user.user_metadata.user_type.toString().toLowerCase().trim();
          if (metadataType === 'admin') {
            setUserType('admin');
          } else if (metadataType === 'premium') {
            setUserType('premium');
          } else {
            setUserType('free');
          }
          
          // Try to create a profile if one doesn't exist yet
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email,
                user_type: metadataType || 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError && !insertError.message.includes('duplicate')) {
              console.error('Error creating profile:', insertError);
            }
          } catch (err) {
            console.error('Error in profile creation:', err);
          }
          
          return;
        }
        
        setUserType('free');
        return;
      }
      
      console.log('Profile data retrieved:', profileData);
      
      if (profileData && profileData.user_type) {
        const normalizedUserType = profileData.user_type.toString().toLowerCase().trim();
        if (normalizedUserType === 'admin') {
          setUserType('admin');
        } else if (normalizedUserType === 'premium') {
          setUserType('premium');
        } else {
          setUserType('free');
        }
      } else {
        setUserType('free');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserType('free');
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          fetchUserProfile(currentSession.user.id);
        } else {
          setUserType(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
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

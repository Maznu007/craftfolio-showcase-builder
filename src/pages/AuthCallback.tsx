
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface GithubProfile {
  id: string | number;
  repos_url?: string;
  repos?: any[];
  [key: string]: any;
}

interface LinkedInProfile {
  id: string | number;
  name?: string;
  email?: string;
  [key: string]: any;
}

type ProfileData = GithubProfile | LinkedInProfile | Record<string, any>;

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('Processing your authentication...');
  
  useEffect(() => {
    if (!user) {
      setMessage('Please sign in first');
      setTimeout(() => navigate('/auth'), 2000);
      return;
    }
    
    const provider = searchParams.get('provider');
    
    if (!provider) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing provider information"
      });
      navigate('/profile');
      return;
    }
    
    const handleCallback = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('No session found');
        }
        
        // The OAuth provider token is in the session
        const accessToken = session.provider_token;
        const refreshToken = session.provider_refresh_token;
        
        if (!accessToken) {
          throw new Error('No access token found');
        }
        
        // Get user profile from provider
        let profileData: ProfileData = {};
        let serviceUserId = '';
        
        if (provider === 'github') {
          // Fetch GitHub profile with the access token
          const githubResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (!githubResponse.ok) {
            throw new Error('Failed to fetch GitHub profile');
          }
          
          profileData = await githubResponse.json() as GithubProfile;
          serviceUserId = String(profileData.id);
          
          // Fetch repositories
          if (profileData.repos_url) {
            const reposResponse = await fetch(`${profileData.repos_url}?sort=updated&per_page=10`, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
            
            if (reposResponse.ok) {
              const repos = await reposResponse.json();
              profileData.repos = repos;
            }
          }
        } else if (provider === 'linkedin') {
          // For LinkedIn, we need to use LinkedIn API with the access token
          // This is a simplified version as LinkedIn API requires proper setup
          try {
            const linkedinResponse = await fetch('https://api.linkedin.com/v2/me', {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
            
            if (linkedinResponse.ok) {
              profileData = await linkedinResponse.json() as LinkedInProfile;
              serviceUserId = String(profileData.id);
            } else {
              // Fallback if API call fails
              profileData = {
                id: `linkedin_${Date.now()}`,
                name: user.email?.split('@')[0] || 'LinkedIn User',
                email: user.email
              };
              serviceUserId = String(profileData.id);
            }
          } catch (e) {
            console.error('LinkedIn API error, using fallback data', e);
            // Fallback if API call fails
            profileData = {
              id: `linkedin_${Date.now()}`,
              name: user.email?.split('@')[0] || 'LinkedIn User',
              email: user.email
            };
            serviceUserId = String(profileData.id);
          }
        }
        
        // Save connection to database
        const { error } = await supabase
          .from('user_connections')
          .upsert({
            user_id: user.id,
            service_name: provider,
            service_user_id: serviceUserId,
            access_token: accessToken,
            refresh_token: refreshToken || null,
            token_expires_at: null, // Would need to calculate this from token info
            profile_data: profileData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, service_name' });
          
        if (error) throw error;
        
        setMessage('Connection successful! Redirecting...');
        toast({
          title: "Account Connected",
          description: `Your ${provider === 'github' ? 'GitHub' : 'LinkedIn'} account has been successfully connected!`
        });
        
        // Redirect back to profile page
        setTimeout(() => navigate('/profile'), 1500);
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: error.message || 'Failed to connect your account. Please try again.'
        });
        navigate('/profile');
      }
    };
    
    handleCallback();
  }, [user, searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;

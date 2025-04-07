
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
        // For OAuth providers, we need to extract user info from session
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
        let profileData = {};
        let serviceUserId = '';
        
        if (provider === 'github') {
          // Simulate GitHub profile data since we don't have real API keys in this demo
          profileData = {
            login: 'github_user',
            name: 'GitHub User',
            avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            repos_url: 'https://api.github.com/users/github_user/repos',
            repos: [
              {
                name: 'Portfolio Project',
                description: 'A modern portfolio site built with React',
                html_url: 'https://github.com/github_user/portfolio',
                language: 'TypeScript',
                created_at: '2023-01-15T12:00:00Z',
                updated_at: '2023-03-20T15:30:00Z'
              },
              {
                name: 'E-commerce Store',
                description: 'Full-stack e-commerce site with payment integration',
                html_url: 'https://github.com/github_user/ecommerce',
                language: 'JavaScript',
                created_at: '2022-08-10T09:15:00Z',
                updated_at: '2023-02-05T11:45:00Z'
              }
            ]
          };
          serviceUserId = 'github_123456';
        } else if (provider === 'linkedin') {
          // Simulate LinkedIn profile data
          profileData = {
            id: 'linkedin_123456',
            name: 'LinkedIn User',
            email: 'linkedin_user@example.com',
            picture: 'https://media.licdn.com/dms/image/placeholder.jpg',
            experiences: [
              {
                title: 'Senior Web Developer',
                company: 'Tech Solutions Inc.',
                startDate: '2019-05',
                endDate: 'Present',
                description: 'Leading a team of developers building enterprise web applications.'
              },
              {
                title: 'Web Developer',
                company: 'Digital Agency',
                startDate: '2016-08',
                endDate: '2019-04',
                description: 'Developed responsive websites and web applications for various clients.'
              }
            ],
            skills: [
              'JavaScript', 'React', 'TypeScript', 'Node.js', 'CSS', 'HTML', 
              'UI/UX Design', 'GraphQL', 'REST APIs', 'Git'
            ]
          };
          serviceUserId = 'linkedin_123456';
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
      } catch (error) {
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

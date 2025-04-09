
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Github, Linkedin, Loader2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ServiceConnection } from '@/types/portfolio';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ServiceConnection[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchConnections();
  }, [user, navigate]);
  
  const fetchConnections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your connected accounts."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=github`,
        scopes: 'read:user,repo',
      },
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message
      });
    }
  };
  
  const handleConnectLinkedIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=linkedin`,
        scopes: 'r_liteprofile,r_emailaddress,r_basicprofile',
      },
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message
      });
    }
  };
  
  const handleDisconnect = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', serviceId);
        
      if (error) throw error;
      
      toast({
        title: "Disconnected",
        description: "Account has been disconnected successfully."
      });
      
      fetchConnections();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect account."
      });
    }
  };
  
  const getConnectionDetails = (service: string) => {
    return connections.find(conn => conn.service_name === service);
  };
  
  const githubConnection = getConnectionDetails('github');
  const linkedinConnection = getConnectionDetails('linkedin');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
          
          {loading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>
                    Connect your accounts to import profile data and enhance your portfolios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                      <Github className="h-8 w-8" />
                      <div>
                        <h3 className="font-medium">GitHub</h3>
                        <p className="text-sm text-muted-foreground">Import your projects and repositories</p>
                      </div>
                      {githubConnection && (
                        <Badge variant="outline" className="ml-2">
                          Connected
                        </Badge>
                      )}
                    </div>
                    
                    {githubConnection ? (
                      <div className="w-full md:w-auto">
                        <div className="text-sm mb-2">
                          Connected as: <span className="font-medium">{githubConnection.profile_data?.login || 'User'}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnect(githubConnection.id)}>
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={handleConnectGithub}>
                        <Github className="mr-2 h-4 w-4" />
                        Connect GitHub
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                      <Linkedin className="h-8 w-8" />
                      <div>
                        <h3 className="font-medium">LinkedIn</h3>
                        <p className="text-sm text-muted-foreground">Import your work experience and skills</p>
                      </div>
                      {linkedinConnection && (
                        <Badge variant="outline" className="ml-2">
                          Connected
                        </Badge>
                      )}
                    </div>
                    
                    {linkedinConnection ? (
                      <div className="w-full md:w-auto">
                        <div className="text-sm mb-2">
                          Connected as: <span className="font-medium">{linkedinConnection.profile_data?.name || 'User'}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnect(linkedinConnection.id)}>
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={handleConnectLinkedIn}>
                        <Linkedin className="mr-2 h-4 w-4" />
                        Connect LinkedIn
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-6 mt-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;

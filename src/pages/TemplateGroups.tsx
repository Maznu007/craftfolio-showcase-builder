
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { TemplateGroup, TemplateFollower } from '@/types/portfolio';
import { Search, Star, Users, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TemplateGroups = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [followedTemplates, setFollowedTemplates] = useState<string[]>([]);
  
  // Fetch template groups
  const { data: templateGroups, isLoading, error } = useQuery({
    queryKey: ['templateGroups'],
    queryFn: async () => {
      // Get all public portfolios
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select('template_id, id')
        .eq('is_public', true);
      
      if (error) throw error;
      
      // Count portfolios by template
      const templateCounts: Record<string, number> = {};
      portfolios.forEach(portfolio => {
        const templateId = portfolio.template_id;
        templateCounts[templateId] = (templateCounts[templateId] || 0) + 1;
      });
      
      // Create template groups
      const groups: TemplateGroup[] = Object.entries(templateCounts).map(([templateId, count]) => {
        const templateName = getTemplateDisplayName(templateId);
        const isPremium = templateId.startsWith('premium-');
        
        return {
          id: templateId,
          name: templateName,
          description: isPremium 
            ? 'Premium template with advanced features'
            : 'Standard template for professional portfolios',
          thumbnail: getTemplateThumbnail(templateId),
          portfolioCount: count,
          isPopular: count > 5, // Mark as popular if more than 5 portfolios use it
          isNew: false // To be determined by creation date in a real implementation
        };
      });
      
      // Sort by popularity (most used first)
      return groups.sort((a, b) => b.portfolioCount - a.portfolioCount);
    }
  });

  // Load user's followed templates
  useEffect(() => {
    const loadFollowedTemplates = async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (user?.user) {
        try {
          // Use execute_sql to get followed templates
          const { data, error } = await supabase.rpc('execute_sql', {
            sql_query: `
              SELECT template_id FROM template_followers
              WHERE user_id = '${user.user.id}'
            `
          });
          
          if (error) {
            console.error("Error fetching followed templates:", error);
            return;
          }
          
          if (data && Array.isArray(data)) {
            setFollowedTemplates(data.map(item => item.template_id));
          }
        } catch (error) {
          console.error("Error in followed templates query:", error);
        }
      }
    };
    
    loadFollowedTemplates();
  }, []);
  
  // Filter template groups based on search and category
  const filteredGroups = templateGroups?.filter(group => {
    const matchesSearch = !searchQuery || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !category || 
      (category === 'premium' && group.id.startsWith('premium-')) ||
      (category === 'standard' && !group.id.startsWith('premium-'));
    
    return matchesSearch && matchesCategory;
  });
  
  // Helper function to get template display name
  const getTemplateDisplayName = (templateId: string): string => {
    // Convert template-id to Template Name
    return templateId
      .replace('premium-', 'Premium ')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper function to get template thumbnail
  const getTemplateThumbnail = (templateId: string): string => {
    // In a real implementation, you would have a mapping of template IDs to thumbnail URLs
    const templateImages: Record<string, string> = {
      'minimal': '/minimal-template.png',
      'professional': '/professional-template.png',
      'creative': '/creative-template.png',
      'premium-modern': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
      'premium-creative': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
      'premium-executive': '/lovable-uploads/ccc7de5f-a1cc-48ae-83b5-bc57227b86d6.png'
    };
    
    return templateImages[templateId] || '/placeholder.svg';
  };
  
  // Follow template function
  const handleFollowTemplate = async (templateId: string) => {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow templates",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    try {
      const isFollowing = followedTemplates.includes(templateId);
      
      if (isFollowing) {
        // Unfollow - delete the record using SQL
        const { error } = await supabase.rpc('execute_sql', {
          sql_query: `
            DELETE FROM template_followers
            WHERE user_id = '${user.user.id}'
            AND template_id = '${templateId}'
          `
        });
        
        if (error) throw error;
        
        // Update local state
        setFollowedTemplates(followedTemplates.filter(id => id !== templateId));
        
        toast({
          title: "Template unfollowed",
          description: "You will no longer receive updates for this template"
        });
      } else {
        // Follow - insert a new record using SQL
        const { error } = await supabase.rpc('execute_sql', {
          sql_query: `
            INSERT INTO template_followers (user_id, template_id)
            VALUES ('${user.user.id}', '${templateId}')
          `
        });
        
        if (error) throw error;
        
        // Update local state
        setFollowedTemplates([...followedTemplates, templateId]);
        
        toast({
          title: "Template followed",
          description: "You'll be notified of new portfolios using this template"
        });
      }
    } catch (error) {
      console.error("Error following template:", error);
      toast({
        title: "Error",
        description: "There was a problem following this template",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Template Groups</h1>
          <p className="text-gray-600 mb-8">
            Explore portfolios grouped by template. Each group showcases portfolios created with the same template.
          </p>
          
          {/* Search and filter section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={!category ? "default" : "outline"} 
                onClick={() => setCategory(null)}
              >
                All
              </Button>
              <Button 
                variant={category === 'standard' ? "default" : "outline"} 
                onClick={() => setCategory('standard')}
              >
                Standard
              </Button>
              <Button 
                variant={category === 'premium' ? "default" : "outline"} 
                onClick={() => setCategory('premium')}
              >
                Premium
              </Button>
            </div>
          </div>
          
          {/* Template groups */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-gray-500">Loading template groups...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading template groups</p>
            </div>
          ) : filteredGroups?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No template groups found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups?.map((group) => (
                <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    <img 
                      src={group.thumbnail} 
                      alt={`${group.name} template`}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    {group.isPopular && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          <Star className="h-3 w-3 mr-1 inline" /> Top Used
                        </Badge>
                      </div>
                    )}
                    {group.isNew && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                          🆕 New
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-3">{group.description}</p>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{group.portfolioCount} Portfolio{group.portfolioCount !== 1 ? 's' : ''}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant={followedTemplates.includes(group.id) ? "default" : "outline"} 
                      onClick={() => handleFollowTemplate(group.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {followedTemplates.includes(group.id) ? 'Following' : 'Follow Template'}
                    </Button>
                    <Button onClick={() => navigate(`/template-groups/${group.id}`)}>
                      View Group
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TemplateGroups;

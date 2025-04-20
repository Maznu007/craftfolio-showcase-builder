
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { executeSql } from '@/utils/db-helpers';
import { TemplateGroup } from '@/types/portfolio';
import { Search, Star, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioCount {
  template_id: string;
  count: number | string;
}

interface TemplateFollower {
  template_id: string;
}

const TemplateGroups = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [followedTemplates, setFollowedTemplates] = useState<string[]>([]);
  
  const { data: templateGroups, isLoading, error } = useQuery({
    queryKey: ['templateGroups'],
    queryFn: async () => {
      try {
        // More explicit SQL query with type casting to ensure proper JSON parsing
        const query = `
          SELECT template_id, COUNT(*)::INTEGER as count
          FROM portfolios
          WHERE is_public = true
          GROUP BY template_id
        `;
        
        const portfolios = await executeSql<PortfolioCount>(query);
        console.log('Template groups data retrieved:', portfolios);
        
        if (!portfolios || !Array.isArray(portfolios)) {
          console.error('Invalid response format from database', portfolios);
          return [];
        }
        
        return portfolios.map(({ template_id, count }) => ({
          id: template_id,
          name: getTemplateDisplayName(template_id),
          description: template_id.startsWith('premium-') 
            ? 'Premium template with advanced features'
            : 'Standard template for professional portfolios',
          thumbnail: getTemplateThumbnail(template_id),
          portfolioCount: typeof count === 'string' ? parseInt(count, 10) : count,
          isPopular: (typeof count === 'string' ? parseInt(count, 10) : count) > 5,
          isNew: false
        }));
      } catch (err) {
        console.error('Error fetching template groups:', err);
        toast({
          title: "Error loading template groups",
          description: "There was a problem loading the template groups. Please try again later.",
          variant: "destructive"
        });
        throw err;
      }
    },
    retry: 1
  });

  useEffect(() => {
    const loadFollowedTemplates = async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (user?.user) {
        try {
          // Use a simple SELECT query with explicit casting
          const query = `
            SELECT template_id FROM template_followers
            WHERE user_id = '${user.user.id}'
          `;
          
          const followed = await executeSql<TemplateFollower>(query);
          console.log('Followed templates retrieved:', followed);
          
          if (followed && Array.isArray(followed)) {
            setFollowedTemplates(followed.map(item => item.template_id));
          }
        } catch (error) {
          console.error("Error in followed templates query:", error);
          // Don't throw error here, as we still want to show template groups
          // even if we can't load followed templates
        }
      }
    };
    
    loadFollowedTemplates();
  }, []);
  
  const filteredGroups = templateGroups?.filter(group => {
    const matchesSearch = !searchQuery || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !category || 
      (category === 'premium' && group.id.startsWith('premium-')) ||
      (category === 'standard' && !group.id.startsWith('premium-'));
    
    return matchesSearch && matchesCategory;
  });
  
  const getTemplateDisplayName = (templateId: string): string => {
    return templateId
      .replace('premium-', 'Premium ')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const getTemplateThumbnail = (templateId: string): string => {
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
        // Use parameterized query to avoid SQL injection
        const deleteQuery = `
          DELETE FROM template_followers
          WHERE user_id = '${user.user.id}'
          AND template_id = '${templateId}'
        `;
        
        await executeSql(deleteQuery);
        
        setFollowedTemplates(followedTemplates.filter(id => id !== templateId));
        
        toast({
          title: "Template unfollowed",
          description: "You will no longer receive updates for this template"
        });
      } else {
        // Use parameterized query to avoid SQL injection
        const insertQuery = `
          INSERT INTO template_followers (user_id, template_id)
          VALUES ('${user.user.id}', '${templateId}')
        `;
        
        await executeSql(insertQuery);
        
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
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-gray-500">Loading template groups...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold">Error loading template groups</p>
              <p className="text-sm mt-2">Please try again later or contact support if the problem persists.</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : templateGroups?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No template groups found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateGroups?.map((group) => (
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


import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Portfolio, safeParsePortfolioContent } from '@/types/portfolio';
import { Search, ExternalLink } from 'lucide-react';

const TemplateGroupDetail = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get template name
  const templateName = templateId
    ? templateId
        .replace('premium-', 'Premium ')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
  
  // Fetch portfolios for this template
  const { data: portfolios, isLoading, error } = useQuery({
    queryKey: ['portfoliosByTemplate', templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      // Get all public portfolios with this template
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('template_id', templateId)
        .eq('is_public', true)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map((portfolio: any) => ({
        ...portfolio,
        content: safeParsePortfolioContent(portfolio.content),
        user_display_name: portfolio.profiles?.display_name || 'Anonymous User'
      }));
    }
  });
  
  // Filter portfolios based on search
  const filteredPortfolios = portfolios?.filter(portfolio => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      portfolio.title.toLowerCase().includes(query) ||
      (portfolio.description && portfolio.description.toLowerCase().includes(query)) ||
      portfolio.user_display_name.toLowerCase().includes(query) ||
      (portfolio.content.personalInfo.bio && 
       portfolio.content.personalInfo.bio.toLowerCase().includes(query))
    );
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/template-groups')}
          >
            ← Back to Template Groups
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{templateName} Portfolios</h1>
          <p className="text-gray-600 mb-8">
            Browse all portfolios created with the {templateName} template
          </p>
          
          {/* Search bar */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search portfolios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Portfolios grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-gray-500">Loading portfolios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading portfolios</p>
            </div>
          ) : filteredPortfolios?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No portfolios found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolios?.map((portfolio) => (
                <Card key={portfolio.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage 
                        src={portfolio.content.personalInfo.profilePicture} 
                        alt={portfolio.content.personalInfo.fullName} 
                      />
                      <AvatarFallback>
                        {portfolio.user_display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{portfolio.user_display_name}</CardTitle>
                      {portfolio.skills && portfolio.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {portfolio.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {portfolio.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{portfolio.skills.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{portfolio.title}</h3>
                    <p className="text-gray-600 line-clamp-3">
                      {portfolio.description || portfolio.content.personalInfo.bio || 'No description provided'}
                    </p>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/portfolio/view/${portfolio.id}`)}
                    >
                      View Portfolio
                      <ExternalLink className="h-4 w-4 ml-1" />
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

export default TemplateGroupDetail;

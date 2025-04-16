
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, User, Tag, ArrowUpRight, Loader2, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Navbar from '@/components/Navbar';

type Portfolio = {
  id: string;
  title: string;
  description: string | null;
  template_id: string;
  user_name: string;
  user_id: string;
  skills: string[];
  category: string;
  is_public: boolean;
};

const Community = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Common skills for filtering
  const commonSkills = [
    'React', 'JavaScript', 'TypeScript', 'UI/UX', 'Graphic Design', 
    'Writing', 'Content', 'Frontend', 'Backend', 'FullStack'
  ];

  useEffect(() => {
    fetchPublicPortfolios();
  }, []);

  const fetchPublicPortfolios = async () => {
    setIsLoading(true);
    try {
      // Fetch portfolios that are marked as public
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          id, 
          title, 
          description, 
          template_id, 
          user_id,
          is_public,
          category,
          skills,
          profiles:profiles(display_name)
        `)
        .eq('is_public', true);
      
      if (error) throw error;

      // Transform the data for our frontend needs
      const transformedData: Portfolio[] = data.map((portfolio) => ({
        id: portfolio.id,
        title: portfolio.title,
        description: portfolio.description,
        template_id: portfolio.template_id,
        user_id: portfolio.user_id,
        // Use the actual user name if available, otherwise generate a placeholder
        user_name: portfolio.profiles?.display_name || `User ${portfolio.user_id.substring(0, 4)}`,
        // Use real skills if available, otherwise generate placeholder skills
        skills: portfolio.skills || getRandomSkills(),
        // Use real category if available, otherwise generate a placeholder
        category: portfolio.category || getRandomCategory(),
        is_public: !!portfolio.is_public,
      }));

      setPortfolios(transformedData);
      setFilteredPortfolios(transformedData);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError('Failed to load portfolios. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate random skills for demo purposes
  const getRandomSkills = () => {
    const numberOfSkills = Math.floor(Math.random() * 3) + 1;
    const skills = [];
    for (let i = 0; i < numberOfSkills; i++) {
      const randomIndex = Math.floor(Math.random() * commonSkills.length);
      const skill = commonSkills[randomIndex];
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
    return skills;
  };

  // Helper function to generate a random category for demo purposes
  const getRandomCategory = () => {
    const categories = ['Developer', 'Designer', 'Writer'];
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
  };

  const applyFilters = () => {
    let filtered = [...portfolios];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        portfolio => 
          portfolio.title.toLowerCase().includes(lowerCaseSearch) ||
          portfolio.user_name.toLowerCase().includes(lowerCaseSearch) ||
          (portfolio.description && portfolio.description.toLowerCase().includes(lowerCaseSearch)) ||
          portfolio.skills.some(skill => skill.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(portfolio => portfolio.category === categoryFilter);
    }
    
    // Apply skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(portfolio => 
        selectedSkills.some(skill => portfolio.skills.includes(skill))
      );
    }
    
    setFilteredPortfolios(filtered);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleSkillToggle = (skills: string[]) => {
    setSelectedSkills(skills);
  };

  const handleViewPortfolio = (id: string) => {
    // In a real app, this would navigate to a public view of the portfolio
    navigate(`/portfolio/view/${id}`);
  };

  // Apply filters when search term, category, or skills change
  useEffect(() => {
    // We don't auto-apply filters as the user types now
    // Instead, we wait for the Search button click or Enter key
  }, [searchTerm, categoryFilter, selectedSkills]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Community Portfolios</h1>
        
        {/* Search and Filter Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Bar */}
            <div className="col-span-1 md:col-span-3">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search by name, skills, or keywords" 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-gray-700 hover:bg-gray-800 text-white"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium mb-2">Category</h3>
              <RadioGroup 
                defaultValue="all" 
                className="flex flex-col space-y-1"
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <label htmlFor="all" className="text-sm cursor-pointer">All Categories</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Developer" id="developer" />
                  <label htmlFor="developer" className="text-sm cursor-pointer">Developer</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Designer" id="designer" />
                  <label htmlFor="designer" className="text-sm cursor-pointer">Designer</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Writer" id="writer" />
                  <label htmlFor="writer" className="text-sm cursor-pointer">Writer</label>
                </div>
              </RadioGroup>
            </div>

            {/* Skills Filter */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-medium mb-2">Skills</h3>
              <ToggleGroup 
                type="multiple" 
                className="flex flex-wrap gap-2"
                value={selectedSkills}
                onValueChange={handleSkillToggle}
              >
                {commonSkills.map((skill) => (
                  <ToggleGroupItem 
                    key={skill} 
                    value={skill} 
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs"
                  >
                    {skill}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setSelectedSkills([]);
                setFilteredPortfolios(portfolios);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchPublicPortfolios()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-500">{filteredPortfolios.length} {filteredPortfolios.length === 1 ? 'portfolio' : 'portfolios'} found</p>
            </div>
            
            {filteredPortfolios.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No portfolios match your search criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setSelectedSkills([]);
                    handleSearch();
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolios.map((portfolio) => (
                  <Card key={portfolio.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{portfolio.title}</CardTitle>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <User className="h-3 w-3 mr-1" /> {portfolio.user_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={
                            portfolio.category === 'Developer' ? 'default' :
                            portfolio.category === 'Designer' ? 'secondary' : 'outline'
                          }>
                            {portfolio.category}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {portfolio.description || 'No description provided.'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {portfolio.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleViewPortfolio(portfolio.id)}
                      >
                        View Portfolio
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Community;

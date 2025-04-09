
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LockIcon, FileUp, Github, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ImportDataModal from '@/components/ImportDataModal';
import { PortfolioContent, safeParsePortfolioContent } from '@/types/portfolio';
import { Json } from '@/integrations/supabase/types';

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design focusing on content',
    previewImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
    isPremium: false
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Traditional format ideal for corporate roles',
    previewImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
    isPremium: false
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful and dynamic layout for creative fields',
    previewImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
    isPremium: false
  },
  {
    id: 'premium-modern',
    name: 'Modern Premium',
    description: 'Sleek, contemporary design with advanced layout',
    previewImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
    isPremium: true
  },
  {
    id: 'premium-executive',
    name: 'Executive Premium',
    description: 'Elegant design for senior professionals and executives',
    previewImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
    isPremium: true
  },
  {
    id: 'premium-creative',
    name: 'Creative Premium',
    description: 'Bold, innovative design for creative industries',
    previewImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
    isPremium: true
  }
];

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' },
  { value: 'native', label: 'Native (For Languages)' },
];

const Portfolio = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPortfolioId, setEditPortfolioId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [education, setEducation] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [awards, setAwards] = useState('');
  const [volunteering, setVolunteering] = useState('');
  
  const [languages, setLanguages] = useState([
    { name: 'English', proficiency: 'native' }
  ]);
  
  const [computerSkills, setComputerSkills] = useState([
    { name: 'MS Office', proficiency: 'professional' }
  ]);
  
  const [projects, setProjects] = useState<Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    repoUrl?: string;
    startDate?: string;
    endDate?: string;
  }>>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.email) {
      setEmail(user.email);
    }

    const storedPortfolioId = localStorage.getItem('editPortfolioId');
    if (storedPortfolioId) {
      setEditPortfolioId(storedPortfolioId);
      setIsEditing(true);
      loadPortfolioData(storedPortfolioId);
    }
  }, [user, navigate]);

  const loadPortfolioData = async (portfolioId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Portfolio not found");

      setTitle(data.title);
      setDescription(data.description || '');
      setSelectedTemplate(data.template_id);
      setStep(2);

      const content = safeParsePortfolioContent(data.content);
      
      setFullName(content.personalInfo?.fullName || '');
      setEmail(content.personalInfo?.email || user?.email || '');
      setBio(content.personalInfo?.bio || '');
      setProfilePicture(content.personalInfo?.profilePicture || '');
      setEducation(content.education || '');
      setWorkExperience(content.workExperience || '');
      setAwards(content.awards || '');
      setVolunteering(content.volunteering || '');
      
      if (content.languages && Array.isArray(content.languages) && content.languages.length > 0) {
        setLanguages(content.languages);
      }
      
      if (content.computerSkills && Array.isArray(content.computerSkills) && content.computerSkills.length > 0) {
        setComputerSkills(content.computerSkills);
      }
      
      if (content.projects && Array.isArray(content.projects) && content.projects.length > 0) {
        setProjects(content.projects);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
      toast({
        variant: "destructive",
        title: "Error loading portfolio",
        description: "Could not load the portfolio for editing. Please try again."
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const canAccessTemplate = (template: any) => {
    if (!template.isPremium) return true;
    return userType === 'premium';
  };

  const handleAddLanguage = () => {
    setLanguages([...languages, { name: '', proficiency: 'beginner' }]);
  };

  const handleUpdateLanguage = (index: number, field: string, value: any) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    setLanguages(updatedLanguages);
  };

  const handleRemoveLanguage = (index: number) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  const handleAddComputerSkill = () => {
    setComputerSkills([...computerSkills, { name: '', proficiency: 'beginner' }]);
  };

  const handleUpdateComputerSkill = (index: number, field: string, value: any) => {
    const updatedSkills = [...computerSkills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    setComputerSkills(updatedSkills);
  };

  const handleRemoveComputerSkill = (index: number) => {
    if (computerSkills.length > 1) {
      setComputerSkills(computerSkills.filter((_, i) => i !== index));
    }
  };
  
  const handleAddProject = () => {
    setProjects([...projects, {
      name: '',
      description: '',
      technologies: []
    }]);
  };
  
  const handleUpdateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    setProjects(updatedProjects);
  };
  
  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    
    if (template && template.isPremium && userType !== 'premium') {
      toast({
        variant: "destructive",
        title: "Premium Template",
        description: "This template is only available to premium users. Please upgrade your account to access it.",
      });
      return;
    }
    
    setSelectedTemplate(templateId);
    setStep(2);
  };
  
  const handleImportData = (importedData: any) => {
    if (importedData.workExperience) {
      setWorkExperience(importedData.workExperience);
    }
    
    if (importedData.computerSkills && importedData.computerSkills.length > 0) {
      setComputerSkills(importedData.computerSkills);
    }
    
    if (importedData.projects && importedData.projects.length > 0) {
      setProjects(importedData.projects);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please provide a title for your portfolio.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const portfolioContent: PortfolioContent = {
        personalInfo: {
          fullName,
          email,
          bio,
          profilePicture
        },
        education,
        workExperience,
        awards,
        volunteering,
        languages,
        computerSkills,
        projects
      };
      
      if (isEditing && editPortfolioId) {
        const { error } = await supabase
          .from('portfolios')
          .update({
            title,
            description,
            template_id: selectedTemplate,
            content: portfolioContent as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('id', editPortfolioId);
          
        if (error) throw error;
        
        toast({
          title: "Portfolio updated",
          description: "Your portfolio has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('portfolios')
          .insert({
            title,
            description,
            template_id: selectedTemplate,
            content: portfolioContent as unknown as Json,
            user_id: user?.id
          });
          
        if (error) throw error;
        
        toast({
          title: "Portfolio saved",
          description: "Your portfolio has been saved successfully.",
        });
      }
      
      setSaveSuccess(true);
      
      localStorage.removeItem('editPortfolioId');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error("Error saving portfolio:", error);
      toast({
        variant: "destructive",
        title: "Error saving portfolio",
        description: error.message || "There was an error saving your portfolio.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isEditing) {
      localStorage.removeItem('editPortfolioId');
      navigate('/dashboard');
    } else {
      setStep(1);
    }
  };

  if (!user) {
    return null;
  }

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Loading Portfolio...</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {isEditing ? 'Edit Your Portfolio' : 'Create Your Portfolio'}
          </h1>
          
          {step === 1 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TEMPLATES.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`relative cursor-pointer transition-all ${selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'} ${template.isPremium && userType !== 'premium' ? 'opacity-70' : ''}`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    {template.isPremium && userType !== 'premium' && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-1">
                        <LockIcon size={16} />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {template.isPremium && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Premium</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 aspect-video bg-gray-100 flex items-center justify-center overflow-hidden rounded-md">
                        <img 
                          src={template.previewImage} 
                          alt={`${template.name} template preview`}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Template+Preview'}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {userType !== 'premium' && (
                <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800">Premium Templates Available</h3>
                  <p className="text-yellow-700 mt-1">Upgrade to a premium account to access our exclusive templates and features.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white hover:text-white"
                    onClick={() => navigate('/upgrade')}
                  >
                    Upgrade Now
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{isEditing ? 'Edit Portfolio Details' : 'Portfolio Details'}</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Portfolio Title</Label>
                    <Input 
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Professional Portfolio"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your portfolio and its purpose..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="johndoe@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a brief description about yourself..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profilePicture">Profile Picture URL</Label>
                    <Input 
                      id="profilePicture"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      placeholder="https://example.com/your-image.jpg"
                    />
                    {profilePicture && (
                      <div className="mt-2 w-20 h-20 overflow-hidden rounded-full border">
                        <img 
                          src={profilePicture} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error'}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Textarea 
                      id="education"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="List your educational background..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workExperience">Work Experience</Label>
                    <Textarea 
                      id="workExperience"
                      value={workExperience}
                      onChange={(e) => setWorkExperience(e.target.value)}
                      placeholder="Describe your work experience..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="awards">Awards & Achievements</Label>
                    <Textarea 
                      id="awards"
                      value={awards}
                      onChange={(e) => setAwards(e.target.value)}
                      placeholder="List any awards or achievements..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Languages</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddLanguage}
                      >
                        Add Language
                      </Button>
                    </div>
                    
                    {languages.map((language, index) => (
                      <div key={index} className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`language-${index}`}>Language</Label>
                          <Input 
                            id={`language-${index}`}
                            value={language.name}
                            onChange={(e) => handleUpdateLanguage(index, 'name', e.target.value)}
                            placeholder="e.g., Spanish"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`language-level-${index}`}>Proficiency</Label>
                          <Select 
                            value={language.proficiency}
                            onValueChange={(value) => handleUpdateLanguage(index, 'proficiency', value)}
                          >
                            <SelectTrigger id={`language-level-${index}`}>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROFICIENCY_LEVELS.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveLanguage(index)}
                          disabled={languages.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Computer Skills</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddComputerSkill}
                      >
                        Add Skill
                      </Button>
                    </div>
                    
                    {computerSkills.map((skill, index) => (
                      <div key={index} className="flex gap-4 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`skill-${index}`}>Skill</Label>
                          <Input 
                            id={`skill-${index}`}
                            value={skill.name}
                            onChange={(e) => handleUpdateComputerSkill(index, 'name', e.target.value)}
                            placeholder="e.g., Adobe Suite"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`skill-level-${index}`}>Proficiency</Label>
                          <Select 
                            value={skill.proficiency}
                            onValueChange={(value) => handleUpdateComputerSkill(index, 'proficiency', value)}
                          >
                            <SelectTrigger id={`skill-level-${index}`}>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROFICIENCY_LEVELS.filter(level => level.value !== 'native').map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveComputerSkill(index)}
                          disabled={computerSkills.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Projects</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddProject}
                      >
                        Add Project
                      </Button>
                    </div>
                    
                    {projects.map((project, index) => (
                      <div key={index} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Project {index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveProject(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`project-name-${index}`}>Name</Label>
                          <Input 
                            id={`project-name-${index}`}
                            value={project.name}
                            onChange={(e) => handleUpdateProject(index, 'name', e.target.value)}
                            placeholder="Project Name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`project-desc-${index}`}>Description</Label>
                          <Textarea 
                            id={`project-desc-${index}`}
                            value={project.description}
                            onChange={(e) => handleUpdateProject(index, 'description', e.target.value)}
                            placeholder="Describe your project..."
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`project-tech-${index}`}>Technologies</Label>
                          <Input 
                            id={`project-tech-${index}`}
                            value={project.technologies?.join(', ')}
                            onChange={(e) => handleUpdateProject(
                              index, 
                              'technologies', 
                              e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                            )}
                            placeholder="React, TypeScript, Node.js"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`project-url-${index}`}>Project URL</Label>
                            <Input 
                              id={`project-url-${index}`}
                              value={project.url || ''}
                              onChange={(e) => handleUpdateProject(index, 'url', e.target.value)}
                              placeholder="https://myproject.com"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`project-repo-${index}`}>Repository URL</Label>
                            <Input 
                              id={`project-repo-${index}`}
                              value={project.repoUrl || ''}
                              onChange={(e) => handleUpdateProject(index, 'repoUrl', e.target.value)}
                              placeholder="https://github.com/username/repo"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {projects.length === 0 && (
                      <div className="text-center py-4 border rounded-md bg-gray-50">
                        <p className="text-gray-500">No projects added yet. Add a project or import from GitHub.</p>
                        <div className="flex gap-2 justify-center mt-2">
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddProject}
                            className="mt-2"
                          >
                            Add Project Manually
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="volunteering">Volunteering</Label>
                    <Textarea 
                      id="volunteering"
                      value={volunteering}
                      onChange={(e) => setVolunteering(e.target.value)}
                      placeholder="Describe any volunteer experience..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-between space-x-4 pt-4">
                    <Button 
                      variant="outline"
                      type="button"
                      onClick={handleBack}
                    >
                      {isEditing ? 'Back to Dashboard' : 'Back to Templates'}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading || saveSuccess}
                    >
                      {loading ? 'Saving...' : saveSuccess ? 'Saved!' : isEditing ? 'Update Portfolio' : 'Save Portfolio'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-6 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 CRAFTFOLIO. All rights reserved.</p>
        </div>
      </footer>
      
      <ImportDataModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        userId={user?.id || ''}
        onDataImport={handleImportData}
      />
    </div>
  );
};

export default Portfolio;

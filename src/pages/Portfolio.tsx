
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LockIcon } from 'lucide-react';

// Template options
const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design focusing on content',
    previewImage: 'https://via.placeholder.com/150?text=Minimal',
    isPremium: false
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Traditional format ideal for corporate roles',
    previewImage: 'https://via.placeholder.com/150?text=Professional',
    isPremium: false
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful and dynamic layout for creative fields',
    previewImage: 'https://via.placeholder.com/150?text=Creative',
    isPremium: false
  },
  {
    id: 'premium-modern',
    name: 'Modern Premium',
    description: 'Sleek, contemporary design with advanced layout',
    previewImage: 'https://via.placeholder.com/150?text=Premium+Modern',
    isPremium: true
  },
  {
    id: 'premium-executive',
    name: 'Executive Premium',
    description: 'Elegant design for senior professionals and executives',
    previewImage: 'https://via.placeholder.com/150?text=Premium+Executive',
    isPremium: true
  },
  {
    id: 'premium-creative',
    name: 'Creative Premium',
    description: 'Bold, innovative design for creative industries',
    previewImage: 'https://via.placeholder.com/150?text=Premium+Creative',
    isPremium: true
  }
];

// Proficiency levels
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
  const [step, setStep] = useState(1); // 1: Template selection, 2: Details form
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [awards, setAwards] = useState('');
  const [volunteering, setVolunteering] = useState('');
  
  // Skills sections
  const [languages, setLanguages] = useState([
    { name: 'English', proficiency: 'native' }
  ]);
  
  const [computerSkills, setComputerSkills] = useState([
    { name: 'MS Office', proficiency: 'professional' }
  ]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.email) {
      setEmail(user.email);
    }
  }, [user, navigate]);

  // Check if template is premium and if user can access it
  const canAccessTemplate = (template) => {
    if (!template.isPremium) return true;
    return userType === 'premium';
  };

  const handleAddLanguage = () => {
    setLanguages([...languages, { name: '', proficiency: 'beginner' }]);
  };

  const handleUpdateLanguage = (index, field, value) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index][field] = value;
    setLanguages(updatedLanguages);
  };

  const handleRemoveLanguage = (index) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  const handleAddComputerSkill = () => {
    setComputerSkills([...computerSkills, { name: '', proficiency: 'beginner' }]);
  };

  const handleUpdateComputerSkill = (index, field, value) => {
    const updatedSkills = [...computerSkills];
    updatedSkills[index][field] = value;
    setComputerSkills(updatedSkills);
  };

  const handleRemoveComputerSkill = (index) => {
    if (computerSkills.length > 1) {
      setComputerSkills(computerSkills.filter((_, i) => i !== index));
    }
  };

  const handleSelectTemplate = (templateId) => {
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

  const handleSubmit = async (e) => {
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
      // Prepare portfolio data
      const portfolioContent = {
        personalInfo: {
          fullName,
          email,
        },
        education,
        workExperience,
        awards,
        volunteering,
        languages,
        computerSkills,
      };
      
      // Save portfolio to Supabase
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          title,
          description,
          template_id: selectedTemplate,
          content: portfolioContent,
          user_id: user.id
        });
      
      if (error) throw error;
      
      toast({
        title: "Portfolio saved",
        description: "Your portfolio has been saved successfully.",
      });
      
      setSaveSuccess(true);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
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
    setStep(1);
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create Your Portfolio</h1>
          
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
                      <div className="mb-3 aspect-video bg-gray-100 flex items-center justify-center">
                        <img 
                          src={template.previewImage} 
                          alt={`${template.name} template preview`}
                          className="max-w-full max-h-full"
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
                <CardTitle>Portfolio Details</CardTitle>
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
                  
                  {/* Languages Section */}
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
                  
                  {/* Computer Skills Section */}
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
                      Back to Templates
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading || saveSuccess}
                    >
                      {loading ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Portfolio'}
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
    </div>
  );
};

export default Portfolio;

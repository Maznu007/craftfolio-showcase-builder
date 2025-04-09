
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { ServiceConnection } from '@/types/portfolio';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onDataImport: (data: any) => void;
}

interface ImportOption {
  id: string;
  name: string;
  description: string;
  source: 'github' | 'linkedin';
  type: 'projects' | 'experience' | 'skills';
  selected: boolean;
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose, userId, onDataImport }) => {
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [connections, setConnections] = useState<ServiceConnection[]>([]);
  const [importOptions, setImportOptions] = useState<ImportOption[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen, userId]);
  
  const fetchConnections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      setConnections(data || []);
      generateImportOptions(data || []);
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
  
  const generateImportOptions = (connections: ServiceConnection[]) => {
    const options: ImportOption[] = [];
    
    const githubConn = connections.find(c => c.service_name === 'github');
    const linkedinConn = connections.find(c => c.service_name === 'linkedin');
    
    if (githubConn) {
      options.push({
        id: 'github-projects',
        name: 'GitHub Projects',
        description: 'Import project details from your GitHub repositories',
        source: 'github',
        type: 'projects',
        selected: false
      });
    }
    
    if (linkedinConn) {
      options.push({
        id: 'linkedin-experience',
        name: 'LinkedIn Work Experience',
        description: 'Import your work experience from LinkedIn',
        source: 'linkedin',
        type: 'experience',
        selected: false
      });
      
      options.push({
        id: 'linkedin-skills',
        name: 'LinkedIn Skills',
        description: 'Import your professional skills from LinkedIn',
        source: 'linkedin',
        type: 'skills',
        selected: false
      });
    }
    
    setImportOptions(options);
  };
  
  const toggleOption = (id: string) => {
    setImportOptions(prev => 
      prev.map(option => 
        option.id === id 
          ? { ...option, selected: !option.selected } 
          : option
      )
    );
  };
  
  const handleImport = async () => {
    const selectedOptions = importOptions.filter(opt => opt.selected);
    
    if (selectedOptions.length === 0) {
      toast({
        variant: "default",
        title: "No options selected",
        description: "Please select at least one data source to import."
      });
      return;
    }
    
    setImporting(true);
    
    try {
      const importData: any = {};
      
      for (const option of selectedOptions) {
        const connection = connections.find(c => c.service_name === option.source);
        
        if (!connection) continue;
        
        switch (option.id) {
          case 'github-projects':
            importData.projects = connection.profile_data?.repos?.map((repo: any) => ({
              name: repo.name,
              description: repo.description,
              technologies: [repo.language],
              repoUrl: repo.html_url,
              startDate: repo.created_at,
              endDate: repo.updated_at
            })) || [];
            break;
            
          case 'linkedin-experience':
            const experiences = connection.profile_data?.experiences || [];
            importData.workExperience = experiences.map((exp: any) => 
              `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n${exp.description || ''}`
            ).join('\n\n');
            break;
            
          case 'linkedin-skills':
            const skills = connection.profile_data?.skills || [];
            importData.computerSkills = skills.map((skill: string) => ({
              name: skill,
              proficiency: 'intermediate'
            }));
            break;
        }
      }
      
      onDataImport(importData);
      
      toast({
        title: "Data Imported",
        description: "Your data has been successfully imported into your portfolio."
      });
      
      onClose();
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "There was an error importing your data. Please try again."
      });
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Import information from your connected accounts to enhance your portfolio.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : importOptions.length === 0 ? (
          <div className="py-6">
            <p className="text-center text-gray-500">
              No connected accounts found. Connect GitHub or LinkedIn from your profile settings to import data.
            </p>
            <Button 
              className="mx-auto mt-4 block" 
              variant="outline" 
              onClick={() => {
                onClose();
                window.location.href = '/profile';
              }}
            >
              Go to Profile Settings
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <div className="space-y-4">
              {importOptions.map(option => (
                <div 
                  key={option.id} 
                  className="flex items-start space-x-3 p-3 rounded-md border hover:bg-gray-50 transition-colors"
                >
                  <Checkbox 
                    id={option.id} 
                    checked={option.selected}
                    onCheckedChange={() => toggleOption(option.id)}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor={option.id}
                      className="font-medium cursor-pointer"
                    >
                      {option.name}
                    </Label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={importing || importOptions.filter(o => o.selected).length === 0}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Import Selected Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDataModal;

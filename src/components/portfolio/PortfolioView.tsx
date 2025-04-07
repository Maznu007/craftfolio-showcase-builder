
import React, { useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, ExternalLink, Github } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Portfolio } from '@/types/portfolio';

interface PortfolioViewProps {
  portfolio: Portfolio;
  onClose: () => void;
}

const proficiencyLabels: Record<string, string> = {
  'beginner': 'BEGINNER',
  'intermediate': 'INTERMEDIATE',
  'advanced': 'ADVANCED',
  'professional': 'PROFESSIONAL',
  'native': 'NATIVE'
};

const PortfolioView: React.FC<PortfolioViewProps> = ({ portfolio, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const templateClasses = {
    'minimal': 'bg-white',
    'professional': 'bg-gray-50',
    'creative': 'bg-yellow-50',
    'premium-modern': 'bg-blue-50',
    'premium-executive': 'bg-slate-50',
    'premium-creative': 'bg-pink-50',
  };

  const handleDownloadPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: 1,
      filename: `${portfolio.title.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    if (element) {
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
          <CardTitle>{portfolio.title}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent 
          ref={contentRef} 
          id="portfolio-content" 
          className={`p-6 ${templateClasses[portfolio.template_id as keyof typeof templateClasses] || 'bg-white'}`}
        >
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {portfolio.content.personalInfo.profilePicture && (
                <div className="w-28 h-28 rounded-full overflow-hidden flex-shrink-0 border">
                  <img 
                    src={portfolio.content.personalInfo.profilePicture} 
                    alt={portfolio.content.personalInfo.fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Profile'}
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{portfolio.content.personalInfo.fullName}</h2>
                <p className="text-gray-600">{portfolio.content.personalInfo.email}</p>
                
                {portfolio.content.personalInfo.bio && (
                  <p className="mt-3 text-gray-700">{portfolio.content.personalInfo.bio}</p>
                )}
              </div>
            </div>
            
            {portfolio.content.education && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Education</h3>
                <p className="whitespace-pre-line">{portfolio.content.education}</p>
              </div>
            )}
            
            {portfolio.content.workExperience && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Work Experience</h3>
                <p className="whitespace-pre-line">{portfolio.content.workExperience}</p>
              </div>
            )}
            
            {portfolio.content.projects && portfolio.content.projects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Projects</h3>
                <div className="space-y-4">
                  {portfolio.content.projects.map((project, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-lg">{project.name}</h4>
                        <div className="flex gap-2">
                          {project.url && (
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {project.repoUrl && (
                            <a 
                              href={project.repoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 my-2">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies?.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {portfolio.content.awards && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Awards & Achievements</h3>
                <p className="whitespace-pre-line">{portfolio.content.awards}</p>
              </div>
            )}
            
            {portfolio.content.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Languages</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.content.languages.map((language, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{language.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {proficiencyLabels[language.proficiency] || language.proficiency.toUpperCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {portfolio.content.computerSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Computer Skills</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.content.computerSkills.map((skill, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{skill.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {proficiencyLabels[skill.proficiency] || skill.proficiency.toUpperCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {portfolio.content.volunteering && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Volunteering</h3>
                <p className="whitespace-pre-line">{portfolio.content.volunteering}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-4 flex justify-between">
          <div className="text-sm text-gray-500">
            Created: {new Date(portfolio.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleDownloadPDF}>Download PDF</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PortfolioView;


import React, { useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, X, ExternalLink, Github, Briefcase, GraduationCap, Award, Languages, Code, Heart } from 'lucide-react';
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
    'minimal': 'bg-[#f8f3e6]',
    'professional': 'bg-white',
    'creative': 'bg-gradient-to-r from-yellow-50 to-pink-50',
    'premium-modern': 'bg-gradient-to-br from-blue-50 to-purple-50',
    'premium-executive': 'bg-gradient-to-r from-slate-50 to-gray-100',
    'premium-creative': 'bg-gradient-to-br from-pink-50 to-orange-50',
  };

  const templateStyles = {
    'minimal': {
      headingClass: 'text-2xl font-bold mb-2 text-gray-800',
      sectionClass: 'border-b border-gray-300 pb-2 mb-3 text-lg font-semibold',
      iconColor: 'text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      dividerClass: 'w-full h-px bg-amber-200 my-2',
    },
    'professional': {
      headingClass: 'text-2xl font-bold mb-2 text-gray-800',
      sectionClass: 'border-b border-blue-200 pb-2 mb-3 text-lg font-semibold text-blue-900',
      iconColor: 'text-blue-700',
      badgeClass: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      dividerClass: 'w-full h-px bg-blue-200 my-2',
    },
    'creative': {
      headingClass: 'text-3xl font-bold mb-2 text-orange-700',
      sectionClass: 'border-b-2 border-orange-300 pb-2 mb-3 text-xl font-semibold text-orange-600',
      iconColor: 'text-orange-500',
      badgeClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      dividerClass: 'w-full h-1 bg-gradient-to-r from-orange-300 to-yellow-300 my-2 rounded-full',
    },
    'premium-modern': {
      headingClass: 'text-3xl font-bold mb-2 text-indigo-700',
      sectionClass: 'border-b-0 pb-2 mb-3 text-xl font-semibold text-indigo-600 flex items-center gap-2',
      iconColor: 'text-indigo-500',
      badgeClass: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      dividerClass: 'w-full h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 my-2 rounded-full',
    },
    'premium-executive': {
      headingClass: 'text-2xl font-bold mb-2 text-gray-900',
      sectionClass: 'border-b border-gray-300 pb-2 mb-3 text-lg font-semibold text-gray-800',
      iconColor: 'text-gray-700',
      badgeClass: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      dividerClass: 'w-full h-px bg-gray-300 my-2',
    },
    'premium-creative': {
      headingClass: 'text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent',
      sectionClass: 'border-b-0 pb-2 mb-3 text-xl font-semibold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2',
      iconColor: 'text-pink-500',
      badgeClass: 'bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 hover:from-pink-200 hover:to-orange-200',
      dividerClass: 'w-full h-1 bg-gradient-to-r from-pink-300 to-orange-300 my-2 rounded-full',
    },
  };

  // Get the current template style or default to minimal
  const currentTemplate = portfolio.template_id as keyof typeof templateStyles;
  const style = templateStyles[currentTemplate] || templateStyles['minimal'];

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

  const getHeaderStyle = () => {
    if (currentTemplate === 'premium-creative') {
      return 'bg-gradient-to-r from-pink-200 to-orange-200';
    } else if (currentTemplate === 'premium-modern') {
      return 'bg-gradient-to-r from-blue-100 to-indigo-100';
    } else if (currentTemplate === 'creative') {
      return 'bg-gradient-to-r from-yellow-100 to-orange-100';
    }
    return 'bg-white';
  };

  // Get decoration elements based on the template
  const getDecorations = () => {
    if (currentTemplate === 'creative' || currentTemplate === 'premium-creative') {
      return (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200 rounded-full -ml-8 -mb-8 opacity-30"></div>
        </>
      );
    } else if (currentTemplate === 'premium-modern') {
      return (
        <>
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-200 rounded-full -mr-20 -mt-20 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 rounded-full -ml-16 -mb-16 opacity-20"></div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className={`flex flex-row items-center justify-between sticky top-0 z-10 border-b ${getHeaderStyle()}`}>
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
          className={`p-6 relative ${templateClasses[portfolio.template_id as keyof typeof templateClasses] || 'bg-white'}`}
        >
          {getDecorations()}
          
          <div className="space-y-8 relative z-10">
            <div className={`flex flex-col md:flex-row gap-6 items-start ${currentTemplate === 'premium-creative' ? 'bg-white/50 p-4 rounded-lg shadow-sm' : ''}`}>
              {portfolio.content.personalInfo.profilePicture && (
                <div className={`overflow-hidden flex-shrink-0 border ${
                  currentTemplate === 'premium-modern' || currentTemplate === 'premium-creative' 
                    ? 'w-32 h-32 rounded-full ring-4 ring-offset-2 ' + (currentTemplate === 'premium-modern' ? 'ring-indigo-300' : 'ring-pink-300')
                    : 'w-28 h-28 rounded-full'
                }`}>
                  <img 
                    src={portfolio.content.personalInfo.profilePicture} 
                    alt={portfolio.content.personalInfo.fullName} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Profile'}
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className={style.headingClass}>{portfolio.content.personalInfo.fullName}</h2>
                <p className="text-gray-600">{portfolio.content.personalInfo.email}</p>
                
                {portfolio.content.personalInfo.bio && (
                  <p className="mt-3 text-gray-700">{portfolio.content.personalInfo.bio}</p>
                )}
              </div>
            </div>
            
            {portfolio.content.education && (
              <div>
                <h3 className={style.sectionClass}>
                  <GraduationCap className={`inline-block mr-2 h-5 w-5 ${style.iconColor}`} />
                  Education
                </h3>
                <div className={style.dividerClass}></div>
                <p className="whitespace-pre-line">{portfolio.content.education}</p>
              </div>
            )}
            
            {portfolio.content.workExperience && (
              <div>
                <h3 className={style.sectionClass}>
                  <Briefcase className={`inline-block mr-2 h-5 w-5 ${style.iconColor}`} />
                  Work Experience
                </h3>
                <div className={style.dividerClass}></div>
                <p className="whitespace-pre-line">{portfolio.content.workExperience}</p>
              </div>
            )}
            
            {portfolio.content.projects && portfolio.content.projects.length > 0 && (
              <div>
                <h3 className={style.sectionClass}>
                  <Code className={`inline-block mr-2 h-5 w-5 ${style.iconColor}`} />
                  Projects
                </h3>
                <div className={style.dividerClass}></div>
                <div className="space-y-4">
                  {portfolio.content.projects.map((project, index) => (
                    <div key={index} className={`border rounded-md p-4 ${
                      currentTemplate === 'premium-modern' ? 'bg-white/60 shadow-sm' : 
                      currentTemplate === 'premium-creative' ? 'bg-white/70 shadow-sm' : ''
                    }`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-lg">{project.name}</h4>
                        <div className="flex gap-2">
                          {project.url && (
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`${style.iconColor} hover:opacity-80`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {project.repoUrl && (
                            <a 
                              href={project.repoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`${style.iconColor} hover:opacity-80`}
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 my-2">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies?.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className={style.badgeClass}>
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
                <h3 className={style.sectionClass}>
                  <Award className={`inline-block mr-2 h-5 w-5 ${style.iconColor}`} />
                  Awards & Achievements
                </h3>
                <div className={style.dividerClass}></div>
                <p className="whitespace-pre-line">{portfolio.content.awards}</p>
              </div>
            )}
            
            {portfolio.content.languages.length > 0 && (
              <div>
                <h3 className={style.sectionClass}>
                  <Languages className={`inline-block mr-2 h-5 w-5 ${style.iconColor}`} />
                  Languages
                </h3>
                <div className={style.dividerClass}></div>
                <ul className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                  currentTemplate === 'premium-modern' || currentTemplate === 'premium-creative' ? 'mt-4' : ''
                }`}>
                  {portfolio.content.languages.map((language, index) => (
                    <li key={index} className={`flex justify-between items-center ${
                      (currentTemplate === 'premium-modern' || currentTemplate === 'premium-creative') 
                        ? 'bg-white/60 p-2 rounded shadow-sm' : ''
                    }`}>
                      <span className="font-medium">{language.name}</span>
                      <Badge variant="outline" className={style.badgeClass}>
                        {proficiencyLabels[language.proficiency] || language.proficiency.toUpperCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {portfolio.content.computerSkills.length > 0 && (
              <div>
                <h3 className={style.sectionClass}>
                  <Code className={`inline-block mr-2 h-5 w-5 ${style.iconColor}`} />
                  Computer Skills
                </h3>
                <div className={style.dividerClass}></div>
                <ul className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                  currentTemplate === 'premium-modern' || currentTemplate === 'premium-creative' ? 'mt-4' : ''
                }`}>
                  {portfolio.content.computerSkills.map((skill, index) => (
                    <li key={index} className={`flex justify-between items-center ${
                      (currentTemplate === 'premium-modern' || currentTemplate === 'premium-creative') 
                        ? 'bg-white/60 p-2 rounded shadow-sm' : ''
                    }`}>
                      <span className="font-medium">{skill.name}</span>
                      <Badge variant="outline" className={style.badgeClass}>
                        {proficiencyLabels[skill.proficiency] || skill.proficiency.toUpperCase()}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {portfolio.content.volunteering && (
              <div>
                <h3 className={style.sectionClass}>
                  <Heart className={`inline-block mr-2 h-5 w-5 ${style.iconColor}`} />
                  Volunteering
                </h3>
                <div className={style.dividerClass}></div>
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

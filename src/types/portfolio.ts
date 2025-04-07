
import { Json } from "@/integrations/supabase/types";

export interface PortfolioContent {
  personalInfo: {
    fullName: string;
    email: string;
    profilePicture?: string;
    bio?: string;
  };
  education: string;
  workExperience: string;
  awards: string;
  volunteering: string;
  languages: {
    name: string;
    proficiency: string;
  }[];
  computerSkills: {
    name: string;
    proficiency: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    repoUrl?: string;
    startDate?: string;
    endDate?: string;
  }[];
}

export interface Portfolio {
  id: string;
  title: string;
  description: string | null;
  template_id: string;
  content: PortfolioContent;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ServiceConnection {
  id: string;
  service_name: string;
  service_user_id: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  profile_data: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Helper function to safely parse portfolio content from JSON
export function safeParsePortfolioContent(content: Json): PortfolioContent {
  if (typeof content === 'object' && content !== null) {
    // Create a default structure
    const defaultContent: PortfolioContent = {
      personalInfo: {
        fullName: '',
        email: '',
      },
      education: '',
      workExperience: '',
      awards: '',
      volunteering: '',
      languages: [],
      computerSkills: [],
      projects: [],
    };
    
    // Merge with actual content
    return { ...defaultContent, ...content as Partial<PortfolioContent> };
  }
  
  // Return default content if parsing fails
  return {
    personalInfo: {
      fullName: '',
      email: '',
    },
    education: '',
    workExperience: '',
    awards: '',
    volunteering: '',
    languages: [],
    computerSkills: [],
    projects: [],
  };
}

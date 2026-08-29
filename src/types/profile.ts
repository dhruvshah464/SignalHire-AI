export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  duration: string;
  location?: string;
  description?: string;
  highlights?: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatarUrl?: string;
  skills: string[];
  skillCategories?: SkillCategory[];
  experience: WorkExperience[];
  education: EducationItem[];
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
  targetPreferences?: {
    desiredRoles?: string[];
    targetSalary?: string;
    workPreference?: 'remote' | 'hybrid' | 'onsite' | 'any';
  };
  rawResumeText?: string;
  lastParsedAt?: string;
  updatedAt: string;
}

export interface ResumeParseResult {
  name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  skillCategories?: { category: string; skills: string[] }[];
  experience?: {
    role: string;
    company: string;
    duration: string;
    location?: string;
    description?: string;
    highlights?: string[];
  }[];
  education?: {
    degree: string;
    school: string;
    year?: string;
  }[];
  links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
}

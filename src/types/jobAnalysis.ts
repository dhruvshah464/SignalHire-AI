export interface GroundingSource {
  title?: string;
  url?: string;
}

export interface JobMustHaveSkill {
  name: string;
  category: string;
  importance: 'Critical' | 'High';
  description?: string;
}

export interface JobNiceToHaveSkill {
  name: string;
  category: string;
  description?: string;
}

export interface JobSkillCategory {
  category: string;
  skills: string[];
}

export interface JobMissingSkill {
  name: string;
  priority: 'Critical' | 'High' | 'Medium';
  recommendation: string;
}

export interface InterviewQuestionExpectation {
  question: string;
  category: string;
  recommendedAngle: string;
}

export interface CandidateMatchAnalysis {
  matchScore: number;
  matchTier: 'Exceptional Fit' | 'Strong Match' | 'Moderate Fit' | 'Growth Opportunity';
  matchedSkills: string[];
  missingSkills: JobMissingSkill[];
  alignmentSummary: string;
  transferableStrengths: string[];
  resumeTailoringAdvice: string[];
  suggestedTalkingPoints: string[];
  interviewQuestionsToExpect: InterviewQuestionExpectation[];
}

export interface JobDetails {
  title: string;
  company: string;
  location: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site' | 'Unspecified';
  seniority: 'Entry' | 'Mid-Level' | 'Senior' | 'Staff / Principal' | 'Executive' | string;
  salaryEstimate?: string;
  summary: string;
  fullDescription?: string;
  url?: string;
  recruiter?: {
    name?: string;
    title?: string;
    linkedinUrl?: string;
  };
  groundingSources?: GroundingSource[];
  isGoogleSearchGrounded?: boolean;
}

export interface SkillsAnalysis {
  mustHaveSkills: JobMustHaveSkill[];
  niceToHaveSkills: JobNiceToHaveSkill[];
  skillCategories: JobSkillCategory[];
  responsibilities: string[];
  techStackOverview: string;
}

export interface JobAnalysisResult {
  id: string;
  sourceType: 'url' | 'keywords' | 'text';
  inputQuery: string;
  analyzedAt: string;
  job: JobDetails;
  skillsAnalysis: SkillsAnalysis;
  candidateMatch?: CandidateMatchAnalysis;
  groundingSources?: GroundingSource[];
  searchQueries?: string[];
  isGoogleSearchGrounded?: boolean;
}

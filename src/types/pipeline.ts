export type PipelineStatus = 
  | 'bookmarked'
  | 'outreach_sent'
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'technical'
  | 'offer'
  | 'rejected'
  | 'archived';

export interface PipelineItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site' | 'Unspecified';
  seniority?: string;
  salaryEstimate?: string;
  status: PipelineStatus;
  matchScore?: number;
  matchTier?: string;
  mustHaveSkills?: string[];
  missingSkills?: string[];
  jobUrl?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterUrl?: string;
  scrapedAt: string;
  appliedAt?: string | null;
  interviewDate?: string | null;
  lastActivityAt: string;
  notes?: string;
  rawJobAnalysisId?: string;
  outreachId?: string;
  interviewPrepId?: string;
}

export interface PipelineFilterOptions {
  status: 'all' | PipelineStatus;
  search: string;
  sortBy: 'date_desc' | 'date_asc' | 'score_desc' | 'company_asc' | 'status';
}

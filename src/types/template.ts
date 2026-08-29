export type TemplateCategory = 
  | 'recruiter_cold'
  | 'hiring_manager'
  | 'peer_referral'
  | 'post_application'
  | 'executive_hook'
  | 'gap_growth'
  | 'custom';

export type TemplateAudience = 
  | 'Recruiters'
  | 'Hiring Managers'
  | 'Engineers / Peers'
  | 'Founders / Executives';

export type TemplateTone = 
  | 'Direct & Punchy'
  | 'Value & Metric Heavy'
  | 'Warm & Conversational'
  | 'Executive & Formal'
  | 'Technical & Deep';

export interface OutreachTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  targetAudience: TemplateAudience;
  tone: TemplateTone;
  subject: string;
  body: string;
  tags: string[];
  isFavorite?: boolean;
  isDefault?: boolean;
  useCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlaceholderCategory = 'job' | 'company' | 'candidate' | 'recruiter' | 'links' | 'custom';

export interface TemplatePlaceholder {
  key: string;
  label: string;
  syntax: string;
  category: PlaceholderCategory;
  description: string;
  sampleValue: string;
  isRequired?: boolean;
}

export interface PreviewVariableState {
  [key: string]: string;
}

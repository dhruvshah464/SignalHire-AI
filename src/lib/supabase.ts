import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Outreach = {
  id: string;
  user_id: string;
  job_title: string;
  job_url: string;
  company_name: string;
  recruiter_name: string;
  recruiter_email?: string;
  recruiter_url: string;
  resume_data: any;
  job_data: any;
  messages: {
    email_subject?: string;
    cold_email: string;
    linkedin_dm: string;
    linkedin_connection_request?: string;
    follow_ups: string[];
    email_variants?: {
      id: string;
      subject: string;
      body: string;
      sent_count: number;
      reply_count: number;
    }[];
  };
  status: 'draft' | 'sent' | 'replied' | 'closed';
  next_follow_up_at?: string | null;
  last_follow_up_index?: number; // -1: none, 0: first follow-up, etc.
  notes: string;
  created_at: string;
};

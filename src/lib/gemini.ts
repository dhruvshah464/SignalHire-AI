import { JobAnalysisResult } from '@/types/jobAnalysis';

export const analyzeJobSkills = async (params: {
  url?: string;
  keywords?: string;
  rawDescription?: string;
  userProfile?: any;
}): Promise<JobAnalysisResult> => {
  const response = await fetch('/api/analyze-job-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to analyze job skills");
  }
  return response.json();
};

export const scrapeJobUrl = async (url: string) => {
  const response = await fetch('/api/scrape-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to scrape target job posting");
  }
  return response.json();
};

export const searchJobsGrounded = async (query: string, location?: string) => {
  const params = new URLSearchParams({ query });
  if (location) params.append('location', location);
  const response = await fetch(`/api/search-jobs?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to search job listings");
  }
  return response.json();
};

export const extractJobFromText = async (text: string) => {
  const response = await fetch('/api/extract-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to extract job details");
  }
  return response.json();
};

export const parseResume = async (resumeText: string) => {
  const response = await fetch('/api/parse-resume-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to parse resume");
  }
  return response.json();
};

export const generateOutreach = async (jobData: any, resumeData: any, recruiterPost?: string) => {
  const response = await fetch('/api/generate-outreach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobData, resumeData, recruiterPost })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate outreach");
  }
  return response.json();
};

export const simulateRecruiterChat = async (history: { role: 'user' | 'model', text: string }[], jobData: any) => {
  const response = await fetch('/api/simulate-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, jobData })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to simulate chat");
  }
  const data = await response.json();
  return data.text;
};

export const evaluateSimulatorResponse = async (history: { role: 'user' | 'model', text: string }[], jobData: any) => {
  const response = await fetch('/api/evaluate-simulator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, jobData })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to evaluate response");
  }
  return response.json();
};

export const generateEmailTemplate = async (params: {
  prompt?: string;
  category?: string;
  audience?: string;
  tone?: string;
}) => {
  const response = await fetch('/api/generate-email-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate email template");
  }
  return response.json();
};

export const refineEmailTemplate = async (params: {
  subject: string;
  body: string;
  refinementGoal: string;
  targetTone?: string;
}) => {
  const response = await fetch('/api/refine-email-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to refine email template");
  }
  return response.json();
};

export const suggestSubjectLines = async (params: {
  body: string;
  currentSubject?: string;
  audience?: string;
  tone?: string;
}) => {
  const response = await fetch('/api/suggest-subject-lines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate subject line suggestions");
  }
  return response.json();
};



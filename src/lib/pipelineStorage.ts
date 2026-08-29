import { PipelineItem, PipelineStatus } from '@/types/pipeline';
import { JobAnalysisResult } from '@/types/jobAnalysis';
import { getSavedJobAnalyses } from '@/lib/jobAnalysisStorage';

const PIPELINE_STORAGE_KEY = 'signalhire_outreach_pipeline';

export const INITIAL_PIPELINE_DATA: PipelineItem[] = [
  {
    id: 'pipe-anthropic-1',
    jobTitle: 'Senior AI Research & Full-Stack Engineer',
    company: 'Anthropic',
    location: 'San Francisco, CA',
    workplaceType: 'Hybrid',
    seniority: 'Senior',
    salaryEstimate: '$240k - $320k + Equity',
    status: 'interviewing',
    matchScore: 92,
    matchTier: 'Exceptional Fit',
    mustHaveSkills: ['Python', 'TypeScript', 'PyTorch', 'LLM Alignment', 'Distributed Systems'],
    missingSkills: ['Triton GPU Kernels'],
    jobUrl: 'https://jobs.lever.co/anthropic/senior-ai-engineer',
    recruiterName: 'Elena Rostova',
    recruiterEmail: 'elena.rostova@anthropic.com',
    recruiterUrl: 'https://linkedin.com/in/elena-rostova-talent',
    scrapedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    interviewDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Technical screen passed with flying colors! System architecture loop scheduled for Thursday at 2 PM PST with Core AI Infra Team.'
  },
  {
    id: 'pipe-stripe-2',
    jobTitle: 'Staff Frontend Infrastructure Engineer',
    company: 'Stripe',
    location: 'Seattle, WA',
    workplaceType: 'Remote',
    seniority: 'Staff / Principal',
    salaryEstimate: '$260k - $340k + Equity',
    status: 'applied',
    matchScore: 88,
    matchTier: 'Strong Match',
    mustHaveSkills: ['React', 'TypeScript', 'Micro-frontends', 'Performance Profiling', 'CI/CD Pipelines'],
    missingSkills: ['Ruby internal tooling'],
    jobUrl: 'https://stripe.com/jobs/staff-frontend-infra',
    recruiterName: 'Marcus Vance',
    recruiterEmail: 'marcus.vance@stripe.com',
    recruiterUrl: 'https://linkedin.com/in/marcus-vance-talent',
    scrapedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Application submitted via referral through Engineering Lead. Cold outreach sent to Marcus Vance on LinkedIn.'
  },
  {
    id: 'pipe-datadog-3',
    jobTitle: 'Lead Distributed Systems & Cloud Platforms',
    company: 'Datadog',
    location: 'New York, NY',
    workplaceType: 'Hybrid',
    seniority: 'Staff / Principal',
    salaryEstimate: '$225k - $290k + Equity',
    status: 'outreach_sent',
    matchScore: 84,
    matchTier: 'Strong Match',
    mustHaveSkills: ['Go', 'Kubernetes', 'Kafka', 'High-Throughput Streaming', 'eBPF'],
    missingSkills: ['eBPF kernel tracing'],
    jobUrl: 'https://datadog.com/careers/distributed-systems',
    recruiterName: 'David Chen',
    recruiterEmail: 'david.chen@datadoghq.com',
    recruiterUrl: 'https://linkedin.com/in/david-chen-datadog',
    scrapedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Personalized cold pitch generated & sent regarding their latest distributed tracing blog post. Waiting for response.'
  },
  {
    id: 'pipe-linear-4',
    jobTitle: 'Senior Full-Stack Product Engineer',
    company: 'Linear',
    location: 'San Francisco, CA',
    workplaceType: 'Remote',
    seniority: 'Senior',
    salaryEstimate: '$210k - $275k + 0.25% Equity',
    status: 'offer',
    matchScore: 95,
    matchTier: 'Exceptional Fit',
    mustHaveSkills: ['React', 'TypeScript', 'Node.js', 'CRDTs / Sync Engines', 'Tailwind CSS'],
    missingSkills: [],
    jobUrl: 'https://linear.app/careers/product-engineer',
    recruiterName: 'Tuomas Artman',
    recruiterUrl: 'https://linkedin.com/in/artman',
    scrapedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    appliedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Formal Offer received: $220k base + 0.2% equity + $30k sign-on bonus. Deadline to decide is next Tuesday.'
  },
  {
    id: 'pipe-meta-5',
    jobTitle: 'Production Engineering Lead',
    company: 'Meta',
    location: 'Menlo Park, CA',
    workplaceType: 'On-site',
    seniority: 'Senior',
    salaryEstimate: '$230k - $300k + Equity',
    status: 'rejected',
    matchScore: 71,
    matchTier: 'Moderate Fit',
    mustHaveSkills: ['C++', 'Linux Kernel', 'BGP Routing', 'Infrastructure Reliability'],
    missingSkills: ['Low-level C++ Kernel modules', 'BGP peering protocols'],
    jobUrl: 'https://metacareers.com/production-engineer',
    recruiterName: 'Samantha Green',
    scrapedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    appliedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: 'Reached phone screen. Decided to focus on pure application & AI infrastructure instead of low-level kernel routing.'
  },
  {
    id: 'pipe-figma-6',
    jobTitle: 'Senior AI & Design Systems Engineer',
    company: 'Figma',
    location: 'San Francisco, CA',
    workplaceType: 'Hybrid',
    seniority: 'Senior',
    salaryEstimate: '$230k - $295k + Equity',
    status: 'bookmarked',
    matchScore: 89,
    matchTier: 'Strong Match',
    mustHaveSkills: ['WebAssembly', 'WebGL / Canvas', 'TypeScript', 'Design Tokens', 'AI Tooling'],
    missingSkills: ['C++ to Wasm toolchain'],
    jobUrl: 'https://figma.com/careers/ai-design-systems',
    recruiterName: 'Rachel Adams',
    recruiterUrl: 'https://linkedin.com/in/rachel-adams-figma',
    scrapedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Scraped from Radar. High interest role — tailoring resume highlights before submitting official application.'
  }
];

export function getPipelineItems(): PipelineItem[] {
  try {
    const raw = localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (!raw) {
      // Seed with initial high-quality demo data
      localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(INITIAL_PIPELINE_DATA));
      return INITIAL_PIPELINE_DATA;
    }
    const parsed: PipelineItem[] = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error('Failed to parse pipeline items from localStorage', e);
    return INITIAL_PIPELINE_DATA;
  }
}

export function savePipelineItem(item: PipelineItem): PipelineItem[] {
  try {
    const items = getPipelineItems();
    const index = items.findIndex(i => i.id === item.id);
    let updated: PipelineItem[];
    if (index >= 0) {
      updated = [...items];
      updated[index] = { ...item, lastActivityAt: new Date().toISOString() };
    } else {
      updated = [{ ...item, lastActivityAt: new Date().toISOString() }, ...items];
    }
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save pipeline item', e);
    return getPipelineItems();
  }
}

export function updatePipelineStatus(
  id: string, 
  newStatus: PipelineStatus, 
  extra?: { interviewDate?: string; notes?: string; appliedAt?: string }
): PipelineItem[] {
  try {
    const items = getPipelineItems();
    const updated = items.map(item => {
      if (item.id === id) {
        const isNowApplied = (newStatus === 'applied' || newStatus === 'screening' || newStatus === 'interviewing' || newStatus === 'technical' || newStatus === 'offer') && !item.appliedAt;
        return {
          ...item,
          status: newStatus,
          lastActivityAt: new Date().toISOString(),
          appliedAt: isNowApplied ? (extra?.appliedAt || new Date().toISOString()) : item.appliedAt,
          interviewDate: extra?.interviewDate !== undefined ? extra.interviewDate : item.interviewDate,
          notes: extra?.notes !== undefined ? extra.notes : item.notes
        };
      }
      return item;
    });
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update pipeline status', e);
    return getPipelineItems();
  }
}

export function updatePipelineNotes(id: string, notes: string): PipelineItem[] {
  try {
    const items = getPipelineItems();
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, notes, lastActivityAt: new Date().toISOString() };
      }
      return item;
    });
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update pipeline notes', e);
    return getPipelineItems();
  }
}

export function deletePipelineItem(id: string): PipelineItem[] {
  try {
    const items = getPipelineItems();
    const updated = items.filter(i => i.id !== id);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete pipeline item', e);
    return getPipelineItems();
  }
}

export function addJobAnalysisToPipeline(
  analysis: JobAnalysisResult, 
  initialStatus: PipelineStatus = 'applied',
  customNotes?: string
): { items: PipelineItem[]; addedItem: PipelineItem } {
  const items = getPipelineItems();
  
  // Deduplicate by company + title
  const existing = items.find(
    i => (i.company.toLowerCase() === analysis.job.company.toLowerCase() && 
          i.jobTitle.toLowerCase() === analysis.job.title.toLowerCase()) ||
         (i.rawJobAnalysisId && i.rawJobAnalysisId === analysis.id)
  );

  if (existing) {
    // Update existing item
    const updatedItem: PipelineItem = {
      ...existing,
      status: initialStatus,
      rawJobAnalysisId: analysis.id,
      matchScore: analysis.candidateMatch?.matchScore ?? existing.matchScore,
      matchTier: analysis.candidateMatch?.matchTier ?? existing.matchTier,
      mustHaveSkills: analysis.skillsAnalysis.mustHaveSkills.map(s => s.name),
      missingSkills: analysis.candidateMatch?.missingSkills.map(s => s.name) ?? existing.missingSkills,
      lastActivityAt: new Date().toISOString(),
      notes: customNotes || existing.notes || `Scraped & processed via AI Job Radar.`
    };
    const newItems = savePipelineItem(updatedItem);
    return { items: newItems, addedItem: updatedItem };
  }

  const newItem: PipelineItem = {
    id: `pipe-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    jobTitle: analysis.job.title,
    company: analysis.job.company,
    location: analysis.job.location || 'Remote / Unspecified',
    workplaceType: analysis.job.workplaceType || 'Remote',
    seniority: analysis.job.seniority || 'Mid-Level',
    salaryEstimate: analysis.job.salaryEstimate || 'Competitive',
    status: initialStatus,
    matchScore: analysis.candidateMatch?.matchScore,
    matchTier: analysis.candidateMatch?.matchTier,
    mustHaveSkills: analysis.skillsAnalysis.mustHaveSkills.map(s => s.name),
    missingSkills: analysis.candidateMatch?.missingSkills.map(s => s.name),
    jobUrl: analysis.job.url,
    recruiterName: analysis.job.recruiter?.name,
    recruiterUrl: analysis.job.recruiter?.linkedinUrl,
    scrapedAt: analysis.analyzedAt || new Date().toISOString(),
    appliedAt: initialStatus === 'applied' ? new Date().toISOString() : null,
    lastActivityAt: new Date().toISOString(),
    notes: customNotes || `Scraped via AI Radar. ${analysis.skillsAnalysis.mustHaveSkills.length} core skills identified.`,
    rawJobAnalysisId: analysis.id
  };

  const newItems = savePipelineItem(newItem);
  return { items: newItems, addedItem: newItem };
}

export interface PipelineStats {
  total: number;
  bookmarked: number;
  outreachSent: number;
  applied: number;
  interviewing: number;
  offers: number;
  rejected: number;
  activeOpportunities: number;
  avgMatchScore: number;
  interviewConversionRate: number;
}

export function calculatePipelineStats(items: PipelineItem[]): PipelineStats {
  const total = items.length;
  if (total === 0) {
    return {
      total: 0,
      bookmarked: 0,
      outreachSent: 0,
      applied: 0,
      interviewing: 0,
      offers: 0,
      rejected: 0,
      activeOpportunities: 0,
      avgMatchScore: 0,
      interviewConversionRate: 0
    };
  }

  let bookmarked = 0;
  let outreachSent = 0;
  let applied = 0;
  let interviewing = 0;
  let offers = 0;
  let rejected = 0;
  let scoreSum = 0;
  let scoredCount = 0;

  items.forEach(item => {
    switch (item.status) {
      case 'bookmarked':
        bookmarked++;
        break;
      case 'outreach_sent':
        outreachSent++;
        break;
      case 'applied':
        applied++;
        break;
      case 'screening':
      case 'interviewing':
      case 'technical':
        interviewing++;
        break;
      case 'offer':
        offers++;
        break;
      case 'rejected':
      case 'archived':
        rejected++;
        break;
    }

    if (item.matchScore) {
      scoreSum += item.matchScore;
      scoredCount++;
    }
  });

  const activeOpportunities = applied + interviewing + outreachSent + offers;
  const appliedOrSent = applied + outreachSent + interviewing + offers + rejected;
  const interviewConversionRate = appliedOrSent > 0 
    ? Math.round(((interviewing + offers) / appliedOrSent) * 100) 
    : 0;

  return {
    total,
    bookmarked,
    outreachSent,
    applied,
    interviewing,
    offers,
    rejected,
    activeOpportunities,
    avgMatchScore: scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 0,
    interviewConversionRate
  };
}

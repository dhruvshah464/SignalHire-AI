export type ProjectStatusType = 
  | 'draft' 
  | 'sent' 
  | 'replied' 
  | 'interviewing' 
  | 'offer' 
  | 'scaling'
  | 'closed';

export interface StatusConfig {
  id: ProjectStatusType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  ringColor: string;
  gradient: string;
  step: number;
}

export const STATUS_CONFIGS: Record<ProjectStatusType, StatusConfig> = {
  draft: {
    id: 'draft',
    label: 'Draft',
    shortLabel: 'Draft',
    description: 'Work in progress / Blueprint initialized',
    color: '#f59e0b', // amber-500
    textColor: 'text-amber-300',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    ringColor: 'ring-amber-500/50',
    gradient: 'from-amber-500 to-orange-500',
    step: 1,
  },
  sent: {
    id: 'sent',
    label: 'Sent / Dispatched',
    shortLabel: 'Sent',
    description: 'Transmitted to recruiter or ecosystem pipeline',
    color: '#3b82f6', // blue-500
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    ringColor: 'ring-blue-500/50',
    gradient: 'from-blue-500 to-cyan-400',
    step: 2,
  },
  replied: {
    id: 'replied',
    label: 'Replied / Engaged',
    shortLabel: 'Replied',
    description: 'Response received & dialogue active',
    color: '#10b981', // emerald-500
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    ringColor: 'ring-emerald-500/50',
    gradient: 'from-emerald-400 to-teal-500',
    step: 3,
  },
  interviewing: {
    id: 'interviewing',
    label: 'Interviewing',
    shortLabel: 'Interviewing',
    description: 'Technical evaluation / Live War Room rounds',
    color: '#8b5cf6', // violet-500
    textColor: 'text-purple-300',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    ringColor: 'ring-purple-500/50',
    gradient: 'from-purple-500 to-pink-500',
    step: 4,
  },
  offer: {
    id: 'offer',
    label: 'Offer / Scaling',
    shortLabel: 'Offer',
    description: 'Term sheet secured or production scale achieved',
    color: '#ec4899', // pink-500 / gold
    textColor: 'text-pink-300',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    ringColor: 'ring-pink-500/50',
    gradient: 'from-pink-500 to-rose-400',
    step: 5,
  },
  scaling: {
    id: 'scaling',
    label: 'Scaling Active',
    shortLabel: 'Scaling',
    description: 'Autonomous growth velocity active',
    color: '#06b6d4', // cyan-500
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    ringColor: 'ring-cyan-500/50',
    gradient: 'from-cyan-400 to-blue-500',
    step: 5,
  },
  closed: {
    id: 'closed',
    label: 'Archived / Closed',
    shortLabel: 'Closed',
    description: 'Outcome resolved or archived',
    color: '#64748b', // slate-500
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    glowColor: 'rgba(100, 116, 139, 0.3)',
    ringColor: 'ring-slate-500/50',
    gradient: 'from-slate-500 to-slate-600',
    step: 6,
  }
};

export const PIPELINE_STAGES: ProjectStatusType[] = [
  'draft',
  'sent',
  'replied',
  'interviewing',
  'offer',
];

export interface StatusHistoryEntry {
  id: string;
  projectId: string;
  projectName: string;
  fromStatus: ProjectStatusType;
  toStatus: ProjectStatusType;
  timestamp: string;
  note?: string;
}

export function normalizeStatus(rawStatus?: string): ProjectStatusType {
  if (!rawStatus) return 'draft';
  const lower = rawStatus.toLowerCase().trim();
  if (lower.includes('draft') || lower.includes('ideation') || lower.includes('blueprint')) return 'draft';
  if (lower.includes('sent') || lower.includes('applied') || lower.includes('dispatched')) return 'sent';
  if (lower.includes('replied') || lower.includes('engaged') || lower.includes('response')) return 'replied';
  if (lower.includes('interview') || lower.includes('eval') || lower.includes('mvp') || lower.includes('twin')) return 'interviewing';
  if (lower.includes('offer') || lower.includes('accepted') || lower.includes('won')) return 'offer';
  if (lower.includes('scale') || lower.includes('scaling') || lower.includes('self-evolving') || lower.includes('growth')) return 'scaling';
  if (lower.includes('close') || lower.includes('reject') || lower.includes('archive')) return 'closed';
  return 'draft';
}

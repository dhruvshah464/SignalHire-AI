import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Copy, 
  Eye, 
  Code, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  User, 
  Send, 
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { renderTemplate, AVAILABLE_PLACEHOLDERS } from '@/lib/templateStorage';
import { getSavedUserProfile } from '@/lib/profile';
import { PreviewVariableState } from '@/types/template';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TemplateLivePreviewProps {
  subject: string;
  body: string;
  templateTitle?: string;
  className?: string;
  onUseTemplate?: () => void;
}

export const PRESET_COMPANIES: {
  name: string;
  role: string;
  variables: PreviewVariableState;
}[] = [
  {
    name: 'Stripe',
    role: 'Staff Frontend Engineer',
    variables: {
      company_name: 'Stripe',
      job_title: 'Staff Frontend Engineer',
      seniority_level: 'Staff',
      workplace_type: 'Remote',
      company_product: 'global developer payments & financial infrastructure',
      recent_company_news: 'recent launch of agentic autonomous checkout primitives',
      recruiter_name: 'Alex Morgan',
      recruiter_first_name: 'Alex',
      recruiter_title: 'Lead Technical Talent Partner',
      key_requirement_1: 'React, TypeScript & Core Web Vitals',
      key_requirement_2: 'high-scale financial dashboard latency & modular design systems'
    }
  },
  {
    name: 'Anthropic',
    role: 'Senior Full-Stack AI Engineer',
    variables: {
      company_name: 'Anthropic',
      job_title: 'Senior Full-Stack AI Engineer',
      seniority_level: 'Senior',
      workplace_type: 'San Francisco (Hybrid)',
      company_product: 'frontier Claude model interfaces and autonomous agent tooling',
      recent_company_news: 'breakthroughs in multimodal computer-use capabilities',
      recruiter_name: 'Elena Rostova',
      recruiter_first_name: 'Elena',
      recruiter_title: 'Head of Engineering Recruiting',
      key_requirement_1: 'Interactive Canvas UI & WebSockets',
      key_requirement_2: 'low-latency streaming LLM token rendering'
    }
  },
  {
    name: 'Datadog',
    role: 'Distributed Systems Backend Engineer',
    variables: {
      company_name: 'Datadog',
      job_title: 'Senior Backend Engineer (Observability)',
      seniority_level: 'Senior',
      workplace_type: 'New York / Remote',
      company_product: 'real-time telemetry and cloud infrastructure observability',
      recent_company_news: 'scaling APM pipelines to handle tens of billions of live trace spans daily',
      recruiter_name: 'Marcus Vance',
      recruiter_first_name: 'Marcus',
      recruiter_title: 'Principal Technical Sourcer',
      key_requirement_1: 'Go, Kafka & Time-Series Architectures',
      key_requirement_2: 'distributed trace ingestion with sub-millisecond p99 latency'
    }
  }
];

export function TemplateLivePreview({
  subject,
  body,
  templateTitle = 'Email Template',
  className,
  onUseTemplate
}: TemplateLivePreviewProps) {
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [copiedSection, setCopiedSection] = useState<'all' | 'subject' | 'body' | null>(null);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  // Initialize variables from candidate profile + selected preset
  const [customVariables, setCustomVariables] = useState<PreviewVariableState>(() => {
    const profile = getSavedUserProfile();
    const preset = PRESET_COMPANIES[0].variables;

    const baseVariables: PreviewVariableState = {
      ...preset,
      candidate_name: profile.name || 'Sarah Chen',
      candidate_headline: profile.headline || 'Senior Full-Stack Engineer',
      years_experience: '6+',
      current_company: profile.experience?.[0]?.company || 'TechFlow Systems',
      top_matching_skill: profile.skills?.[0] || 'TypeScript & React Architecture',
      key_achievement: profile.experience?.[0]?.highlights?.[0] || 'scaled core UI rendering speed by 40% across 1M+ active users',
      relevant_project: 'SignalHire AI Engine',
      call_to_action: 'Are you open to a brief 10-minute introductory sync this week?',
      portfolio_url: profile.links?.portfolio || 'https://sarahchen.dev',
      github_url: profile.links?.github || 'https://github.com/sarahchen',
      linkedin_url: profile.links?.linkedin || 'https://linkedin.com/in/sarahchen-dev'
    };

    return baseVariables;
  });

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const preset = PRESET_COMPANIES[idx];
    setCustomVariables(prev => ({
      ...prev,
      ...preset.variables
    }));
  };

  const handleVariableChange = (key: string, value: string) => {
    setCustomVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const {
    subject: renderedSubject,
    body: renderedBody,
    detectedKeys,
    missingKeys
  } = useMemo(() => {
    return renderTemplate({ subject, body }, customVariables);
  }, [subject, body, customVariables]);

  const wordCount = useMemo(() => {
    const text = `${renderedSubject} ${renderedBody}`.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [renderedSubject, renderedBody]);

  const readingTimeSec = useMemo(() => {
    return Math.max(5, Math.ceil((wordCount / 200) * 60));
  }, [wordCount]);

  const handleCopy = (type: 'all' | 'subject' | 'body') => {
    let textToCopy = '';
    if (type === 'subject') textToCopy = renderedSubject;
    else if (type === 'body') textToCopy = renderedBody;
    else textToCopy = `Subject: ${renderedSubject}\n\n${renderedBody}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSection(type);
    toast.success(
      type === 'subject' 
        ? 'Subject line copied' 
        : type === 'body' 
        ? 'Email body copied' 
        : 'Full rendered email copied to clipboard'
    );
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className={cn("bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex flex-col", className)}>
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Preview & Variable Resolver
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex p-0.5 bg-slate-800 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('rendered')}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5",
                viewMode === 'rendered' ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Resolved View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5",
                viewMode === 'raw' ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Template Raw</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={cn(
              "h-7 text-xs px-2.5 border-slate-700 font-semibold gap-1",
              isCustomizing ? "bg-brand-primary text-white border-brand-primary" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{isCustomizing ? 'Hide Vars' : 'Edit Vars'}</span>
          </Button>
        </div>
      </div>

      {/* Preset Company Selector */}
      <div className="bg-slate-50/80 border-b border-slate-200/80 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Test Company Presets:
          </span>
          {PRESET_COMPANIES.map((preset, idx) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(idx)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap",
                selectedPresetIdx === idx
                  ? "bg-white border border-brand-primary/40 text-brand-primary font-bold shadow-2xs"
                  : "bg-slate-200/60 text-slate-600 hover:bg-slate-200"
              )}
            >
              {preset.name} ({preset.role.split(' ')[0]})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-400" />
            {wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            ~{readingTimeSec}s read
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {detectedKeys.length} placeholders
          </span>
        </div>
      </div>

      {/* Variable Customizer Drawer */}
      {isCustomizing && (
        <div className="bg-amber-50/40 border-b border-amber-200/60 p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              Active Placeholder Variable Values:
            </h5>
            <span className="text-[11px] text-amber-700">
              Edit values below to test live resolution in real time
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {detectedKeys.map((key) => {
              const def = AVAILABLE_PLACEHOLDERS.find(p => p.key === key);
              const val = customVariables[key] || '';
              return (
                <div key={key} className="space-y-0.5">
                  <label className="text-[10px] font-mono font-bold text-slate-600 truncate block">
                    {`{{${key}}}`} {def ? `(${def.label})` : ''}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    placeholder={def?.sampleValue || 'Value...'}
                    className="w-full text-xs px-2.5 py-1 bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-800"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Placeholders Warning */}
      {missingKeys.length > 0 && viewMode === 'rendered' && (
        <div className="bg-amber-50 px-5 py-2 border-b border-amber-200/80 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{missingKeys.length} unassigned placeholders:</strong> {missingKeys.map(k => `{{${k}}}`).join(', ')}. Provide values in "Edit Vars" to preview complete text.
          </span>
        </div>
      )}

      {/* Rendered Email Preview Container */}
      <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-slate-50/40 font-sans">
        {/* Email Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To</span>
              <p className="text-xs font-semibold text-slate-700">
                {customVariables.recruiter_name || 'Hiring Team'} &lt;{customVariables.recruiter_first_name?.toLowerCase() || 'recruiting'}@{customVariables.company_name?.toLowerCase().replace(/\s+/g, '') || 'company'}.com&gt;
              </p>
            </div>
            <div className="space-y-0.5 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</span>
              <p className="text-xs font-semibold text-slate-700">
                {customVariables.candidate_name || 'You'} &lt;you@email.com&gt;
              </p>
            </div>
          </div>

          {/* Subject line */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Subject Line
              </span>
              <div className="font-semibold text-sm text-slate-900 leading-snug">
                {viewMode === 'rendered' ? (
                  renderedSubject || <span className="text-slate-400 italic">No subject line provided</span>
                ) : (
                  <span className="font-mono text-xs text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
                    {subject || '{{subject}}'}
                  </span>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy('subject')}
              className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800"
              title="Copy subject line only"
            >
              {copiedSection === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Email Body Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 relative group">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Message Body
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy('body')}
              className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800"
              title="Copy body only"
            >
              {copiedSection === 'body' ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copy Body
                </span>
              )}
            </Button>
          </div>

          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {viewMode === 'rendered' ? (
              renderedBody || <span className="text-slate-400 italic">No body text provided</span>
            ) : (
              <div className="font-mono text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200 leading-loose">
                {body}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer bar actions */}
      <div className="bg-white border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleCopy('all')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 gap-1.5"
          >
            {copiedSection === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'all' ? 'Copied Full Email!' : 'Copy Full Email'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const mailtoUrl = `mailto:${encodeURIComponent(customVariables.recruiter_name ? `${customVariables.recruiter_first_name?.toLowerCase()}@${customVariables.company_name?.toLowerCase().replace(/\s+/g, '')}.com` : '')}?subject=${encodeURIComponent(renderedSubject)}&body=${encodeURIComponent(renderedBody)}`;
              window.open(mailtoUrl, '_blank');
            }}
            className="text-xs h-9 px-3 font-semibold text-slate-700 border-slate-300 gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Open in Mail App</span>
          </Button>
        </div>

        {onUseTemplate && (
          <Button
            size="sm"
            onClick={onUseTemplate}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs h-9 px-4 gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use in New Outreach</span>
          </Button>
        )}
      </div>
    </div>
  );
}

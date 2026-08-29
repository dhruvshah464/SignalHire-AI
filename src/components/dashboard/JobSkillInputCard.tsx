import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Link2, 
  Search, 
  FileText, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  Globe, 
  UserCheck, 
  Briefcase,
  Zap,
  RotateCcw
} from 'lucide-react';
import { getSavedUserProfile } from '@/lib/profile';
import { UserProfile } from '@/types/profile';
import { toast } from 'sonner';

interface JobSkillInputCardProps {
  onAnalyze: (params: {
    url?: string;
    keywords?: string;
    rawDescription?: string;
    userProfile?: UserProfile;
  }) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: 'Senior AI Engineer',
    company: 'Anthropic',
    query: 'Senior AI Research & Full-Stack Engineer at Anthropic',
    type: 'keywords'
  },
  {
    label: 'Staff Frontend Architect',
    company: 'Stripe',
    query: 'Staff Frontend Infrastructure Engineer at Stripe',
    type: 'keywords'
  },
  {
    label: 'Lead Distributed Systems',
    company: 'Datadog',
    query: 'Lead Distributed Systems & Cloud Platforms Engineer at Datadog',
    type: 'keywords'
  },
  {
    label: 'Senior Product Designer',
    company: 'Figma',
    query: 'Senior AI & Design Systems Product Designer at Figma',
    type: 'keywords'
  }
];

export function JobSkillInputCard({ onAnalyze, isLoading }: JobSkillInputCardProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'keywords' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<string>('Initializing analysis...');

  useEffect(() => {
    const profile = getSavedUserProfile();
    setUserProfile(profile);
  }, []);

  // Multi-step loading messages
  useEffect(() => {
    if (!isLoading) {
      setLoadingPhase('Initializing analysis...');
      return;
    }

    const phases = [
      'Scraping target source & extracting raw posting...',
      'Gemini AI parsing core requirements & tech stack...',
      'Extracting must-have skills, nice-to-haves & seniority...',
      'Benchmarking against your candidate profile & experience...',
      'Synthesizing skill gap breakdown & tactical interview battleplan...'
    ];

    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % phases.length;
      setLoadingPhase(phases[current]);
    }, 2200);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'url') {
      if (!urlInput.trim()) {
        toast.error('Please enter a job posting URL.');
        return;
      }
      // Simple url check
      if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
        toast.info('Prepending https:// to URL');
        const formattedUrl = `https://${urlInput.trim()}`;
        setUrlInput(formattedUrl);
        await onAnalyze({ url: formattedUrl, userProfile: userProfile || undefined });
        return;
      }
      await onAnalyze({ url: urlInput.trim(), userProfile: userProfile || undefined });
    } else if (activeTab === 'keywords') {
      if (!keywordsInput.trim()) {
        toast.error('Please enter role title, company, or target keywords.');
        return;
      }
      await onAnalyze({ keywords: keywordsInput.trim(), userProfile: userProfile || undefined });
    } else {
      if (!textInput.trim() || textInput.trim().length < 30) {
        toast.error('Please paste a substantive job description (at least 30 characters).');
        return;
      }
      await onAnalyze({ rawDescription: textInput.trim(), userProfile: userProfile || undefined });
    }
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setActiveTab('keywords');
    setKeywordsInput(preset.query);
    onAnalyze({ keywords: preset.query, userProfile: userProfile || undefined });
  };

  return (
    <Card className="border-brand-border/80 shadow-md bg-gradient-to-b from-white to-slate-50/50 overflow-hidden relative">
      {/* Decorative top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-indigo-500 to-blue-400" />

      <CardContent className="p-6 space-y-5">
        {/* Header with Title & Candidate Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-brand-primary flex items-center justify-center shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                AI Job Radar & Skill Analyzer
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Input any job URL or keywords to trigger an automated scrape, skill extraction, and candidate gap analysis.
            </p>
          </div>

          {/* Profile Benchmarking Pill */}
          {userProfile && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs shrink-0 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-brand-primary text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  userProfile.name?.slice(0, 1) || 'U'
                )}
              </div>
              <div className="text-left">
                <span className="font-semibold text-slate-800 text-[11px] block leading-tight truncate max-w-[130px]">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-blue-700 font-medium">
                  {userProfile.skills?.length || 0} skills active
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            disabled={isLoading}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-brand-primary" />
            <span>Job URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keywords')}
            disabled={isLoading}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'keywords'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Role / Keywords</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            disabled={isLoading}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Paste Description</span>
          </button>
        </div>

        {/* Dynamic Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'url' && (
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Globe className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="https://jobs.lever.co/company/... or LinkedIn, Indeed, Greenhouse, Workday posting"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-28 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  className="absolute right-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs h-9 px-4 rounded-lg shadow-xs gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scraping...</span>
                    </>
                  ) : (
                    <>
                      <span>Scrape & Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 pl-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Supports any public career site, Lever, Greenhouse, LinkedIn Jobs, Indeed, or direct company URL.
              </p>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer at Stripe, Staff AI Architect (Remote), etc."
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-28 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !keywordsInput.trim()}
                  className="absolute right-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs h-9 px-4 rounded-lg shadow-xs gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Stack</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 pl-1">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                AI will synthesize accurate market expectations and required tech stacks for this role.
              </p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-2">
              <textarea
                placeholder="Paste full or partial job description text here (including requirements, tech stack, and responsibilities)..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs resize-y"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {textInput.length} characters
                </span>
                <Button
                  type="submit"
                  disabled={isLoading || textInput.trim().length < 30}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs h-9 px-4 rounded-lg shadow-xs gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Skills...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract & Analyze Skills</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Quick-Pick Preset Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Quick Presets:
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-brand-primary hover:border-blue-200 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 transition-all flex items-center gap-1 shadow-2xs group"
              >
                <span>{preset.label}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-500 font-mono">({preset.company})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl animate-in fade-in duration-300 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                <span>{loadingPhase}</span>
              </div>
              <Badge className="bg-brand-primary text-white text-[10px] uppercase font-bold tracking-wider animate-pulse">
                Gemini Active
              </Badge>
            </div>
            <div className="w-full bg-blue-200/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand-primary h-full rounded-full animate-pulse transition-all duration-500 w-3/4" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

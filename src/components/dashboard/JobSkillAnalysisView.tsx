import React, { useState } from 'react';
import { JobAnalysisResult } from '@/types/jobAnalysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  Globe, 
  DollarSign, 
  MapPin, 
  Layers, 
  Target, 
  Send, 
  MessageSquare, 
  Copy, 
  Bookmark, 
  Check, 
  ExternalLink, 
  TrendingUp, 
  BrainCircuit, 
  HelpCircle, 
  Lightbulb, 
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
  BarChart3,
  Radar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SkillAnalysisChart } from './SkillAnalysisChart';
import { MissingSkillsInterviewPrepCard } from '@/components/interview/MissingSkillsInterviewPrepCard';

interface JobSkillAnalysisViewProps {
  analysis: JobAnalysisResult;
  onClose?: () => void;
  onSave?: (analysis: JobAnalysisResult) => void;
  isSaved?: boolean;
  onTrackInPipeline?: (analysis: JobAnalysisResult, status: 'applied' | 'interviewing' | 'bookmarked') => void;
  isPipelineTracked?: boolean;
  pipelineStatus?: string;
}

export function JobSkillAnalysisView({
  analysis,
  onClose,
  onSave,
  isSaved = false,
  onTrackInPipeline,
  isPipelineTracked = false,
  pipelineStatus
}: JobSkillAnalysisViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'visual' | 'skills' | 'match' | 'interview' | 'raw'>('visual');
  const [copied, setCopied] = useState(false);

  const { job, skillsAnalysis, candidateMatch } = analysis;

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-500/20';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200 ring-blue-500/20';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200 ring-amber-500/20';
    return 'text-slate-600 bg-slate-100 border-slate-200 ring-slate-500/20';
  };

  const getMatchTierBadge = (tier: string) => {
    switch (tier) {
      case 'Exceptional Fit':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">Exceptional Fit</Badge>;
      case 'Strong Match':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Strong Match</Badge>;
      case 'Moderate Fit':
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs">Moderate Fit</Badge>;
      default:
        return <Badge className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs">Growth Opportunity</Badge>;
    }
  };

  // 1-Click Launch Outreach Pre-filled
  const handleLaunchOutreach = () => {
    navigate('/new', {
      state: {
        prefilledJob: {
          title: job.title,
          company: job.company,
          description: job.summary + '\n\n' + (job.fullDescription || skillsAnalysis.responsibilities.join('\n')),
          url: job.url || '',
          recruiter_name: job.recruiter?.name || '',
          recruiter_url: job.recruiter?.linkedinUrl || '',
          matchScore: candidateMatch?.matchScore || 85
        }
      }
    });
  };

  // Copy structured report to clipboard
  const handleCopyReport = () => {
    const reportText = `
# Job Skill & Requirement Analysis: ${job.title} at ${job.company}
- Location: ${job.location} (${job.workplaceType})
- Seniority: ${job.seniority}
- Salary Estimate: ${job.salaryEstimate || 'Competitive'}
- Match Score: ${candidateMatch?.matchScore || 'N/A'}% (${candidateMatch?.matchTier || 'Analyzed'})

## Must-Have Core Skills:
${skillsAnalysis.mustHaveSkills.map(s => `- ${s.name} [${s.importance}]: ${s.description || ''}`).join('\n')}

## Nice-to-Have Skills:
${skillsAnalysis.niceToHaveSkills.map(s => `- ${s.name}: ${s.description || ''}`).join('\n')}

## Tech Stack Summary:
${skillsAnalysis.techStackOverview}

## Matched Candidate Skills:
${(candidateMatch?.matchedSkills || []).map(s => `- ${s}`).join('\n')}

## Missing Competencies & Strategy:
${(candidateMatch?.missingSkills || []).map(s => `- ${s.name} [${s.priority}]: ${s.recommendation}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success('Skill analysis copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Top Main Hero Card */}
      <Card className="border-brand-border bg-white shadow-sm overflow-hidden relative">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Job Meta info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-blue-700 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                {job.company ? job.company.slice(0, 2).toUpperCase() : 'JB'}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {job.title}
                  </h2>
                  {candidateMatch && getMatchTierBadge(candidateMatch.matchTier)}
                </div>

                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span>{job.company}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-normal flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location} ({job.workplaceType})
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[11px] gap-1 font-medium">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    {job.seniority}
                  </Badge>

                  {job.salaryEstimate && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] gap-1 font-semibold">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      {job.salaryEstimate}
                    </Badge>
                  )}

                  {(analysis.isGoogleSearchGrounded || job.isGoogleSearchGrounded || (analysis.groundingSources && analysis.groundingSources.length > 0)) && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200/80 text-[11px] gap-1 font-semibold shadow-2xs">
                      <Sparkles className="w-3 h-3 text-brand-primary" />
                      <span>Google Search Grounded</span>
                    </Badge>
                  )}

                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-primary hover:underline flex items-center gap-1 font-medium ml-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Original Posting</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Match Score Gauge & Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 lg:self-center">
              {candidateMatch && (
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ring-4 shadow-2xs ${getMatchScoreColor(candidateMatch.matchScore)}`}>
                  <div className="text-center">
                    <div className="text-2xl font-black tracking-tight leading-none">
                      {candidateMatch.matchScore}%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">
                      Profile Fit
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200/80" />
                  <div className="text-xs">
                    <div className="font-bold leading-tight">
                      {candidateMatch.matchedSkills.length} Matched
                    </div>
                    <div className="text-[11px] opacity-80">
                      {candidateMatch.missingSkills.length} Gap areas
                    </div>
                  </div>
                </div>
              )}

                {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleLaunchOutreach}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs h-9 px-3.5 gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>1-Click Outreach</span>
                </Button>

                {onTrackInPipeline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTrackInPipeline(analysis, 'applied')}
                    className={`h-9 px-3 text-xs gap-1.5 font-medium border-slate-200 ${
                      isPipelineTracked 
                        ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isPipelineTracked ? `Tracked (${pipelineStatus || 'Applied'})` : 'Track in Pipeline'}</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReport}
                  className="h-9 px-3 text-xs gap-1.5 font-medium border-slate-200 hover:bg-slate-50"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied' : 'Export Report'}</span>
                </Button>

                {onSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSave(analysis)}
                    className={`h-9 px-3 text-xs gap-1.5 font-medium border-slate-200 ${
                      isSaved ? 'bg-blue-50 text-brand-primary border-blue-200 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-primary text-brand-primary' : 'text-slate-500'}`} />
                    <span>{isSaved ? 'Saved to Radar' : 'Save Job'}</span>
                  </Button>
                )}

                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-9 w-9 text-slate-400 hover:text-slate-700"
                    title="Close analysis"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Executive Summary Banner */}
          {job.summary && (
            <div className="mt-5 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 mr-1">Role Mission:</span>
                <span>{job.summary}</span>
              </div>
            </div>
          )}

          {/* Grounding Sources Chips */}
          {(analysis.groundingSources && analysis.groundingSources.length > 0) && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-500" />
                Verified Web Sources:
              </span>
              {analysis.groundingSources.slice(0, 5).map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50/80 hover:bg-blue-100 text-blue-800 border border-blue-200/70 rounded-lg text-[11px] font-medium transition-colors"
                >
                  <span className="truncate max-w-[200px]">{source.title || source.url}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-6 border-t border-slate-200/80 bg-slate-50/50 overflow-x-auto">
          <button
            id="tab-visual-analytics"
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'visual'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Skill Analysis & Gap Visualizer</span>
            <Badge className="ml-1 text-[10px] h-4 px-1.5 py-0 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-none font-mono">
              Recharts
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'skills'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Skills & Tech Stack Matrix</span>
            <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5 py-0">
              {skillsAnalysis.mustHaveSkills.length + skillsAnalysis.niceToHaveSkills.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('match')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'match'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Candidate Gap & Fit Battleplan</span>
            {candidateMatch && (
              <Badge className="ml-1 text-[10px] h-4 px-1.5 py-0 bg-blue-100 text-blue-800 hover:bg-blue-100 border-none font-bold">
                {candidateMatch.matchScore}%
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'interview'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Interview Strategy & Questions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'raw'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full Job Details</span>
          </button>
        </div>
      </Card>

      {/* Tab Content Section */}
      <div className="space-y-6">

        {/* TAB 0: RECHARTS SKILL ANALYSIS & GAP VISUALIZER */}
        {activeTab === 'visual' && (
          <div className="animate-in fade-in duration-300">
            <SkillAnalysisChart analysis={analysis} />
          </div>
        )}

        {/* TAB 1: SKILLS & TECH STACK MATRIX */}
        {activeTab === 'skills' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Tech Stack Overview */}
            {skillsAnalysis.techStackOverview && (
              <Card className="border-brand-border bg-gradient-to-r from-blue-50/50 to-indigo-50/30 shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-blue-200 text-brand-primary flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Technical Architecture Overview
                    </h4>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      {skillsAnalysis.techStackOverview}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Must-Have Core Skills */}
              <Card className="border-brand-border shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Must-Have Core Skills ({skillsAnalysis.mustHaveSkills.length})
                      </CardTitle>
                    </div>
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      Non-Negotiable
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 divide-y divide-slate-100">
                  {skillsAnalysis.mustHaveSkills.map((skill) => {
                    const isCandidateMatched = candidateMatch?.matchedSkills.some(
                      s => s.toLowerCase() === skill.name.toLowerCase() || skill.name.toLowerCase().includes(s.toLowerCase())
                    );

                    return (
                      <div key={skill.name} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-500 bg-slate-50 font-mono">
                              {skill.category}
                            </Badge>
                            {skill.importance === 'Critical' && (
                              <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0 border-none font-bold">
                                Critical
                              </Badge>
                            )}
                          </div>
                          {skill.description && (
                            <p className="text-[11px] text-slate-500 leading-snug">
                              {skill.description}
                            </p>
                          )}
                        </div>

                        {candidateMatch && (
                          <div className="shrink-0 pt-0.5">
                            {isCandidateMatched ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Skill Gap</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Nice-to-Have & Differentiator Skills */}
              <Card className="border-brand-border shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Nice-to-Have & Bonus Skills ({skillsAnalysis.niceToHaveSkills.length})
                      </CardTitle>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Competitive Advantage
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 divide-y divide-slate-100">
                  {skillsAnalysis.niceToHaveSkills.map((skill) => (
                    <div key={skill.name} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-500 bg-slate-50 font-mono">
                          {skill.category}
                        </Badge>
                      </div>
                      {skill.description && (
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Categorized Skills Cloud Matrix */}
            <Card className="border-brand-border shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-primary" />
                  <span>Full Categorized Technical & Functional Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillsAnalysis.skillCategories.map((cat) => (
                    <div key={cat.category} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{cat.skills.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-medium rounded-md shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Core Responsibilities */}
            <Card className="border-brand-border shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Responsibilities & Deliverables</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-2.5">
                  {skillsAnalysis.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-brand-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: CANDIDATE GAP & FIT BATTLEPLAN */}
        {activeTab === 'match' && candidateMatch && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Candidate Alignment Assessment */}
            <Card className="border-brand-border bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-brand-primary" />
                  <span>AI Candidate Fit Assessment</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {candidateMatch.alignmentSummary}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Strengths */}
              <Card className="border-emerald-200 bg-emerald-50/20 shadow-xs">
                <CardHeader className="pb-3 border-b border-emerald-100">
                  <CardTitle className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Directly Matched Skills ({candidateMatch.matchedSkills.length})</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-emerald-700">
                    Skills verified directly against your loaded profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {candidateMatch.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transferable Strengths */}
              <Card className="border-blue-200 bg-blue-50/20 shadow-xs">
                <CardHeader className="pb-3 border-b border-blue-100">
                  <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-primary" />
                    <span>Transferable Strengths & Bridges</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-blue-700">
                    Experiences that position you ahead of competing applicants.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {candidateMatch.transferableStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{str}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Skill Gaps & Actionable Recommendations */}
            <Card className="border-amber-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-amber-100 bg-amber-50/40">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Skill Gaps & Tactical Defense Recommendations ({candidateMatch.missingSkills.length})</span>
                  </CardTitle>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold">
                    Action Items
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-600">
                  Requirements mentioned in the job description that aren't on your profile, with talking strategies.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 divide-y divide-slate-100">
                {candidateMatch.missingSkills.map((gap) => (
                  <div key={gap.name} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{gap.name}</span>
                      <Badge className={`text-[9px] px-1.5 py-0 font-bold ${
                        gap.priority === 'Critical' 
                          ? 'bg-red-100 text-red-700 border-none' 
                          : gap.priority === 'High'
                          ? 'bg-amber-100 text-amber-800 border-none'
                          : 'bg-slate-100 text-slate-700 border-none'
                      }`}>
                        {gap.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      <span className="font-semibold text-slate-800 mr-1">AI Recommendation:</span>
                      {gap.recommendation}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Missing-Skill Interview Prep & Probing Questions (Collapsible Card) */}
            {candidateMatch.missingSkills && candidateMatch.missingSkills.length > 0 && (
              <MissingSkillsInterviewPrepCard
                analysisId={analysis.id}
                missingSkills={candidateMatch.missingSkills}
                jobDetails={{
                  title: job.title,
                  company: job.company,
                  seniority: job.seniority,
                  workplaceType: job.workplaceType,
                  techStackOverview: skillsAnalysis.techStackOverview,
                  responsibilities: skillsAnalysis.responsibilities,
                  summary: job.summary
                }}
                matchedSkills={candidateMatch.matchedSkills}
                defaultExpanded={true}
              />
            )}
          </div>
        )}

        {/* TAB 3: AI INTERVIEW STRATEGY & QUESTIONS */}
        {activeTab === 'interview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* AI Missing-Skill Interview Prep & Probing Questions Flagship Card */}
            {candidateMatch && candidateMatch.missingSkills && candidateMatch.missingSkills.length > 0 && (
              <MissingSkillsInterviewPrepCard
                analysisId={analysis.id}
                missingSkills={candidateMatch.missingSkills}
                jobDetails={{
                  title: job.title,
                  company: job.company,
                  seniority: job.seniority,
                  workplaceType: job.workplaceType,
                  techStackOverview: skillsAnalysis.techStackOverview,
                  responsibilities: skillsAnalysis.responsibilities,
                  summary: job.summary
                }}
                matchedSkills={candidateMatch.matchedSkills}
                defaultExpanded={true}
              />
            )}

            {/* Resume Tailoring Tips */}
            {candidateMatch?.resumeTailoringAdvice && (
              <Card className="border-brand-border shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Targeted Resume Tailoring Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2.5">
                    {candidateMatch.resumeTailoringAdvice.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <ChevronRight className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* High-Impact Recruiter Screen Talking Points */}
            {candidateMatch?.suggestedTalkingPoints && (
              <Card className="border-brand-border shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>High-Impact Phone Screen Talking Points</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2.5">
                    {candidateMatch.suggestedTalkingPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Technical Probing Questions to Expect */}
            {candidateMatch?.interviewQuestionsToExpect && (
              <Card className="border-brand-border shadow-xs">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-brand-primary" />
                      <span>Likely Technical & Architecture Probing Questions</span>
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={handleLaunchOutreach}
                      className="h-7 text-xs px-2.5 bg-brand-primary text-white font-semibold gap-1"
                    >
                      <span>Simulate Live</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {candidateMatch.interviewQuestionsToExpect.map((q, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                          <span>{q.question}</span>
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-500 bg-white font-mono shrink-0">
                          {q.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        <span className="font-semibold text-slate-800 mr-1">Recommended Response Strategy:</span>
                        {q.recommendedAngle}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TAB 4: FULL RAW JOB DETAILS */}
        {activeTab === 'raw' && (
          <Card className="border-brand-border shadow-xs animate-in fade-in duration-300">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Extracted Job Posting & Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {job.fullDescription ? (
                <div className="prose prose-sm max-w-none text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {job.fullDescription}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No additional raw description cached. View key responsibilities in the Skills tab.
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

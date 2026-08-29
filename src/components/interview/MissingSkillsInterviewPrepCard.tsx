import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MissingSkillsInterviewPrepResult,
  MissingSkillPrepGroup,
  MissingSkillQuestion,
  MissingSkillAnswerEvaluation
} from '@/types/missingSkillPrep';
import {
  generateMissingSkillsInterviewPrep,
  evaluateMissingSkillAnswer,
  getSavedMissingSkillsPrep,
  saveMissingSkillsPrep,
  formatMissingSkillsPrepAsMarkdown
} from '@/lib/missingSkillsPrep';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  Send,
  Download,
  Search,
  Filter,
  Flame,
  ArrowRight,
  TrendingUp,
  Layers,
  FileText,
  Zap,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface MissingSkillsInterviewPrepCardProps {
  analysisId?: string;
  missingSkills: Array<{ name: string; priority?: string; recommendation?: string } | string>;
  jobDetails?: {
    title?: string;
    company?: string;
    seniority?: string;
    workplaceType?: string;
    techStackOverview?: string;
    responsibilities?: string[];
    summary?: string;
  };
  candidateProfile?: any;
  matchedSkills?: string[];
  defaultExpanded?: boolean;
  className?: string;
  onLaunchPracticeSimulator?: (question: string, context: any) => void;
}

export const MissingSkillsInterviewPrepCard: React.FC<MissingSkillsInterviewPrepCardProps> = ({
  analysisId,
  missingSkills = [],
  jobDetails,
  candidateProfile,
  matchedSkills = [],
  defaultExpanded = true,
  className = '',
  onLaunchPracticeSimulator
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<MissingSkillsInterviewPrepResult | null>(null);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  // Active interactive practice state
  const [activePracticeQuestionId, setActivePracticeQuestionId] = useState<string | null>(null);
  const [userPracticeAnswer, setUserPracticeAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, MissingSkillAnswerEvaluation>>({});

  // Expanded answer previews
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  // Generate storage key
  const storageKey = analysisId || `job_${jobDetails?.company || 'comp'}_${jobDetails?.title || 'title'}`;

  // Normalized missing skills list
  const normalizedMissingSkills = missingSkills.map(s => 
    typeof s === 'string' ? { name: s, priority: 'High', recommendation: '' } : s
  );

  // Load cached prep on mount if available
  useEffect(() => {
    if (normalizedMissingSkills.length === 0) return;
    const cached = getSavedMissingSkillsPrep(storageKey);
    if (cached) {
      setPrepResult(cached);
    }
  }, [storageKey, normalizedMissingSkills.length]);

  // Handler: Generate tailored questions
  const handleGenerateQuestions = async (focusSkill?: string) => {
    if (normalizedMissingSkills.length === 0) {
      toast.error('No missing skills detected to generate questions for.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateMissingSkillsInterviewPrep({
        missingSkills: normalizedMissingSkills,
        jobDetails,
        candidateProfile,
        matchedSkills,
        focusSkill
      });

      setPrepResult(result);
      saveMissingSkillsPrep(storageKey, result);
      setIsExpanded(true);
      toast.success(`Generated ${result.totalQuestions} tailored interview prep questions!`);
    } catch (err: any) {
      console.error('Failed to generate missing skills prep:', err);
      toast.error(err.message || 'Failed to generate tailored interview prep.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Copy all questions and answers as formatted Markdown
  const handleCopyAll = () => {
    if (!prepResult) return;
    const md = formatMissingSkillsPrepAsMarkdown(prepResult);
    navigator.clipboard.writeText(md);
    setCopiedAll(true);
    toast.success('Complete interview preparation dossier copied to clipboard!');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Handler: Export Markdown file
  const handleExportMarkdown = () => {
    if (!prepResult) return;
    const md = formatMissingSkillsPrepAsMarkdown(prepResult);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview-Prep-${(jobDetails?.company || 'Target').replace(/\s+/g, '-')}-Missing-Skills.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded Interview Prep Dossier as Markdown!');
  };

  // Handler: Evaluate user practice answer
  const handleEvaluateAnswer = async (q: MissingSkillQuestion) => {
    if (!userPracticeAnswer.trim()) {
      toast.error('Please write an answer first to get AI feedback.');
      return;
    }

    setIsEvaluating(true);
    try {
      const evalResult = await evaluateMissingSkillAnswer({
        question: q.question,
        skillName: q.skillName,
        userAnswer: userPracticeAnswer,
        bridgeStrategy: q.bridgeStrategy,
        matchedSkills
      });

      setEvaluations(prev => ({
        ...prev,
        [q.id]: evalResult
      }));
      toast.success(`Answer scored: ${evalResult.score}/100 (${evalResult.grade})`);
    } catch (err: any) {
      console.error('Evaluation failed:', err);
      toast.error(err.message || 'Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleAnswerExpanded = (qId: string) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Filter groups and questions
  const filteredGroups = (prepResult?.prepGroups || []).filter(group => {
    if (selectedSkillFilter !== 'all' && group.skillName.toLowerCase() !== selectedSkillFilter.toLowerCase()) {
      return false;
    }
    return true;
  }).map(group => {
    if (!searchQuery.trim()) return group;
    const qMatches = group.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.bridgeStrategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.keywordsToDrop.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return {
      ...group,
      questions: qMatches
    };
  }).filter(group => group.questions.length > 0 || !searchQuery.trim());

  if (normalizedMissingSkills.length === 0) {
    return null;
  }

  return (
    <Card className={`border border-amber-200/90 bg-white shadow-sm overflow-hidden transition-all duration-300 ${className}`}>
      {/* Collapsible Card Header */}
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/60 p-4 sm:p-5 border-b border-amber-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Header Left Info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <BrainCircuit className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>AI Missing-Skill Interview Prep & Defense</span>
                </h3>
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px] px-2 py-0.5">
                  {normalizedMissingSkills.length} Skill Gaps
                </Badge>
                {prepResult && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] px-2 py-0.5">
                    {prepResult.totalQuestions} Tailored Questions Ready
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Anticipate tough interviewer probes on missing technologies with structured STAR bridge blueprints.
              </p>
            </div>
          </div>

          {/* Header Right Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {prepResult && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  className="h-8 px-2.5 text-xs font-semibold border-amber-200 text-amber-900 hover:bg-amber-100/60 gap-1"
                  title="Copy formatted interview prep dossier"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">{copiedAll ? 'Copied' : 'Copy Prep Notes'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportMarkdown}
                  className="h-8 px-2 text-xs font-semibold border-amber-200 text-amber-900 hover:bg-amber-100/60 hidden sm:flex items-center gap-1"
                  title="Download Markdown Study Sheet"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGenerateQuestions()}
                  disabled={isLoading}
                  className="h-8 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1"
                  title="Regenerate questions"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden lg:inline">Regenerate</span>
                </Button>
              </>
            )}

            {!prepResult && (
              <Button
                size="sm"
                onClick={() => handleGenerateQuestions()}
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 px-3 gap-1.5 shadow-xs"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate Questions</span>
              </Button>
            )}

            {/* Expand / Collapse Accordion Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 border-amber-200 bg-white/80 hover:bg-white text-slate-700"
              aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
              title={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Collapsed Preview Teaser (Visible when card is closed or initial) */}
        {!isExpanded && (
          <div className="mt-3 pt-3 border-t border-amber-100/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Target Gaps:
              </span>
              {normalizedMissingSkills.map((gap, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[11px] font-semibold"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${gap.priority === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  {gap.name}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 underline underline-offset-2"
            >
              <span>{prepResult ? `View ${prepResult.totalQuestions} Questions & Pivot Answers` : 'Generate & View Tailored Questions'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Content Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CardContent className="p-4 sm:p-6 space-y-6">

              {/* Initial State Prompt if Not Generated Yet */}
              {!prepResult && !isLoading && (
                <div className="p-8 text-center bg-amber-50/30 rounded-2xl border border-dashed border-amber-200 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {normalizedMissingSkills.length} Skill Gaps Identified in Analysis
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Generate targeted questions for {normalizedMissingSkills.map(s => s.name).slice(0, 3).join(', ')} with interviewer intent, STAR bridge strategies, and sample answers.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateQuestions()}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-5 gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Missing-Skills Prep Questions</span>
                  </Button>
                </div>
              )}

              {/* Loading State Spinner */}
              {isLoading && (
                <div className="py-12 text-center space-y-3 bg-amber-50/20 rounded-2xl border border-amber-100">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto animate-spin">
                    <Loader2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      Synthesizing Probing Questions & Transferable Bridge Blueprints...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Mapping candidate matched strengths against missing technologies
                    </p>
                  </div>
                </div>
              )}

              {/* Generated Content Available */}
              {prepResult && !isLoading && (
                <div className="space-y-6">

                  {/* General Defense Strategy Callout Banner */}
                  {prepResult.generalDefenseStrategy && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-xl border border-amber-200 text-xs leading-relaxed space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Master Interview Defense Blueprint for Gap Areas</span>
                      </div>
                      <p className="text-slate-800 text-xs font-medium pl-5">
                        {prepResult.generalDefenseStrategy}
                      </p>
                    </div>
                  )}

                  {/* Filter Pills & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Skill Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        Filter:
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSkillFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedSkillFilter === 'all'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All Gaps ({prepResult.totalQuestions})
                      </button>
                      {prepResult.prepGroups.map((g) => (
                        <button
                          key={g.skillName}
                          type="button"
                          onClick={() => setSelectedSkillFilter(g.skillName)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            selectedSkillFilter === g.skillName
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{g.skillName}</span>
                          <span className="text-[10px] opacity-80">({g.questions.length})</span>
                        </button>
                      ))}
                    </div>

                    {/* Search Within Questions */}
                    <div className="relative min-w-[200px] max-w-xs">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search questions or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Question Groups by Missing Skill */}
                  <div className="space-y-6">
                    {filteredGroups.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                        No questions match your filter or search query.
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <div key={group.skillName} className="space-y-4">
                          
                          {/* Group Skill Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50/90 rounded-xl border border-slate-200/80">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              <span className="font-bold text-slate-900 text-sm">
                                Missing Skill: {group.skillName}
                              </span>
                              <Badge className={`text-[9px] px-1.5 py-0 font-bold ${
                                group.priority === 'Critical'
                                  ? 'bg-red-100 text-red-700 border-none'
                                  : 'bg-amber-100 text-amber-800 border-none'
                              }`}>
                                {group.priority} Priority
                              </Badge>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-500 bg-white font-mono">
                                {group.gapType}
                              </Badge>
                            </div>

                            {/* Rapid Ramp Angle Tip */}
                            {group.fastLearnerProofAngle && (
                              <div className="text-[11px] text-amber-900 font-medium flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="font-bold">Fast-Learner Proof:</span>
                                <span>{group.fastLearnerProofAngle}</span>
                              </div>
                            )}
                          </div>

                          {/* Group Questions List */}
                          <div className="space-y-4 pl-0 sm:pl-2">
                            {group.questions.map((q, qIndex) => {
                              const isAnswerExpanded = !!expandedAnswers[q.id];
                              const isPracticeActive = activePracticeQuestionId === q.id;
                              const evaluation = evaluations[q.id];

                              return (
                                <div
                                  key={q.id || qIndex}
                                  className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 hover:border-amber-200 transition-colors"
                                >
                                  {/* Top Question Header */}
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="space-y-1 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] px-2 py-0 bg-blue-50 text-blue-700 border-blue-200 font-bold">
                                          {q.category || 'Technical Probe'}
                                        </Badge>
                                        <Badge className={`text-[10px] px-2 py-0 font-bold ${
                                          q.difficulty === 'Architectural Deep-Dive'
                                            ? 'bg-purple-100 text-purple-800 border-none'
                                            : q.difficulty === 'Scenario & Tradeoffs'
                                            ? 'bg-blue-100 text-blue-800 border-none'
                                            : 'bg-slate-100 text-slate-700 border-none'
                                        }`}>
                                          {q.difficulty}
                                        </Badge>
                                      </div>

                                      <h4 className="text-sm font-bold text-slate-900 leading-snug flex items-start gap-2 pt-1">
                                        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <span>{q.question}</span>
                                      </h4>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (activePracticeQuestionId === q.id) {
                                            setActivePracticeQuestionId(null);
                                          } else {
                                            setActivePracticeQuestionId(q.id);
                                            setUserPracticeAnswer('');
                                          }
                                        }}
                                        className={`h-7 px-2.5 text-xs font-semibold gap-1 ${
                                          isPracticeActive
                                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                      >
                                        <Target className="w-3 h-3 text-amber-600" />
                                        <span>{isPracticeActive ? 'Close Practice' : 'Practice Answering'}</span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Interviewer Intent / Hidden Trap */}
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                                      <span>What the Interviewer is Really Probing:</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed font-medium pl-5">
                                      {q.interviewerIntent}
                                    </p>
                                  </div>

                                  {/* Bridge Strategy Box */}
                                  <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-xl border border-blue-100 text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase tracking-wider text-[10px]">
                                      <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
                                      <span>Authentic Bridge Blueprint (Transferable Defense):</span>
                                    </div>
                                    <p className="text-slate-800 leading-relaxed pl-5 font-medium">
                                      {q.bridgeStrategy}
                                    </p>
                                  </div>

                                  {/* Keywords to Drop */}
                                  {q.keywordsToDrop && q.keywordsToDrop.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                        High-Signal Keywords:
                                      </span>
                                      {q.keywordsToDrop.map((kw, kwIdx) => (
                                        <span
                                          key={kwIdx}
                                          onClick={() => {
                                            navigator.clipboard.writeText(kw);
                                            toast.success(`Copied "${kw}" to clipboard!`);
                                          }}
                                          className="cursor-pointer hover:bg-slate-100 active:scale-95 transition-all px-2 py-0.5 bg-slate-50 border border-slate-200/90 text-slate-700 text-[11px] font-mono font-medium rounded-md shadow-2xs flex items-center gap-1"
                                          title="Click to copy term"
                                        >
                                          <span>{kw}</span>
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Pitfall to Avoid */}
                                  {q.pitfallsToAvoid && (
                                    <div className="text-[11px] text-red-700 bg-red-50/80 p-2.5 rounded-lg border border-red-100 flex items-start gap-2">
                                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold mr-1">Avoid This Pitfall:</span>
                                        <span>{q.pitfallsToAvoid}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Collapsible Model Star Answer */}
                                  <div className="border-t border-slate-100 pt-3">
                                    <div className="flex items-center justify-between">
                                      <button
                                        type="button"
                                        onClick={() => toggleAnswerExpanded(q.id)}
                                        className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                                        <span>{isAnswerExpanded ? 'Hide Model Star Answer' : 'View Gold-Standard Model Answer'}</span>
                                        {isAnswerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>

                                      {isAnswerExpanded && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(q.sampleModelAnswer);
                                            toast.success('Model answer copied!');
                                          }}
                                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>Copy Answer</span>
                                        </button>
                                      )}
                                    </div>

                                    {isAnswerExpanded && (
                                      <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans italic animate-in fade-in duration-200">
                                        "{q.sampleModelAnswer}"
                                      </div>
                                    )}
                                  </div>

                                  {/* In-Card Interactive Practice Sandbox */}
                                  {isPracticeActive && (
                                    <div className="mt-3 p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-3 animate-in fade-in duration-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                                          <Target className="w-4 h-4 text-amber-600" />
                                          <span>Live Practice: Test Your Bridge & Pivot Defense</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                          AI Bar Raiser Assessment
                                        </span>
                                      </div>

                                      <textarea
                                        rows={3}
                                        placeholder="Type how you would answer this missing-skill question in an interview (e.g. analogizing from your experience, explaining conceptual mechanics)..."
                                        value={userPracticeAnswer}
                                        onChange={(e) => setUserPracticeAnswer(e.target.value)}
                                        className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed resize-y"
                                      />

                                      <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-slate-500">
                                          Focus on honest bridge techniques and high-signal vocabulary.
                                        </p>
                                        <Button
                                          size="sm"
                                          onClick={() => handleEvaluateAnswer(q)}
                                          disabled={isEvaluating || !userPracticeAnswer.trim()}
                                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-7 px-3 gap-1.5"
                                        >
                                          {isEvaluating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                          <span>Score My Answer</span>
                                        </Button>
                                      </div>

                                      {/* Answer Evaluation Feedback Box */}
                                      {evaluation && (
                                        <div className="mt-4 p-4 bg-white rounded-xl border border-amber-200 space-y-3 animate-in fade-in duration-300">
                                          <div className="flex items-center justify-between border-b pb-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xl font-black text-slate-900">
                                                {evaluation.score}/100
                                              </span>
                                              <Badge className={`text-xs font-bold ${
                                                evaluation.score >= 80
                                                  ? 'bg-emerald-100 text-emerald-800'
                                                  : evaluation.score >= 65
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-amber-100 text-amber-800'
                                              }`}>
                                                {evaluation.grade}
                                              </Badge>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                              Bar Raiser Verdict
                                            </span>
                                          </div>

                                          <p className="text-xs text-slate-700 leading-relaxed">
                                            {evaluation.summary}
                                          </p>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            {/* Strengths */}
                                            {evaluation.strengths.length > 0 && (
                                              <div className="space-y-1">
                                                <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                  Strong Bridge Points:
                                                </span>
                                                <ul className="space-y-1 text-slate-600 text-[11px]">
                                                  {evaluation.strengths.map((st, sIdx) => (
                                                    <li key={sIdx} className="leading-snug">• {st}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}

                                            {/* Gaps / Vulnerabilities */}
                                            {evaluation.gapsInAnswer.length > 0 && (
                                              <div className="space-y-1">
                                                <span className="font-bold text-amber-700 flex items-center gap-1 text-[11px]">
                                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                                  Vulnerable Angles:
                                                </span>
                                                <ul className="space-y-1 text-slate-600 text-[11px]">
                                                  {evaluation.gapsInAnswer.map((gp, gIdx) => (
                                                    <li key={gIdx} className="leading-snug">• {gp}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>

                                          {/* Model Refined Delivery */}
                                          {evaluation.modelRefinedAnswer && (
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                                              <span className="font-bold text-slate-900 text-[11px]">
                                                AI Polished Script Version:
                                              </span>
                                              <p className="text-slate-700 italic leading-relaxed">
                                                "{evaluation.modelRefinedAnswer}"
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                </div>
                              );
                            })}
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

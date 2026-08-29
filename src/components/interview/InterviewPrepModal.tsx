import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  InterviewPrepDossier,
  TechnicalQuestion,
  BehavioralQuestion,
  StrategicTip,
  QuestionToAskInterviewer,
  AnswerEvaluationResult,
} from '@/types/interviewPrep';
import {
  evaluateInterviewAnswer,
  triggerInterviewPrepAgent,
} from '@/lib/interviewPrep';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ShieldCheck,
  MessageSquare,
  Flame,
  Award,
  Zap,
  HelpCircle,
  Send,
  Loader2,
  Terminal,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'project' | 'outreach' | 'job';
  targetName: string;
  subtitle?: string;
  tags?: string[];
  capOrSalary?: string;
  jobDescription?: string;
  candidateProfile?: any;
  notes?: string;
  initialDossier?: InterviewPrepDossier | null;
  onLaunchSimulator?: (seedContext: any) => void;
}

type TabType = 'overview' | 'technical' | 'behavioral' | 'tips' | 'reverse' | 'practice';

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetName,
  subtitle,
  tags = [],
  capOrSalary,
  jobDescription,
  candidateProfile,
  notes,
  initialDossier,
  onLaunchSimulator,
}) => {
  const [dossier, setDossier] = useState<InterviewPrepDossier | null>(initialDossier || null);
  const [isLoading, setIsLoading] = useState(!initialDossier);
  const [activeTab, setActiveTab] = useState<TabType>('technical');
  const [generationStep, setGenerationStep] = useState(0);

  // Technical question expanded accordion state
  const [expandedTechId, setExpandedTechId] = useState<string | null>(null);
  const [expandedBehId, setExpandedBehId] = useState<string | null>(null);

  // Practice Mode state
  const [selectedPracticeQuestion, setSelectedPracticeQuestion] = useState<string>('');
  const [selectedPracticeCategory, setSelectedPracticeCategory] = useState<string>('Technical');
  const [practiceAnswer, setPracticeAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<AnswerEvaluationResult | null>(null);

  const generationSteps = [
    'Parsing project architecture & domain specifications...',
    'Synthesizing Principal-level system design & technical questions...',
    'Formulating STAR behavioral frameworks & evaluation benchmarks...',
    'Generating edge-case probes & reverse-interview inquiries...',
    'Assembling master AI Interview Preparation Dossier...',
  ];

  // Fetch or trigger dossier when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadOrGenerate() {
      setIsLoading(true);
      setGenerationStep(0);

      // Simulate realistic progress steps for engaging feedback
      const stepInterval = setInterval(() => {
        setGenerationStep((prev) => {
          if (prev < generationSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 750);

      try {
        const result = await triggerInterviewPrepAgent({
          targetId,
          targetType,
          targetName,
          subtitle,
          tags,
          capOrSalary,
          jobDescription,
          candidateProfile,
          notes,
        });

        if (isMounted) {
          setDossier(result);
          if (result.technicalQuestions.length > 0) {
            setExpandedTechId(result.technicalQuestions[0].id);
            setSelectedPracticeQuestion(result.technicalQuestions[0].question);
            setSelectedPracticeCategory(result.technicalQuestions[0].category);
          }
        }
      } catch (err) {
        console.error('Failed to generate interview prep:', err);
        toast.error('Could not synthesize dossier, loaded fallback.');
      } finally {
        clearInterval(stepInterval);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!initialDossier || initialDossier.targetId !== targetId) {
      loadOrGenerate();
    } else {
      setDossier(initialDossier);
      setIsLoading(false);
      if (initialDossier.technicalQuestions?.length > 0) {
        setExpandedTechId(initialDossier.technicalQuestions[0].id);
        setSelectedPracticeQuestion(initialDossier.technicalQuestions[0].question);
        setSelectedPracticeCategory(initialDossier.technicalQuestions[0].category);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetId]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setGenerationStep(0);
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < generationSteps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const refreshed = await triggerInterviewPrepAgent(
        {
          targetId,
          targetType,
          targetName,
          subtitle,
          tags,
          capOrSalary,
          jobDescription,
          candidateProfile,
          notes,
        },
        true
      );
      setDossier(refreshed);
      toast.success('Interview Prep Dossier regenerated with fresh AI insights!');
    } catch {
      toast.error('Failed to regenerate');
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!dossier) return;

    let md = `# AI Interview Preparation Dossier: ${dossier.targetName}\n\n`;
    md += `**Target Subtitle:** ${dossier.subtitle || 'Technical Initiative'}\n`;
    md += `**Generated:** ${new Date(dossier.generatedAt).toLocaleString()}\n\n`;
    md += `## Role & Architecture Summary\n${dossier.roleSummary}\n\n`;

    md += `## Technical & System Design Questions\n`;
    dossier.technicalQuestions.forEach((q, idx) => {
      md += `### ${idx + 1}. [${q.difficulty}] ${q.question}\n`;
      md += `**Category:** ${q.category}\n`;
      md += `**Interviewer Intent:** ${q.whyTheyAsk}\n`;
      md += `**Key Focus:** ${q.keyConcepts.join(', ')}\n`;
      md += `**Answer Blueprint:**\n${q.sampleAnswerFramework}\n\n`;
    });

    md += `## Behavioral & Leadership Questions\n`;
    dossier.behavioralQuestions.forEach((q, idx) => {
      md += `### ${idx + 1}. ${q.question}\n`;
      md += `**Ideal Approach:** ${q.idealAnswerApproach}\n`;
      md += `**Red Flags to Avoid:** ${q.redFlagsToAvoid}\n\n`;
    });

    md += `## Strategic Prep Tips\n`;
    dossier.strategicTips.forEach((tip) => {
      md += `- **[${tip.category}] ${tip.title}**: ${tip.tip}\n`;
    });

    md += `\n## Reverse Questions for Interviewer\n`;
    dossier.questionsToAskInterviewer.forEach((q, idx) => {
      md += `${idx + 1}. **${q.question}** (${q.category})\n   *Rationale:* ${q.rationale}\n\n`;
    });

    navigator.clipboard.writeText(md);
    toast.success('Full Interview Dossier copied to clipboard as Markdown!');
  };

  const handleEvaluatePractice = async () => {
    if (!practiceAnswer.trim() || !dossier) return;
    setIsEvaluating(true);
    try {
      const res = await evaluateInterviewAnswer(
        selectedPracticeQuestion,
        selectedPracticeCategory,
        practiceAnswer,
        {
          targetName: dossier.targetName,
          targetType: dossier.targetType,
          roleSummary: dossier.roleSummary,
        }
      );
      setEvaluationResult(res);
      toast.success('Answer evaluated by AI Bar Raiser!');
    } catch {
      toast.error('Evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.12 }}
          className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0d12] border border-purple-500/30 rounded-3xl shadow-[0_0_60px_rgba(139,92,246,0.25)] flex flex-col overflow-hidden z-10"
        >
          {/* Top Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <BrainCircuit className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    AI Interview Preparation Battleplan
                  </h2>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono uppercase px-2 py-0.5">
                    Automated Agent
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Target: <span className="text-white font-bold">{targetName}</span>
                  {capOrSalary && <span className="text-purple-300 ml-2">({capOrSalary})</span>}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs h-8"
                title="Regenerate Interview Prep"
              >
                <RotateCcw className={cn('w-3.5 h-3.5 mr-1.5', isLoading && 'animate-spin')} />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMarkdown}
                disabled={isLoading || !dossier}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs h-8"
                title="Copy Full Dossier"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Dossier
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[420px]">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center animate-pulse">
                  <Bot className="w-10 h-10 text-purple-400" />
                </div>
                <div className="absolute -inset-2 rounded-3xl bg-purple-500/20 blur-xl -z-10 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-black text-white">
                  Synthesizing Interview Strategy
                </h3>
                <p className="text-xs text-purple-300 font-mono">
                  {generationSteps[generationStep]}
                </p>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center gap-2">
                {generationSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500',
                      idx === generationStep
                        ? 'w-8 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                        : idx < generationStep
                        ? 'w-3 bg-purple-600'
                        : 'w-3 bg-white/10'
                    )}
                  />
                ))}
              </div>
            </div>
          ) : !dossier ? (
            <div className="p-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-amber-400" />
              <p>No dossier available. Click regenerate to trigger the AI Agent.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Tab Navigation */}
              <div className="px-6 border-b border-white/10 bg-white/[0.01] flex items-center gap-2 overflow-x-auto scrollbar-none py-2.5">
                {[
                  { id: 'technical', label: 'Technical & Architecture', count: dossier.technicalQuestions.length, icon: Cpu },
                  { id: 'behavioral', label: 'Behavioral & Leadership', count: dossier.behavioralQuestions.length, icon: Layers },
                  { id: 'tips', label: 'Tactical Prep Tips', count: dossier.strategicTips.length, icon: Lightbulb },
                  { id: 'reverse', label: 'Reverse Questions', count: dossier.questionsToAskInterviewer.length, icon: HelpCircle },
                  { id: 'practice', label: 'AI Practice Studio', badge: 'Interactive', icon: Terminal },
                  { id: 'overview', label: 'Executive Briefing', icon: Award },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={cn(
                        'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all',
                        isActive
                          ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded-md',
                            isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                          )}
                        >
                          {tab.count}
                        </span>
                      )}
                      {tab.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-black uppercase">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Tab Content View */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. TECHNICAL & SYSTEM DESIGN TAB */}
                {activeTab === 'technical' && (
                  <div className="space-y-6">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-purple-200">
                      <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block mb-0.5">
                          Architectural Signal Strategy:
                        </strong>
                        Interviews for {targetName} will evaluate fault tolerance, data flow isolation, and scale boundaries. Expand any question below to study the sample answer blueprint or test yourself in the Practice Studio.
                      </div>
                    </div>

                    <div className="space-y-4">
                      {dossier.technicalQuestions.map((q, idx) => {
                        const isExpanded = expandedTechId === q.id;
                        return (
                          <div
                            key={q.id || idx}
                            className={cn(
                              'bg-[#12131a] border rounded-2xl p-5 transition-all',
                              isExpanded
                                ? 'border-purple-500/40 shadow-[0_0_25px_rgba(139,92,246,0.15)]'
                                : 'border-white/10 hover:border-white/20'
                            )}
                          >
                            <div
                              onClick={() => setExpandedTechId(isExpanded ? null : q.id)}
                              className="flex items-start justify-between gap-4 cursor-pointer"
                            >
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono text-[10px]">
                                    {q.category}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'font-mono text-[10px]',
                                      q.difficulty === 'Staff / Principal'
                                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                    )}
                                  >
                                    {q.difficulty}
                                  </Badge>
                                </div>
                                <h4 className="text-base font-bold text-white leading-snug">
                                  {idx + 1}. {q.question}
                                </h4>
                              </div>
                              <button
                                type="button"
                                className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white shrink-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            {/* Collapsible Blueprint */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t border-white/10 space-y-4"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-black/40 border border-white/5 rounded-xl p-3.5">
                                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                                        Why Interviewers Ask This
                                      </p>
                                      <p className="text-xs text-slate-300 leading-relaxed">
                                        {q.whyTheyAsk}
                                      </p>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-xl p-3.5">
                                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                                        Key Focus & Buzzwords
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {q.keyConcepts.map((c, i) => (
                                          <span
                                            key={i}
                                            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[11px] text-purple-300 font-mono"
                                          >
                                            {c}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-black/60 border border-purple-500/20 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                                        Sample Answer Blueprint & Framework
                                      </p>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setSelectedPracticeQuestion(q.question);
                                          setSelectedPracticeCategory(q.category);
                                          setActiveTab('practice');
                                        }}
                                        className="text-xs text-purple-300 hover:text-white hover:bg-purple-500/20 h-7"
                                      >
                                        Practice in AI Studio <ArrowRight className="w-3 h-3 ml-1" />
                                      </Button>
                                    </div>
                                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                                      {q.sampleAnswerFramework}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tough Probing Questions */}
                    {dossier.toughProbingQuestions && dossier.toughProbingQuestions.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                          <Flame className="w-4 h-4" /> Tough "Curveball" Probes & Stress Tests
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dossier.toughProbingQuestions.map((probe, i) => (
                            <div
                              key={probe.id || i}
                              className="bg-[#12131a] border border-amber-500/20 rounded-2xl p-4 space-y-2.5"
                            >
                              <h4 className="text-sm font-bold text-white">"{probe.question}"</h4>
                              <p className="text-xs text-slate-400">
                                <strong>Interviewer Trap:</strong> {probe.scenario}
                              </p>
                              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                                💡 <strong>Pro Tip:</strong> {probe.proTip}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. BEHAVIORAL & LEADERSHIP TAB */}
                {activeTab === 'behavioral' && (
                  <div className="space-y-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-xs text-indigo-200">
                      <strong className="text-white block mb-0.5">The STAR Method Engine:</strong>
                      Structure answers as <strong>Situation</strong> (10%), <strong>Task</strong> (10%), <strong>Action</strong> (60% - technical decisions & agency), and <strong>Measurable Result</strong> (20% - performance or business metric).
                    </div>

                    <div className="space-y-4">
                      {dossier.behavioralQuestions.map((q, idx) => {
                        const isExpanded = expandedBehId === q.id;
                        return (
                          <div
                            key={q.id || idx}
                            className="bg-[#12131a] border border-white/10 rounded-2xl p-5 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-mono text-[10px]">
                                {q.category}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPracticeQuestion(q.question);
                                  setSelectedPracticeCategory(q.category);
                                  setActiveTab('practice');
                                }}
                                className="text-xs text-indigo-300 hover:text-white hover:bg-indigo-500/20 h-7"
                              >
                                Practice Answer <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                            <h4 className="text-base font-bold text-white">{idx + 1}. {q.question}</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-300">
                                <p className="font-mono font-bold uppercase text-[10px] mb-1 text-emerald-400">
                                  ✓ Recommended Strategy
                                </p>
                                {q.idealAnswerApproach}
                              </div>
                              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 text-xs text-rose-300">
                                <p className="font-mono font-bold uppercase text-[10px] mb-1 text-rose-400">
                                  ✕ Red Flags to Avoid
                                </p>
                                {q.redFlagsToAvoid}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. TACTICAL PREP TIPS TAB */}
                {activeTab === 'tips' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dossier.strategicTips.map((tip, idx) => (
                        <div
                          key={tip.id || idx}
                          className="bg-[#12131a] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] font-mono bg-white/5 border-white/10 text-slate-300">
                                {tip.category}
                              </Badge>
                              {tip.impactLevel === 'Critical' && (
                                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[9px] font-mono uppercase">
                                  Critical Leverage
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white">{tip.title}</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{tip.tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. REVERSE QUESTIONS TAB */}
                {activeTab === 'reverse' && (
                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-xs text-purple-200">
                      <strong className="text-white block mb-0.5">Turn the Table:</strong>
                      Top 1% candidates differentiate themselves by asking high-leverage architectural and strategic questions. Use these questions at the end of your interview.
                    </div>

                    <div className="space-y-3">
                      {dossier.questionsToAskInterviewer.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="bg-[#12131a] border border-white/10 rounded-2xl p-5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
                              {q.category}
                            </Badge>
                            <span className="text-[10px] font-mono text-slate-500">Question #{idx + 1}</span>
                          </div>
                          <h4 className="text-base font-bold text-white">"{q.question}"</h4>
                          <p className="text-xs text-slate-400 italic">
                            <strong>Why this works:</strong> {q.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. INTERACTIVE PRACTICE STUDIO TAB */}
                {activeTab === 'practice' && (
                  <div className="space-y-6">
                    <div className="bg-[#12131a] border border-purple-500/30 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                          <Terminal className="w-4 h-4" /> Live AI Bar Raiser Practice Studio
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">Real-Time Scoring</span>
                      </div>

                      {/* Question selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-mono">Selected Question to Answer:</label>
                        <select
                          value={selectedPracticeQuestion}
                          onChange={(e) => {
                            setSelectedPracticeQuestion(e.target.value);
                            setEvaluationResult(null);
                          }}
                          className="w-full bg-black/70 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          {dossier.technicalQuestions.map((q, i) => (
                            <option key={`t-${i}`} value={q.question}>
                              [Tech] {q.question}
                            </option>
                          ))}
                          {dossier.behavioralQuestions.map((q, i) => (
                            <option key={`b-${i}`} value={q.question}>
                              [Behavioral] {q.question}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Answer Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-mono">Your Answer (Type or outline your response):</label>
                        <textarea
                          rows={6}
                          placeholder="Draft your answer here... Mention architecture choices, trade-offs, metrics, and STAR steps."
                          value={practiceAnswer}
                          onChange={(e) => setPracticeAnswer(e.target.value)}
                          className="w-full bg-black/80 border border-white/15 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed font-sans"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-mono text-slate-500">
                          {practiceAnswer.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                        <Button
                          onClick={handleEvaluatePractice}
                          disabled={isEvaluating || !practiceAnswer.trim()}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Evaluating Answer...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Submit to AI Bar Raiser
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Evaluation Result View */}
                    <AnimatePresence>
                      {evaluationResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="bg-[#12131a] border border-emerald-500/30 rounded-2xl p-6 space-y-5"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                                Bar Raiser Evaluation
                              </p>
                              <h4 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                                Tier: <span className="text-emerald-400">{evaluationResult.grade}</span>
                              </h4>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-black font-mono text-emerald-400">
                                {evaluationResult.score}/100
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-slate-300">
                            {evaluationResult.summary}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                              <h5 className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Top Strengths
                              </h5>
                              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                                {evaluationResult.strengths.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
                              <h5 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5" /> Key Areas for Improvement
                              </h5>
                              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                                {evaluationResult.improvements.map((imp, i) => (
                                  <li key={i}>{imp}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {evaluationResult.modelRefinedAnswer && (
                            <div className="bg-black/60 border border-purple-500/20 rounded-xl p-4 space-y-2">
                              <p className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-purple-400" /> Staff-Level Model Refined Answer
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                {evaluationResult.modelRefinedAnswer}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 6. EXECUTIVE OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-[#12131a] border border-white/10 rounded-2xl p-5 space-y-3">
                      <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-300">
                        Strategic Role & Architectural Thesis
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dossier.roleSummary}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                        Target Evaluation Competency Matrix
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dossier.keyCompetencies.map((comp, idx) => (
                          <div
                            key={idx}
                            className="bg-[#12131a] border border-white/10 rounded-2xl p-4 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-white">{comp.name}</h4>
                              <Badge
                                className={cn(
                                  'text-[9px] font-mono uppercase',
                                  comp.priority === 'Critical'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                )}
                              >
                                {comp.priority} Priority
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">{comp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Bar */}
              <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dossier cached locally for offline review</span>
                </div>

                <div className="flex items-center gap-3">
                  {onLaunchSimulator && (
                    <Button
                      onClick={() => {
                        onClose();
                        onLaunchSimulator(dossier.simulationSeed);
                      }}
                      className="bg-brand-primary text-black font-bold text-xs rounded-xl hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Launch Recruiter Chat Simulator
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-white/10 text-slate-300 hover:text-white rounded-xl text-xs"
                  >
                    Close Dossier
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

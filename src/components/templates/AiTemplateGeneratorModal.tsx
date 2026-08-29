import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Loader2, 
  Wand2, 
  Lightbulb, 
  ArrowRight, 
  Check, 
  Tag, 
  Send,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateEmailTemplate } from '@/lib/gemini';
import { OutreachTemplate, TemplateCategory, TemplateAudience, TemplateTone } from '@/types/template';
import { toast } from 'sonner';

interface AiTemplateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateGenerated: (template: Partial<OutreachTemplate>) => void;
}

const STRATEGY_PROMPTS = [
  {
    title: 'The Unfair Proof-of-Work Hook',
    prompt: 'A high-impact email to a VP of Engineering or Tech Lead highlighting a recent open source project or architecture proof-of-work that directly solves their engineering scaling challenges.',
    category: 'hiring_manager' as TemplateCategory,
    audience: 'Hiring Managers' as TemplateAudience,
    tone: 'Value & Metric Heavy' as TemplateTone
  },
  {
    title: 'Startup Founder 1-Sentence Pitch',
    prompt: 'A crisp, no-fluff cold pitch to an early-stage YC founder emphasizing speed of execution, zero-friction ramp-up, and shipping product from day one.',
    category: 'executive_hook' as TemplateCategory,
    audience: 'Founders / Executives' as TemplateAudience,
    tone: 'Direct & Punchy' as TemplateTone
  },
  {
    title: 'Technical Recruiter 30-Second Scan',
    prompt: 'A skimmable bulleted email formatted specifically for technical recruiters with immediate proof of core stack alignment and direct links to code/case studies.',
    category: 'recruiter_cold' as TemplateCategory,
    audience: 'Recruiters' as TemplateAudience,
    tone: 'Direct & Punchy' as TemplateTone
  },
  {
    title: 'Casual Peer Engineer Coffee Request',
    prompt: 'A humble, non-transactional note to a senior engineer on the team asking about their tech stack architecture and team culture over a quick 10-minute virtual coffee.',
    category: 'peer_referral' as TemplateCategory,
    audience: 'Engineers / Peers' as TemplateAudience,
    tone: 'Warm & Conversational' as TemplateTone
  }
];

export function AiTemplateGeneratorModal({
  isOpen,
  onClose,
  onTemplateGenerated
}: AiTemplateGeneratorModalProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [category, setCategory] = useState<TemplateCategory>('hiring_manager');
  const [audience, setAudience] = useState<TemplateAudience>('Hiring Managers');
  const [tone, setTone] = useState<TemplateTone>('Direct & Punchy');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) {
      toast.error('Please describe your outreach strategy or pick a preset idea.');
      return;
    }

    setLoading(true);
    try {
      const result = await generateEmailTemplate({
        prompt: textToUse,
        category,
        audience,
        tone
      });

      toast.success('Generated custom email template with placeholders!');
      onTemplateGenerated({
        title: result.title || 'AI Custom Outreach Template',
        description: result.description || textToUse,
        category: (result.category as TemplateCategory) || category,
        targetAudience: (result.targetAudience as TemplateAudience) || audience,
        tone: (result.tone as TemplateTone) || tone,
        subject: result.subject || '{{candidate_name}} - {{job_title}} at {{company_name}}',
        body: result.body || '',
        tags: result.tags || ['AI Generated', category, tone]
      });
      onClose();
    } catch (err: any) {
      console.error('Template generation error:', err);
      toast.error(err.message || 'Failed to generate template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (p: typeof STRATEGY_PROMPTS[0]) => {
    setPrompt(p.prompt);
    setCategory(p.category);
    setAudience(p.audience);
    setTone(p.tone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                Generate Template with AI
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Gemini Powered
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Craft a tailored cold outreach framework with smart handlebars placeholders
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Strategy Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Quick Strategy Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STRATEGY_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-brand-primary/50 hover:shadow-2xs transition-all group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-brand-primary transition-colors flex items-center justify-between">
                    {p.title}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                    {p.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Strategy Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Describe Your Outreach Goal or Angle:
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Write a concise email to an Engineering Manager highlighting my experience scaling Next.js and Tailwind apps for high-traffic SaaS products..."
              className="w-full text-sm p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none leading-relaxed transition-all"
            />
          </div>

          {/* Target Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="hiring_manager">Hiring Manager Pitch</option>
                <option value="recruiter_cold">Recruiter Fast-Scan</option>
                <option value="executive_hook">Founder / Executive</option>
                <option value="peer_referral">Peer Engineer Referral</option>
                <option value="post_application">Post-Application Followup</option>
                <option value="gap_growth">Fast Learner / Domain Pivot</option>
                <option value="custom">Custom Angle</option>
              </select>
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as TemplateAudience)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="Hiring Managers">Hiring Managers</option>
                <option value="Recruiters">Recruiters</option>
                <option value="Engineers / Peers">Engineers / Peers</option>
                <option value="Founders / Executives">Founders / Executives</option>
              </select>
            </div>

            {/* Desired Tone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Desired Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as TemplateTone)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="Direct & Punchy">Direct & Punchy</option>
                <option value="Value & Metric Heavy">Value & Metric Heavy</option>
                <option value="Warm & Conversational">Warm & Conversational</option>
                <option value="Executive & Formal">Executive & Formal</option>
                <option value="Technical & Deep">Technical & Deep</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-semibold text-slate-600"
          >
            Cancel
          </Button>

          <Button
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs h-10 px-5 gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Template...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Template</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Save, 
  Sparkles, 
  Wand2, 
  Eye, 
  Code, 
  Plus, 
  Trash2, 
  Sliders, 
  Loader2, 
  Check, 
  ChevronRight,
  Lightbulb,
  Copy,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPalette } from './PlaceholderPalette';
import { TemplateLivePreview } from './TemplateLivePreview';
import { refineEmailTemplate, suggestSubjectLines } from '@/lib/gemini';
import { saveTemplate } from '@/lib/templateStorage';
import { OutreachTemplate, TemplateCategory, TemplateAudience, TemplateTone } from '@/types/template';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: OutreachTemplate | null;
  onSaveSuccess?: (saved: OutreachTemplate) => void;
  onUseTemplate?: (template: OutreachTemplate) => void;
}

export function TemplateEditorModal({
  isOpen,
  onClose,
  initialTemplate,
  onSaveSuccess,
  onUseTemplate
}: TemplateEditorModalProps) {
  const isEditing = Boolean(initialTemplate?.id && !initialTemplate.id.startsWith('draft_'));

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TemplateCategory>('hiring_manager');
  const [targetAudience, setTargetAudience] = useState<TemplateAudience>('Hiring Managers');
  const [tone, setTone] = useState<TemplateTone>('Direct & Punchy');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Active focus element tracker for inserting placeholders
  const [activeTarget, setActiveTarget] = useState<'subject' | 'body'>('body');
  
  // AI Refine & Subject Line states
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refineGoal, setRefineGoal] = useState<string>('Make it punchier, more concise, and boost response rate');
  const [showRefineDrawer, setShowRefineDrawer] = useState<boolean>(false);
  const [isGeneratingSubjects, setIsGeneratingSubjects] = useState<boolean>(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState<{ subject: string; angle: string }[]>([]);
  const [showSubjectDrawer, setShowSubjectDrawer] = useState<boolean>(false);

  const [previewTab, setPreviewTab] = useState<'edit' | 'preview' | 'split'>('split');

  const subjectInputRef = useRef<HTMLInputElement | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (initialTemplate) {
      setTitle(initialTemplate.title || '');
      setDescription(initialTemplate.description || '');
      setCategory(initialTemplate.category || 'hiring_manager');
      setTargetAudience(initialTemplate.targetAudience || 'Hiring Managers');
      setTone(initialTemplate.tone || 'Direct & Punchy');
      setSubject(initialTemplate.subject || '');
      setBody(initialTemplate.body || '');
      setTags(initialTemplate.tags || []);
      setIsFavorite(Boolean(initialTemplate.isFavorite));
    } else {
      // Default blank template state
      setTitle('');
      setDescription('');
      setCategory('hiring_manager');
      setTargetAudience('Hiring Managers');
      setTone('Direct & Punchy');
      setSubject('{{candidate_headline}} for {{company_name}}\'s {{job_title}} role');
      setBody(`Hi {{recruiter_first_name}},

I noticed {{company_name}} is scaling the team for the {{job_title}} position.

With {{years_experience}} years of experience specializing in {{top_matching_skill}} at {{current_company}}, I recently {{key_achievement}}.

I took a look at {{company_product}} and would love to share a few architecture insights regarding {{key_requirement_1}}. You can review my work here: {{portfolio_url}}

{{call_to_action}}

Best regards,
{{candidate_name}}
{{linkedin_url}}`);
      setTags(['Custom', 'High Conversion']);
      setIsFavorite(false);
    }
  }, [initialTemplate, isOpen]);

  if (!isOpen) return null;

  const handleInsertPlaceholder = (syntax: string) => {
    if (activeTarget === 'subject') {
      const input = subjectInputRef.current;
      if (input) {
        const start = input.selectionStart || subject.length;
        const end = input.selectionEnd || subject.length;
        const nextSubject = subject.substring(0, start) + syntax + subject.substring(end);
        setSubject(nextSubject);
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + syntax.length, start + syntax.length);
        }, 50);
      } else {
        setSubject(prev => prev + ' ' + syntax);
      }
    } else {
      const textarea = bodyTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart || body.length;
        const end = textarea.selectionEnd || body.length;
        const nextBody = body.substring(0, start) + syntax + body.substring(end);
        setBody(nextBody);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + syntax.length, start + syntax.length);
        }, 50);
      } else {
        setBody(prev => prev + ' ' + syntax);
      }
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSuggestSubjectLines = async () => {
    setIsGeneratingSubjects(true);
    setShowSubjectDrawer(true);
    try {
      const result = await suggestSubjectLines({
        body,
        currentSubject: subject,
        audience: targetAudience,
        tone
      });
      if (result.suggestions && Array.isArray(result.suggestions)) {
        setSubjectSuggestions(result.suggestions);
        toast.success('Generated high open-rate subject line options!');
      }
    } catch (err: any) {
      console.error('Subject line error:', err);
      toast.error(err.message || 'Failed to suggest subject lines');
    } finally {
      setIsGeneratingSubjects(false);
    }
  };

  const handleRefineBody = async (customGoal?: string) => {
    const goalToUse = customGoal || refineGoal;
    if (!body.trim()) {
      toast.error('Body is empty. Please enter some text to refine.');
      return;
    }
    setIsRefining(true);
    try {
      const result = await refineEmailTemplate({
        subject,
        body,
        refinementGoal: goalToUse,
        targetTone: tone
      });

      if (result.refinedBody) {
        setBody(result.refinedBody);
        if (result.refinedSubject) {
          setSubject(result.refinedSubject);
        }
        toast.success('Refined template with AI!');
        setShowRefineDrawer(false);
      }
    } catch (err: any) {
      console.error('Refine error:', err);
      toast.error(err.message || 'Failed to refine template');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a template title');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject line');
      return;
    }
    if (!body.trim()) {
      toast.error('Please enter email body content');
      return;
    }

    const templateToSave: OutreachTemplate = {
      id: initialTemplate?.id || `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim() || `Outreach email for ${targetAudience}`,
      category,
      targetAudience,
      tone,
      subject: subject.trim(),
      body: body.trim(),
      tags: tags.length > 0 ? tags : ['Custom'],
      isFavorite,
      isDefault: Boolean(initialTemplate?.isDefault),
      useCount: initialTemplate?.useCount || 0,
      lastUsedAt: initialTemplate?.lastUsedAt,
      createdAt: initialTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = saveTemplate(templateToSave);
    toast.success(isEditing ? 'Template updated successfully!' : 'New template saved to your library!');
    if (onSaveSuccess) {
      onSaveSuccess(saved);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center font-bold text-white shadow-md">
              {"{ }"}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                {isEditing ? `Edit: ${initialTemplate?.title}` : 'Create Custom Outreach Template'}
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px]">
                  Handlebars Placeholders
                </Badge>
              </h3>
              <p className="text-xs text-slate-300">
                Design personalized outreach frameworks with dynamic placeholders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle for Desktop */}
            <div className="hidden md:inline-flex p-0.5 bg-slate-800 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewTab('edit')}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                  previewTab === 'edit' ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Editor Only
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('split')}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                  previewTab === 'split' ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                  previewTab === 'preview' ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Live Preview
              </button>
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
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <div className={cn(
            "grid gap-6",
            previewTab === 'split' ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
          )}>
            {/* Left Column: Form & Editor */}
            {(previewTab === 'edit' || previewTab === 'split') && (
              <div className={cn(
                "space-y-5",
                previewTab === 'split' ? "lg:col-span-7" : "max-w-3xl mx-auto w-full"
              )}>
                {/* Meta Inputs Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Title */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Template Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="E.g., The High-Impact Proof-of-Work Hook"
                        className="w-full text-sm font-semibold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-900"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Description / Objective
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="When and how to use this email template..."
                        className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-slate-700"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      >
                        <option value="hiring_manager">Hiring Manager Pitch</option>
                        <option value="recruiter_cold">Recruiter Fast-Scan</option>
                        <option value="executive_hook">Founder / Executive Hook</option>
                        <option value="peer_referral">Peer Engineer Referral</option>
                        <option value="post_application">Post-Application Follow-up</option>
                        <option value="gap_growth">Fast-Learner / Domain Pivot</option>
                        <option value="custom">Custom Strategy</option>
                      </select>
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Target Audience
                      </label>
                      <select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value as TemplateAudience)}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      >
                        <option value="Hiring Managers">Hiring Managers</option>
                        <option value="Recruiters">Recruiters</option>
                        <option value="Engineers / Peers">Engineers / Peers</option>
                        <option value="Founders / Executives">Founders / Executives</option>
                      </select>
                    </div>

                    {/* Tone */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value as TemplateTone)}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      >
                        <option value="Direct & Punchy">Direct & Punchy</option>
                        <option value="Value & Metric Heavy">Value & Metric Heavy</option>
                        <option value="Warm & Conversational">Warm & Conversational</option>
                        <option value="Executive & Formal">Executive & Formal</option>
                        <option value="Technical & Deep">Technical & Deep</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Tags
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add tag (Enter)..."
                          className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={handleAddTag}
                          className="h-8 px-2 text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Tag Chips */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subject Line Editor */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      Subject Line (Placeholders Supported) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={handleSuggestSubjectLines}
                        disabled={isGeneratingSubjects}
                        className="h-7 text-xs font-semibold text-brand-primary border-brand-primary/30 hover:bg-brand-primary/5 gap-1"
                      >
                        {isGeneratingSubjects ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>AI Subject Ideas</span>
                      </Button>
                    </div>
                  </div>

                  <input
                    ref={subjectInputRef}
                    type="text"
                    value={subject}
                    onFocus={() => setActiveTarget('subject')}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E.g., {{candidate_name}} - {{job_title}} at {{company_name}}"
                    className="w-full text-sm font-semibold px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-900 font-mono"
                  />

                  {/* AI Subject Suggestions Drawer */}
                  {showSubjectDrawer && subjectSuggestions.length > 0 && (
                    <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-brand-primary" />
                          High Open-Rate Suggestions:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSubjectDrawer(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Close
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {subjectSuggestions.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSubject(s.subject);
                              toast.success('Subject line applied!');
                            }}
                            className="p-2 bg-white hover:bg-blue-50/80 border border-blue-100 hover:border-brand-primary/40 rounded-lg cursor-pointer transition-all flex items-center justify-between group"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-mono font-bold text-slate-800 group-hover:text-brand-primary transition-colors block truncate">
                                {s.subject}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Angle: {s.angle}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              Use &rarr;
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Body Editor */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      Email Body Content *
                    </label>

                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setShowRefineDrawer(!showRefineDrawer)}
                      className={cn(
                        "h-7 text-xs font-semibold border-slate-200 gap-1",
                        showRefineDrawer ? "bg-purple-50 text-purple-700 border-purple-300" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <Wand2 className="w-3 h-3 text-purple-600" />
                      <span>Refine with AI</span>
                    </Button>
                  </div>

                  {/* Refine with AI Quick Drawer */}
                  {showRefineDrawer && (
                    <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                        <span className="flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                          AI Template Polisher
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowRefineDrawer(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          Hide
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Make punchier and cut length by 30%',
                          'Add stronger metrics and proof of work',
                          'Warm up greeting & peer tone',
                          'Strengthen closing call to action'
                        ].map((presetGoal, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleRefineBody(presetGoal)}
                            disabled={isRefining}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100/80 border border-purple-200 text-purple-800 text-[11px] font-medium transition-colors"
                          >
                            {presetGoal}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={refineGoal}
                          onChange={(e) => setRefineGoal(e.target.value)}
                          placeholder="Custom refinement instructions..."
                          className="flex-1 text-xs px-3 py-1.5 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-slate-800"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRefineBody()}
                          disabled={isRefining || !refineGoal.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-3 font-semibold gap-1 shrink-0"
                        >
                          {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>Refine</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  <textarea
                    ref={bodyTextareaRef}
                    rows={12}
                    value={body}
                    onFocus={() => setActiveTarget('body')}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter email body with {{placeholders}}..."
                    className="w-full text-xs font-mono p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary leading-relaxed transition-all text-slate-900"
                  />
                </div>

                {/* Interactive Placeholder Inserter Palette */}
                <PlaceholderPalette
                  onInsertPlaceholder={handleInsertPlaceholder}
                  activeTargetName={activeTarget === 'subject' ? 'Subject Line' : 'Email Body'}
                />
              </div>
            )}

            {/* Right Column: Live Dynamic Previewer */}
            {(previewTab === 'preview' || previewTab === 'split') && (
              <div className={cn(
                previewTab === 'split' ? "lg:col-span-5" : "max-w-3xl mx-auto w-full"
              )}>
                <div className="sticky top-4">
                  <TemplateLivePreview
                    subject={subject}
                    body={body}
                    templateTitle={title || 'Custom Template'}
                    onUseTemplate={
                      onUseTemplate 
                        ? () => {
                            onUseTemplate({
                              id: initialTemplate?.id || 'temp',
                              title: title || 'Custom Template',
                              description,
                              category,
                              targetAudience,
                              tone,
                              subject,
                              body,
                              tags,
                              useCount: initialTemplate?.useCount || 0,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString()
                            });
                          }
                        : undefined
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs h-10 px-6 gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Save Template'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

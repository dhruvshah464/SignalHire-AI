import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Star, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  Upload, 
  RefreshCw, 
  SlidersHorizontal, 
  Briefcase, 
  User, 
  Building2, 
  Send, 
  MoreVertical,
  CheckCircle2,
  FileText,
  Tag,
  Wand2,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getSavedTemplates, 
  saveTemplate, 
  deleteTemplate, 
  duplicateTemplate, 
  toggleFavoriteTemplate, 
  incrementTemplateUseCount, 
  resetTemplatesToDefault, 
  exportTemplatesJSON, 
  importTemplatesJSON,
  TEMPLATES_UPDATED_EVENT,
  AVAILABLE_PLACEHOLDERS
} from '@/lib/templateStorage';
import { OutreachTemplate, TemplateCategory, TemplateAudience, TemplateTone } from '@/types/template';
import { TemplateEditorModal } from '@/components/templates/TemplateEditorModal';
import { AiTemplateGeneratorModal } from '@/components/templates/AiTemplateGeneratorModal';
import { TemplateLivePreview } from '@/components/templates/TemplateLivePreview';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<OutreachTemplate[]>(() => getSavedTemplates());
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedTone, setSelectedTone] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'most_used' | 'newest' | 'title'>('most_used');

  // Modals & Drawers state
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<OutreachTemplate | null>(null);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState<boolean>(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<OutreachTemplate | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync templates on storage event
  useEffect(() => {
    const handleUpdate = () => {
      setTemplates(getSavedTemplates());
    };
    window.addEventListener(TEMPLATES_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(TEMPLATES_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filtered and sorted list
  const filteredTemplates = useMemo(() => {
    return templates
      .filter((tmpl) => {
        // Category
        if (selectedCategory !== 'all' && tmpl.category !== selectedCategory) {
          return false;
        }
        // Audience
        if (selectedAudience !== 'all' && tmpl.targetAudience !== selectedAudience) {
          return false;
        }
        // Tone
        if (selectedTone !== 'all' && tmpl.tone !== selectedTone) {
          return false;
        }
        // Favorites
        if (onlyFavorites && !tmpl.isFavorite) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = tmpl.title?.toLowerCase().includes(q);
          const matchDesc = tmpl.description?.toLowerCase().includes(q);
          const matchSubject = tmpl.subject?.toLowerCase().includes(q);
          const matchBody = tmpl.body?.toLowerCase().includes(q);
          const matchTags = tmpl.tags?.some(t => t.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchSubject || matchBody || matchTags;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'most_used') {
          return (b.useCount || 0) - (a.useCount || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return (a.title || '').localeCompare(b.title || '');
      });
  }, [templates, selectedCategory, selectedAudience, selectedTone, onlyFavorites, searchQuery, sortBy]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = templates.length;
    const favorites = templates.filter(t => t.isFavorite).length;
    const totalUses = templates.reduce((acc, t) => acc + (t.useCount || 0), 0);
    const customCount = templates.filter(t => !t.isDefault).length;
    return { total, favorites, totalUses, customCount };
  }, [templates]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'hiring_manager', label: 'Hiring Managers' },
    { id: 'recruiter_cold', label: 'Recruiters' },
    { id: 'executive_hook', label: 'Founders & Execs' },
    { id: 'peer_referral', label: 'Peer Referrals' },
    { id: 'post_application', label: 'Post-Application' },
    { id: 'gap_growth', label: 'Fast-Learner / Pivot' },
    { id: 'custom', label: 'Custom' }
  ];

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (tmpl: OutreachTemplate) => {
    setEditingTemplate(tmpl);
    setIsEditorOpen(true);
  };

  const handleDelete = (tmpl: OutreachTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${tmpl.title}"?`)) {
      deleteTemplate(tmpl.id);
      toast.success('Template deleted');
    }
  };

  const handleDuplicate = (tmpl: OutreachTemplate) => {
    const dup = duplicateTemplate(tmpl.id);
    if (dup) {
      toast.success(`Cloned "${tmpl.title}"`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavoriteTemplate(id);
  };

  const handleCopy = (e: React.MouseEvent, tmpl: OutreachTemplate) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`Subject: ${tmpl.subject}\n\n${tmpl.body}`);
    setCopiedId(tmpl.id);
    toast.success('Copied raw template to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseInCampaign = (tmpl: OutreachTemplate) => {
    incrementTemplateUseCount(tmpl.id);
    navigate('/new', {
      state: {
        prefilledTemplate: tmpl
      }
    });
    toast.success(`Loaded "${tmpl.title}" into New Campaign creator`);
  };

  const handleExport = () => {
    const jsonStr = exportTemplatesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signalhire-email-templates-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported templates library as JSON');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importTemplatesJSON(content);
        if (res.errors) {
          toast.error(res.errors);
        } else {
          toast.success(`Successfully imported ${res.imported} templates!`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset templates to default built-in starter collection? Custom templates will be overwritten.')) {
      resetTemplatesToDefault();
      toast.info('Templates reset to default collection');
    }
  };

  const getCategoryBadgeColor = (cat: TemplateCategory) => {
    switch (cat) {
      case 'hiring_manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'recruiter_cold':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'executive_hook':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'peer_referral':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'post_application':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'gap_growth':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Email Outreach Templates
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-brand-primary border border-blue-200/80 rounded-full text-xs font-semibold">
              {templates.length} Available
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Build, test, and personalize high-converting cold email blueprints using dynamic handlebars placeholders.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAiGeneratorOpen(true)}
            className="bg-white hover:bg-slate-50 border-brand-primary/30 text-brand-primary font-semibold text-xs h-10 px-3.5 gap-1.5 shadow-2xs"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Generate</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenNew}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs h-10 px-4 gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </Button>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              title="Export all templates to JSON"
              className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block ml-1">Export</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Import templates from JSON"
              className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline-block ml-1">Import</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{stats.total}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total Templates</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{stats.favorites}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Starred Favorites</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalUses}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Times Used</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{AVAILABLE_PLACEHOLDERS.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Smart Placeholders</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, subject, role keywords, placeholders, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all font-medium text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Secondary Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audience */}
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-700"
            >
              <option value="all">All Audiences</option>
              <option value="Hiring Managers">Hiring Managers</option>
              <option value="Recruiters">Recruiters</option>
              <option value="Engineers / Peers">Engineers / Peers</option>
              <option value="Founders / Executives">Founders / Executives</option>
            </select>

            {/* Tone */}
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-700"
            >
              <option value="all">All Tones</option>
              <option value="Direct & Punchy">Direct & Punchy</option>
              <option value="Value & Metric Heavy">Value & Metric Heavy</option>
              <option value="Warm & Conversational">Warm & Conversational</option>
              <option value="Executive & Formal">Executive & Formal</option>
              <option value="Technical & Deep">Technical & Deep</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-800"
            >
              <option value="most_used">Most Used</option>
              <option value="newest">Recently Updated</option>
              <option value="title">Title (A-Z)</option>
            </select>

            {/* Favorites filter toggle */}
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
                onlyFavorites
                  ? "bg-amber-50 text-amber-800 border-amber-300 shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              <Star className={cn("w-3.5 h-3.5", onlyFavorites ? "fill-amber-500 text-amber-500" : "text-slate-400")} />
              <span>Favorites</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all",
                  isSelected
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                )}
              >
                <span>{cat.label}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  isSelected ? "bg-white/20 text-white font-bold" : "bg-slate-200/80 text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white border border-slate-200/90 hover:border-brand-primary/40 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group space-y-4 relative"
            >
              {/* Card Top: Badges & Star */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={cn("text-[11px] font-semibold", getCategoryBadgeColor(tmpl.category))}>
                      {tmpl.targetAudience}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tmpl.tone}
                    </span>
                    {tmpl.useCount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
                        {tmpl.useCount} {tmpl.useCount === 1 ? 'send' : 'sends'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, tmpl.id)}
                      title={tmpl.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Star className={cn("w-4 h-4", tmpl.isFavorite ? "fill-amber-400 text-amber-400" : "")} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, tmpl)}
                      title="Copy raw template"
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {copiedId === tmpl.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-primary transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                {/* Subject Line Snippet */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Subject Line:
                  </span>
                  <p className="text-xs font-mono font-semibold text-slate-800 line-clamp-1">
                    {tmpl.subject}
                  </p>
                </div>

                {/* Body Excerpt Preview */}
                <div className="text-xs font-mono text-slate-600 line-clamp-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                  {tmpl.body}
                </div>

                {/* Tags */}
                {tmpl.tags && tmpl.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tmpl.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewingTemplate(tmpl)}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Test Resolver</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(tmpl)}
                    className="h-8 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    title="Edit Template"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(tmpl)}
                    className="h-8 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    title="Duplicate Template"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </Button>

                  {!tmpl.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(tmpl)}
                      className="h-8 px-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleUseInCampaign(tmpl)}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs h-8 px-3 gap-1 shadow-2xs"
                >
                  <span>Use in Campaign</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-base text-slate-800">No Templates Found</h3>
            <p className="text-xs text-slate-500">
              No outreach templates match your current filter criteria or search query.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAudience('all');
                setSelectedTone('all');
                setOnlyFavorites(false);
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>
            <Button
              size="sm"
              onClick={handleOpenNew}
              className="bg-brand-primary text-white text-xs font-bold gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Template</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500"
            >
              Reset to Default Library
            </Button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <TemplateEditorModal
          isOpen={isEditorOpen}
          initialTemplate={editingTemplate}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
          }}
          onSaveSuccess={(saved) => {
            setTemplates(getSavedTemplates());
          }}
          onUseTemplate={(tmpl) => {
            setIsEditorOpen(false);
            handleUseInCampaign(tmpl);
          }}
        />
      )}

      {/* AI Generator Modal */}
      {isAiGeneratorOpen && (
        <AiTemplateGeneratorModal
          isOpen={isAiGeneratorOpen}
          onClose={() => setIsAiGeneratorOpen(false)}
          onTemplateGenerated={(gen) => {
            setEditingTemplate({
              id: `draft_${Date.now()}`,
              title: gen.title || 'AI Generated Template',
              description: gen.description || '',
              category: gen.category || 'hiring_manager',
              targetAudience: gen.targetAudience || 'Hiring Managers',
              tone: gen.tone || 'Direct & Punchy',
              subject: gen.subject || '',
              body: gen.body || '',
              tags: gen.tags || ['AI Generated'],
              useCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            setIsEditorOpen(true);
          }}
        />
      )}

      {/* Quick Test / Live Preview Modal */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  Testing Resolver: {previewingTemplate.title}
                </h3>
                <p className="text-xs text-slate-300">
                  Targeting {previewingTemplate.targetAudience} ({previewingTemplate.tone})
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewingTemplate(null)}
                className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50">
              <TemplateLivePreview
                subject={previewingTemplate.subject}
                body={previewingTemplate.body}
                templateTitle={previewingTemplate.title}
                onUseTemplate={() => {
                  const tmpl = previewingTemplate;
                  setPreviewingTemplate(null);
                  handleUseInCampaign(tmpl);
                }}
              />
            </div>

            <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const tmpl = previewingTemplate;
                  setPreviewingTemplate(null);
                  handleEdit(tmpl);
                }}
                className="text-xs font-semibold gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open in Full Editor</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setPreviewingTemplate(null)}
                className="text-xs font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

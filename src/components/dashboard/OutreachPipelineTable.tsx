import React, { useState, useMemo } from 'react';
import { PipelineItem, PipelineStatus } from '@/types/pipeline';
import { JobAnalysisResult } from '@/types/jobAnalysis';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Send, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  FileText, 
  BrainCircuit, 
  Download, 
  Trophy, 
  X, 
  Layers, 
  Check, 
  UserCheck, 
  Zap, 
  Globe, 
  ArrowRight,
  TrendingUp,
  Bookmark,
  LayoutGrid,
  LayoutList,
  Columns
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  updatePipelineStatus, 
  updatePipelineNotes, 
  deletePipelineItem, 
  savePipelineItem, 
  calculatePipelineStats 
} from '@/lib/pipelineStorage';
import { getSavedJobAnalyses } from '@/lib/jobAnalysisStorage';
import { OutreachKanbanBoard } from './OutreachKanbanBoard';

interface OutreachPipelineTableProps {
  items: PipelineItem[];
  onItemsChange: (items: PipelineItem[]) => void;
  onSelectJobForAnalysis?: (analysisId: string) => void;
  onOpenAnalysis?: (item: PipelineItem) => void;
}

const STATUS_CONFIG: Record<PipelineStatus, {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  icon: any;
}> = {
  bookmarked: {
    label: 'Bookmarked',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: Bookmark
  },
  outreach_sent: {
    label: 'Outreach Sent',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: Send
  },
  applied: {
    label: 'Applied',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock
  },
  screening: {
    label: 'Phone Screen',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: UserCheck
  },
  interviewing: {
    label: 'Interviewing',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    icon: BrainCircuit
  },
  technical: {
    label: 'Technical Loop',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
    icon: Zap
  },
  offer: {
    label: 'Offer Received',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: Trophy
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: AlertCircle
  },
  archived: {
    label: 'Archived',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock
  }
};

export function OutreachPipelineTable({
  items,
  onItemsChange,
  onSelectJobForAnalysis,
  onOpenAnalysis
}: OutreachPipelineTableProps) {
  const navigate = useNavigate();

  // View Mode: Kanban Board vs Table
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

  // Filter & Search State
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'applied' | 'interviewing' | 'outreach_sent' | 'offer' | 'rejected' | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [workplaceFilter, setWorkplaceFilter] = useState<'all' | 'Remote' | 'Hybrid' | 'On-site'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'score_desc' | 'company_asc' | 'status'>('date_desc');

  // Modal States
  const [editingNoteItem, setEditingNoteItem] = useState<PipelineItem | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [interviewDateInput, setInterviewDateInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Application Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newWorkplace, setNewWorkplace] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [newSalary, setNewSalary] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newStatus, setNewStatus] = useState<PipelineStatus>('applied');
  const [newNotes, setNewNotes] = useState('');

  // Quick Add for specific status from Kanban column
  const handleQuickAddForStatus = (status: PipelineStatus) => {
    setNewStatus(status);
    setShowAddModal(true);
  };

  // Status changer dropdown active item
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);

  // Cached radar jobs to import
  const cachedRadarJobs = useMemo(() => getSavedJobAnalyses(), [showAddModal]);

  // Statistics calculation
  const stats = useMemo(() => calculatePipelineStats(items), [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Status Tab filter
      if (activeStatusTab === 'applied') {
        if (item.status !== 'applied') return false;
      } else if (activeStatusTab === 'interviewing') {
        if (item.status !== 'interviewing' && item.status !== 'screening' && item.status !== 'technical') return false;
      } else if (activeStatusTab === 'outreach_sent') {
        if (item.status !== 'outreach_sent') return false;
      } else if (activeStatusTab === 'offer') {
        if (item.status !== 'offer') return false;
      } else if (activeStatusTab === 'rejected') {
        if (item.status !== 'rejected' && item.status !== 'archived') return false;
      } else if (activeStatusTab === 'bookmarked') {
        if (item.status !== 'bookmarked') return false;
      }

      // Workplace filter
      if (workplaceFilter !== 'all' && item.workplaceType !== workplaceFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.jobTitle.toLowerCase().includes(query);
        const matchesCompany = item.company.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesSkills = item.mustHaveSkills?.some(s => s.toLowerCase().includes(query));
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const matchesRecruiter = item.recruiterName?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesSkills && !matchesNotes && !matchesRecruiter) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.lastActivityAt || b.scrapedAt).getTime() - new Date(a.lastActivityAt || a.scrapedAt).getTime();
      }
      if (sortBy === 'score_desc') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortBy === 'company_asc') {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });
  }, [items, activeStatusTab, workplaceFilter, searchQuery, sortBy]);

  // Handlers for Status Change
  const handleStatusChange = (id: string, newStatusVal: PipelineStatus) => {
    const updated = updatePipelineStatus(id, newStatusVal);
    onItemsChange(updated);
    setStatusDropdownId(null);
    const label = STATUS_CONFIG[newStatusVal]?.label || newStatusVal;
    toast.success(`Updated application status to "${label}"`);
  };

  // Handler for Deleting Item
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePipelineItem(id);
    onItemsChange(updated);
    toast.info('Application removed from pipeline');
  };

  // Handler for Opening Notes Modal
  const handleOpenNotes = (item: PipelineItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteItem(item);
    setNoteInput(item.notes || '');
    setInterviewDateInput(item.interviewDate ? item.interviewDate.split('T')[0] : '');
  };

  // Handler for Saving Notes
  const handleSaveNotes = () => {
    if (!editingNoteItem) return;
    const updated = updatePipelineStatus(editingNoteItem.id, editingNoteItem.status, {
      notes: noteInput,
      interviewDate: interviewDateInput ? new Date(interviewDateInput).toISOString() : undefined
    });
    onItemsChange(updated);
    setEditingNoteItem(null);
    toast.success('Notes & timeline updated successfully');
  };

  // Handler for 1-Click Outreach
  const handleLaunchOutreach = (item: PipelineItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/new', {
      state: {
        prefilledJob: {
          title: item.jobTitle,
          company: item.company,
          description: item.notes || `Role at ${item.company}`,
          url: item.jobUrl || '',
          recruiter_name: item.recruiterName || '',
          recruiter_url: item.recruiterUrl || '',
          matchScore: item.matchScore || 85
        }
      }
    });
  };

  // Handler for Custom Job Add
  const handleAddNewApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) {
      toast.error('Please enter both Role Title and Company Name');
      return;
    }

    const newItem: PipelineItem = {
      id: `pipe-${Date.now()}`,
      jobTitle: newTitle.trim(),
      company: newCompany.trim(),
      location: newLocation.trim() || 'Remote',
      workplaceType: newWorkplace,
      salaryEstimate: newSalary.trim() || 'Competitive',
      status: newStatus,
      jobUrl: newUrl.trim() || undefined,
      scrapedAt: new Date().toISOString(),
      appliedAt: (newStatus === 'applied' || newStatus === 'interviewing' || newStatus === 'screening') ? new Date().toISOString() : null,
      lastActivityAt: new Date().toISOString(),
      notes: newNotes.trim() || 'Added manually to Outreach Pipeline.'
    };

    const updated = savePipelineItem(newItem);
    onItemsChange(updated);
    setShowAddModal(false);

    // Reset Form
    setNewTitle('');
    setNewCompany('');
    setNewSalary('');
    setNewUrl('');
    setNewNotes('');
    toast.success(`Tracked ${newItem.jobTitle} at ${newItem.company}!`);
  };

  // Handler for Importing Radar Job
  const handleImportRadarJob = (radarJob: JobAnalysisResult) => {
    const newItem: PipelineItem = {
      id: `pipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      jobTitle: radarJob.job.title,
      company: radarJob.job.company,
      location: radarJob.job.location || 'Remote',
      workplaceType: radarJob.job.workplaceType || 'Remote',
      seniority: radarJob.job.seniority || 'Mid-Level',
      salaryEstimate: radarJob.job.salaryEstimate || 'Competitive',
      status: 'applied',
      matchScore: radarJob.candidateMatch?.matchScore,
      matchTier: radarJob.candidateMatch?.matchTier,
      mustHaveSkills: radarJob.skillsAnalysis.mustHaveSkills.map(s => s.name),
      missingSkills: radarJob.candidateMatch?.missingSkills.map(s => s.name),
      jobUrl: radarJob.job.url,
      recruiterName: radarJob.job.recruiter?.name,
      recruiterUrl: radarJob.job.recruiter?.linkedinUrl,
      scrapedAt: radarJob.analyzedAt || new Date().toISOString(),
      appliedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      notes: `Imported from Scraped Radar. ${radarJob.skillsAnalysis.mustHaveSkills.length} core skills analyzed.`,
      rawJobAnalysisId: radarJob.id
    };

    const updated = savePipelineItem(newItem);
    onItemsChange(updated);
    setShowAddModal(false);
    toast.success(`Added ${newItem.jobTitle} at ${newItem.company} to Pipeline!`);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (items.length === 0) {
      toast.error('No pipeline data to export.');
      return;
    }
    const headers = ['Company', 'Job Title', 'Status', 'Match Score', 'Workplace', 'Location', 'Salary', 'Recruiter', 'Applied Date', 'Notes'];
    const rows = items.map(item => [
      `"${item.company.replace(/"/g, '""')}"`,
      `"${item.jobTitle.replace(/"/g, '""')}"`,
      `"${STATUS_CONFIG[item.status]?.label || item.status}"`,
      `"${item.matchScore ? item.matchScore + '%' : 'N/A'}"`,
      `"${item.workplaceType}"`,
      `"${item.location.replace(/"/g, '""')}"`,
      `"${(item.salaryEstimate || '').replace(/"/g, '""')}"`,
      `"${(item.recruiterName || '').replace(/"/g, '""')}"`,
      `"${item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'N/A'}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outreach-pipeline-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Outreach Pipeline exported to CSV!');
  };

  return (
    <div className="space-y-6">
      {/* 1. Pipeline Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Active */}
        <div className="bg-white p-3.5 rounded-2xl border border-brand-border/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Pipeline</span>
            <Layers className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {stats.activeOpportunities}
          </div>
          <p className="text-[10px] text-slate-500 font-medium truncate">
            {stats.total} total tracked
          </p>
        </div>

        {/* Applied */}
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Applied</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-amber-700 tracking-tight">
            {stats.applied}
          </div>
          <p className="text-[10px] text-amber-600/80 font-medium truncate">
            Awaiting response
          </p>
        </div>

        {/* Interviewing */}
        <div className="bg-white p-3.5 rounded-2xl border border-purple-200/80 bg-gradient-to-b from-white to-purple-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Interviewing</span>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          </div>
          <div className="text-xl font-black text-purple-700 tracking-tight">
            {stats.interviewing}
          </div>
          <p className="text-[10px] text-purple-600/80 font-medium truncate">
            Active interview loops
          </p>
        </div>

        {/* Outreach Sent */}
        <div className="bg-white p-3.5 rounded-2xl border border-blue-200/80 bg-gradient-to-b from-white to-blue-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Outreach Sent</span>
            <Send className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-blue-700 tracking-tight">
            {stats.outreachSent}
          </div>
          <p className="text-[10px] text-blue-600/80 font-medium truncate">
            Pitches delivered
          </p>
        </div>

        {/* Offers */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Offers Received</span>
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 tracking-tight">
            {stats.offers}
          </div>
          <p className="text-[10px] text-emerald-700 font-bold truncate">
            {stats.offers > 0 ? 'Offer In Hand 🎉' : 'Zero offer yet'}
          </p>
        </div>

        {/* Conversion / Match */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pass Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {stats.interviewConversionRate}%
          </div>
          <p className="text-[10px] text-slate-500 font-medium truncate">
            {stats.avgMatchScore}% avg AI match
          </p>
        </div>

      </div>

      {/* 2. Main Pipeline Card */}
      <Card className="border-brand-border bg-white shadow-sm overflow-hidden rounded-2xl">
        
        {/* Card Header & Global Actions */}
        <CardHeader className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-brand-primary flex items-center justify-center shadow-2xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                Outreach & Application Pipeline
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live status tracking for scraped jobs, cold outreach pitches, and active interview rounds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Kanban Board vs Table */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200/80 shadow-2xs">
              <button
                id="btn-view-board"
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'board'
                    ? 'bg-white text-brand-primary shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                id="btn-view-table"
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-brand-primary shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs h-8 px-3 gap-1.5 font-medium border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-8 px-3.5 gap-1.5 font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Application</span>
            </Button>
          </div>
        </CardHeader>

        {/* Filter Tabs Bar */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Jobs', count: stats.total },
            { id: 'applied', label: 'Applied', count: stats.applied },
            { id: 'interviewing', label: 'Interviewing', count: stats.interviewing },
            { id: 'outreach_sent', label: 'Outreach Sent', count: stats.outreachSent },
            { id: 'offer', label: 'Offers', count: stats.offers },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
            { id: 'bookmarked', label: 'Bookmarked', count: stats.bookmarked }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStatusTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                activeStatusTab === tab.id
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeStatusTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Filter & Sort Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by role, company, required skill, or recruiter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-1.5 pl-8 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Workplace & Sorting */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Workplace Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              {(['all', 'Remote', 'Hybrid', 'On-site'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkplaceFilter(mode)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                    workplaceFilter === mode
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode === 'all' ? 'All Loc' : mode}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
              >
                <option value="date_desc">Latest Activity</option>
                <option value="score_desc">Match Score (High → Low)</option>
                <option value="company_asc">Company (A → Z)</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. View Mode Content: Kanban Board vs Table */}
        {viewMode === 'board' ? (
          <div className="p-4 sm:p-5 bg-slate-50/40 animate-in fade-in duration-200">
            <OutreachKanbanBoard
              items={filteredItems}
              onStatusChange={handleStatusChange}
              onOpenNotes={handleOpenNotes}
              onLaunchOutreach={handleLaunchOutreach}
              onDeleteItem={handleDeleteItem}
              onOpenAnalysis={onOpenAnalysis}
              onQuickAddForStatus={handleQuickAddForStatus}
            />
          </div>
        ) : (
          <div className="overflow-x-auto animate-in fade-in duration-200">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  No jobs match this filter criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing search filters or add applications from recently scraped radar jobs.
                </p>
                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveStatusTab('all');
                      setSearchQuery('');
                      setWorkplaceFilter('all');
                    }}
                    className="text-xs h-8"
                  >
                    Reset All Filters
                  </Button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[240px]">Company & Role</th>
                    <th className="py-3 px-4 min-w-[170px]">AI Match & Skills</th>
                    <th className="py-3 px-4 min-w-[160px]">Application Status</th>
                    <th className="py-3 px-4 min-w-[140px]">Timeline & Key Dates</th>
                    <th className="py-3 px-4 min-w-[150px]">Contact & Notes</th>
                    <th className="py-3 px-4 text-right min-w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredItems.map((item) => {
                    const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.applied;
                    const StatusIcon = statusConf.icon;
                    const isDropdownOpen = statusDropdownId === item.id;

                    return (
                      <tr 
                        key={item.id}
                        className="hover:bg-slate-50/80 transition-colors group relative"
                      >
                        {/* 1. Company & Role */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-start gap-3">
                            {/* Company Icon Avatar */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {item.company ? item.company.slice(0, 2).toUpperCase() : 'JB'}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-slate-900 text-xs truncate max-w-[220px]">
                                  {item.jobTitle}
                                </h4>
                                {item.jobUrl && (
                                  <a
                                    href={item.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-brand-primary shrink-0"
                                    title="Open job URL"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>

                              <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 truncate">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{item.company}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 font-normal">{item.location}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-slate-600 bg-slate-50 border-slate-200">
                                  {item.workplaceType}
                                </Badge>
                                {item.salaryEstimate && (
                                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0 rounded border border-emerald-200/60">
                                    {item.salaryEstimate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. AI Match & Skills */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1.5">
                            {item.matchScore !== undefined ? (
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                  item.matchScore >= 80 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                    : item.matchScore >= 65 
                                    ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  <Sparkles className="w-3 h-3" />
                                  <span>{item.matchScore}% Match</span>
                                </span>
                                {item.matchTier && (
                                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                                    {item.matchTier}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Unbenchmarked
                              </span>
                            )}

                            {item.mustHaveSkills && item.mustHaveSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {item.mustHaveSkills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-medium truncate"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {item.mustHaveSkills.length > 3 && (
                                  <span className="text-[9px] text-slate-400 font-mono self-center">
                                    +{item.mustHaveSkills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Application Status (Interactive Selector) */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setStatusDropdownId(isDropdownOpen ? null : item.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all shadow-2xs ${statusConf.bg} ${statusConf.text} ${statusConf.border} hover:opacity-90`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusConf.dot}`} />
                              <span>{statusConf.label}</span>
                              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                              <>
                                <div 
                                  className="fixed inset-0 z-20" 
                                  onClick={() => setStatusDropdownId(null)} 
                                />
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                                  <div className="p-1 space-y-0.5">
                                    {(['bookmarked', 'outreach_sent', 'applied'] as PipelineStatus[]).map((st) => {
                                      const conf = STATUS_CONFIG[st];
                                      const Icon = conf.icon;
                                      return (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => handleStatusChange(item.id, st)}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                            item.status === st ? 'bg-blue-50 text-brand-primary' : 'hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                                            <span>{conf.label}</span>
                                          </div>
                                          {item.status === st && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="p-1 space-y-0.5">
                                    {(['screening', 'interviewing', 'technical'] as PipelineStatus[]).map((st) => {
                                      const conf = STATUS_CONFIG[st];
                                      return (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => handleStatusChange(item.id, st)}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                            item.status === st ? 'bg-purple-50 text-purple-700' : 'hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                                            <span>{conf.label}</span>
                                          </div>
                                          {item.status === st && <Check className="w-3.5 h-3.5 text-purple-700" />}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="p-1 space-y-0.5">
                                    {(['offer', 'rejected'] as PipelineStatus[]).map((st) => {
                                      const conf = STATUS_CONFIG[st];
                                      return (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => handleStatusChange(item.id, st)}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                            item.status === st ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                                            <span>{conf.label}</span>
                                          </div>
                                          {item.status === st && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        {/* 4. Timeline & Key Dates */}
                        <td className="py-3.5 px-4 align-top text-[11px] text-slate-600 space-y-1">
                          {item.appliedAt ? (
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Applied: {new Date(item.appliedAt).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <div className="text-slate-400 italic">
                              Added: {new Date(item.scrapedAt).toLocaleDateString()}
                            </div>
                          )}

                          {item.interviewDate && (
                            <div className="flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              <Calendar className="w-3 h-3" />
                              <span>Loop: {new Date(item.interviewDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </td>

                        {/* 5. Contacts & Notes */}
                        <td className="py-3.5 px-4 align-top space-y-1">
                          {item.recruiterName ? (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                              <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[120px]">{item.recruiterName}</span>
                              {item.recruiterUrl && (
                                <a 
                                  href={item.recruiterUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                  title="LinkedIn Profile"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">No contact logged</span>
                          )}

                          {/* Quick Notes preview & Trigger */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenNotes(item, e)}
                            className="text-[11px] text-left text-slate-500 hover:text-slate-900 flex items-center gap-1 group/note max-w-[160px] truncate"
                            title={item.notes || 'Click to add notes'}
                          >
                            <Edit3 className="w-3 h-3 text-slate-400 group-hover/note:text-brand-primary shrink-0" />
                            <span className="truncate">{item.notes ? item.notes : 'Add notes...'}</span>
                          </button>
                        </td>

                        {/* 6. Actions Suite */}
                        <td className="py-3.5 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* 1-Click Outreach */}
                            <Button
                              size="sm"
                              onClick={(e) => handleLaunchOutreach(item, e)}
                              className="h-7 text-xs px-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold gap-1 shadow-2xs"
                              title="Generate Cold Pitch / Follow-up"
                            >
                              <Send className="w-3 h-3" />
                              <span>Outreach</span>
                            </Button>

                            {/* Skill Radar Link */}
                            {onOpenAnalysis && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onOpenAnalysis(item)}
                                className="h-7 w-7 text-slate-500 hover:text-brand-primary border-slate-200"
                                title="Inspect AI Skills & Fit Breakdown"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {/* Delete Item */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDeleteItem(item.id, e)}
                              className="h-7 w-7 text-slate-400 hover:text-red-600"
                              title="Remove application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredItems.length}</strong> of <strong className="text-slate-800">{items.length}</strong> tracked applications
          </span>
          <span className="text-[11px] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            {viewMode === 'board' 
              ? 'Drag and drop cards between stages, or use arrows on each card to transition applications.'
              : 'Click any status pill in the table to update application stage inline.'}
          </span>
        </div>

      </Card>

      {/* MODAL 1: Edit Notes & Timeline Modal */}
      {editingNoteItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Application Notes & Timeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingNoteItem.jobTitle} • {editingNoteItem.company}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Interview Date Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Scheduled Interview Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={interviewDateInput}
                  onChange={(e) => setInterviewDateInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Notes Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Personal Notes, Interview Feedback & Action Items</span>
                </label>
                <textarea
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Completed technical round with David. Need to follow up regarding system design take-home on Monday..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingNoteItem(null)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-8 font-semibold shadow-xs"
              >
                Save Updates
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Track New Application in Pipeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select from recently scraped radar jobs or add a custom opportunity.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Import from Radar section */}
            {cachedRadarJobs.length > 0 && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                  <span>1-Click Import from AI Radar ({cachedRadarJobs.length} available)</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cachedRadarJobs.map((rj) => {
                    const isAlreadyInPipe = items.some(
                      i => i.company.toLowerCase() === rj.job.company.toLowerCase() && 
                           i.jobTitle.toLowerCase() === rj.job.title.toLowerCase()
                    );

                    return (
                      <div
                        key={rj.id}
                        className="p-2 bg-white rounded-lg border border-slate-200/70 flex items-center justify-between gap-2 hover:border-blue-300 transition-colors"
                      >
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">
                            {rj.job.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            {rj.job.company} • {rj.candidateMatch?.matchScore}% match
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={isAlreadyInPipe}
                          onClick={() => handleImportRadarJob(rj)}
                          className="h-6 text-[10px] px-2.5 bg-blue-50 text-brand-primary hover:bg-brand-primary hover:text-white font-bold shrink-0 border border-blue-200"
                        >
                          {isAlreadyInPipe ? 'Tracked' : 'Import'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleAddNewApplication} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Role / Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Anthropic, Datadog"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="screening">Phone Screen</option>
                    <option value="outreach_sent">Outreach Sent</option>
                    <option value="bookmarked">Bookmarked</option>
                    <option value="offer">Offer Received</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Workplace Type</label>
                  <select
                    value={newWorkplace}
                    onChange={(e) => setNewWorkplace(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Salary / Comp</label>
                  <input
                    type="text"
                    placeholder="e.g. $180k - $220k"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Job URL or Career Page</label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Initial Notes / Context</label>
                <textarea
                  rows={2}
                  placeholder="Referrals, recruiter names, or interview stages..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-8 font-semibold shadow-xs"
                >
                  Save Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

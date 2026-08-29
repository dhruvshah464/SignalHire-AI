import React, { useState } from 'react';
import { PipelineItem, PipelineStatus } from '@/types/pipeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Send, 
  Clock, 
  BrainCircuit, 
  Trophy, 
  AlertCircle, 
  Bookmark, 
  Building2, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Check, 
  Zap, 
  Plus, 
  GripVertical,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface KanbanColumnConfig {
  id: string;
  title: string;
  statuses: PipelineStatus[];
  defaultStatus: PipelineStatus;
  color: {
    headerBg: string;
    headerText: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    accent: string;
    dot: string;
  };
  icon: any;
  description: string;
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'col_bookmarked',
    title: 'Saved / Radar',
    statuses: ['bookmarked'],
    defaultStatus: 'bookmarked',
    color: {
      headerBg: 'bg-slate-100/90',
      headerText: 'text-slate-800',
      badgeBg: 'bg-slate-200/80',
      badgeText: 'text-slate-700',
      border: 'border-slate-200',
      accent: 'bg-slate-400',
      dot: 'bg-slate-400'
    },
    icon: Bookmark,
    description: 'Saved prospects & radar discoveries'
  },
  {
    id: 'col_outreach_sent',
    title: 'Cold Outreach',
    statuses: ['outreach_sent'],
    defaultStatus: 'outreach_sent',
    color: {
      headerBg: 'bg-blue-50/90',
      headerText: 'text-blue-900',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      border: 'border-blue-200',
      accent: 'bg-blue-500',
      dot: 'bg-blue-500'
    },
    icon: Send,
    description: 'Pitch sent, waiting for reply'
  },
  {
    id: 'col_applied',
    title: 'Applied',
    statuses: ['applied'],
    defaultStatus: 'applied',
    color: {
      headerBg: 'bg-amber-50/90',
      headerText: 'text-amber-900',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      border: 'border-amber-200',
      accent: 'bg-amber-500',
      dot: 'bg-amber-500'
    },
    icon: Clock,
    description: 'Submitted, awaiting first screen'
  },
  {
    id: 'col_interviewing',
    title: 'Interviews & Loops',
    statuses: ['screening', 'interviewing', 'technical'],
    defaultStatus: 'interviewing',
    color: {
      headerBg: 'bg-purple-50/90',
      headerText: 'text-purple-900',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      border: 'border-purple-200',
      accent: 'bg-purple-500',
      dot: 'bg-purple-500'
    },
    icon: BrainCircuit,
    description: 'Phone screens, tech tests & onsites'
  },
  {
    id: 'col_offer',
    title: 'Offers Received',
    statuses: ['offer'],
    defaultStatus: 'offer',
    color: {
      headerBg: 'bg-emerald-50/90',
      headerText: 'text-emerald-900',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      border: 'border-emerald-200',
      accent: 'bg-emerald-500',
      dot: 'bg-emerald-500'
    },
    icon: Trophy,
    description: 'Active offers & decision phase'
  },
  {
    id: 'col_rejected',
    title: 'Concluded',
    statuses: ['rejected', 'archived'],
    defaultStatus: 'rejected',
    color: {
      headerBg: 'bg-rose-50/70',
      headerText: 'text-rose-900',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      border: 'border-rose-200',
      accent: 'bg-rose-400',
      dot: 'bg-rose-400'
    },
    icon: AlertCircle,
    description: 'Rejected or archived roles'
  }
];

interface OutreachKanbanBoardProps {
  items: PipelineItem[];
  onStatusChange: (id: string, newStatus: PipelineStatus) => void;
  onOpenNotes: (item: PipelineItem, e: React.MouseEvent) => void;
  onLaunchOutreach: (item: PipelineItem, e: React.MouseEvent) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
  onOpenAnalysis?: (item: PipelineItem) => void;
  onQuickAddForStatus?: (status: PipelineStatus) => void;
}

export function OutreachKanbanBoard({
  items,
  onStatusChange,
  onOpenNotes,
  onLaunchOutreach,
  onDeleteItem,
  onOpenAnalysis,
  onQuickAddForStatus
}: OutreachKanbanBoardProps) {
  const navigate = useNavigate();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeDropColumnId, setActiveDropColumnId] = useState<string | null>(null);
  const [activeCardDropdownId, setActiveCardDropdownId] = useState<string | null>(null);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, item: PipelineItem) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(item.id);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setActiveDropColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumnId !== columnId) {
      setActiveDropColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    // Only clear if leaving the main column container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (activeDropColumnId === columnId) {
      setActiveDropColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, column: KanbanColumnConfig) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId) {
      const targetItem = items.find(i => i.id === itemId);
      if (targetItem && !column.statuses.includes(targetItem.status)) {
        onStatusChange(itemId, column.defaultStatus);
      }
    }
    setDraggedItemId(null);
    setActiveDropColumnId(null);
  };

  // Helper to move item to adjacent stage
  const handleMoveAdjacent = (item: PipelineItem, direction: 'prev' | 'next') => {
    const currentColIndex = KANBAN_COLUMNS.findIndex(col => col.statuses.includes(item.status));
    if (currentColIndex === -1) return;

    const nextIndex = direction === 'next' ? currentColIndex + 1 : currentColIndex - 1;
    if (nextIndex >= 0 && nextIndex < KANBAN_COLUMNS.length) {
      const targetColumn = KANBAN_COLUMNS[nextIndex];
      onStatusChange(item.id, targetColumn.defaultStatus);
    }
  };

  return (
    <div id="outreach-kanban-board-root" className="w-full">
      {/* Kanban Columns Grid - Responsive Horizontal Scrolling */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 px-1 min-h-[580px] scrollbar-thin">
        {KANBAN_COLUMNS.map((column, colIndex) => {
          const ColumnIcon = column.icon;
          const columnItems = items.filter(item => column.statuses.includes(item.status));
          const isDropTarget = activeDropColumnId === column.id;

          // Calculate column metrics
          const avgScore = columnItems.length > 0 && columnItems.some(i => i.matchScore)
            ? Math.round(
                columnItems.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) /
                columnItems.filter(i => i.matchScore).length
              )
            : null;

          return (
            <div
              key={column.id}
              id={`kanban-col-${column.id}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={(e) => handleDragLeave(e, column.id)}
              onDrop={(e) => handleDrop(e, column)}
              className={`flex-1 min-w-[290px] max-w-[340px] flex flex-col rounded-2xl border transition-all duration-200 ${
                isDropTarget
                  ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-blue-50/30 shadow-md scale-[1.008]'
                  : `${column.color.border} bg-slate-50/50 shadow-2xs`
              }`}
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b ${column.color.border} ${column.color.headerBg} rounded-t-2xl flex items-center justify-between`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-6 h-6 rounded-lg ${column.color.badgeBg} ${column.color.headerText} flex items-center justify-center shrink-0`}>
                    <ColumnIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-xs font-bold ${column.color.headerText} truncate tracking-tight`}>
                      {column.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {avgScore !== null && (
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline" title="Average AI Fit">
                      ~{avgScore}% fit
                    </span>
                  )}
                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${column.color.badgeBg} ${column.color.badgeText}`}>
                    {columnItems.length}
                  </span>
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[680px]">
                {columnItems.length === 0 ? (
                  /* Empty State Zone */
                  <div className={`h-36 rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center transition-colors ${
                    isDropTarget 
                      ? 'border-brand-primary bg-blue-50/50 text-brand-primary' 
                      : 'border-slate-200/80 bg-white/40 text-slate-400'
                  }`}>
                    <ColumnIcon className="w-5 h-5 mb-1.5 opacity-60" />
                    <p className="text-xs font-semibold">No applications here</p>
                    <p className="text-[10px] text-slate-400 max-w-[180px] mt-0.5">
                      Drag jobs here or use quick add below
                    </p>
                  </div>
                ) : (
                  /* Active Kanban Cards */
                  columnItems.map((item) => {
                    const isDragging = draggedItemId === item.id;
                    const isMenuOpen = activeCardDropdownId === item.id;

                    return (
                      <div
                        key={item.id}
                        id={`kanban-card-${item.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing group/card relative ${
                          isDragging ? 'opacity-40 scale-95 ring-2 ring-brand-primary' : ''
                        }`}
                      >
                        {/* Card Top: Company Initials Avatar + Role Title + Match Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs group-hover/card:scale-105 transition-transform">
                              {item.company ? item.company.slice(0, 2).toUpperCase() : 'JB'}
                            </div>

                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className="font-bold text-xs text-slate-900 leading-tight truncate">
                                  {item.jobTitle}
                                </h4>
                                {item.jobUrl && (
                                  <a
                                    href={item.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-slate-400 hover:text-brand-primary shrink-0"
                                    title="Open Job URL"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 truncate">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{item.company}</span>
                              </p>
                            </div>
                          </div>

                          {/* AI Match Badge */}
                          {item.matchScore !== undefined && (
                            <Badge className={`text-[10px] font-bold px-1.5 py-0 shrink-0 border ${
                              item.matchScore >= 85 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : item.matchScore >= 70
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              {item.matchScore}%
                            </Badge>
                          )}
                        </div>

                        {/* Workplace & Salary Meta */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            {item.workplaceType}
                          </span>
                          {item.salaryEstimate && (
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded font-semibold truncate max-w-[150px]">
                              {item.salaryEstimate}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 truncate max-w-[110px] ml-auto">
                            {item.location}
                          </span>
                        </div>

                        {/* Interview Loop / Timeline Highlight (if applicable) */}
                        {item.interviewDate && (
                          <div className="mt-2 p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>Loop Date: {new Date(item.interviewDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Must-Have Skills Preview Chips */}
                        {item.mustHaveSkills && item.mustHaveSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.mustHaveSkills.slice(0, 3).map(skill => (
                              <span
                                key={skill}
                                className="text-[9px] font-mono bg-slate-50 text-slate-600 border border-slate-200/80 px-1.5 py-0.2 rounded truncate max-w-[120px]"
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

                        {/* Recruiter / Contacts Snippet */}
                        {item.recruiterName && (
                          <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-1 font-medium truncate">
                            <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">{item.recruiterName}</span>
                            {item.recruiterUrl && (
                              <a
                                href={item.recruiterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:underline shrink-0"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Personal Notes Snippet with Click-to-Edit */}
                        {item.notes && (
                          <div 
                            onClick={(e) => onOpenNotes(item, e)}
                            className="mt-2 p-1.5 bg-slate-50/80 rounded-lg text-[10px] text-slate-600 border border-slate-200/60 line-clamp-2 hover:bg-slate-100/80 transition-colors cursor-pointer"
                            title="Click to view/edit notes"
                          >
                            <span className="font-semibold text-slate-700">Note: </span>
                            {item.notes}
                          </div>
                        )}

                        {/* Card Bottom Actions Toolbar */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          
                          {/* Quick Stage Shifter Arrows */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={colIndex === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveAdjacent(item, 'prev');
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move to previous stage"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={colIndex === KANBAN_COLUMNS.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveAdjacent(item, 'next');
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move to next stage"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Action Triggers */}
                          <div className="flex items-center gap-1">
                            {/* Notes Button */}
                            <button
                              type="button"
                              onClick={(e) => onOpenNotes(item, e)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Edit notes & interview dates"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Skill Analysis Trigger */}
                            {onOpenAnalysis && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAnalysis(item);
                                }}
                                className="p-1 text-slate-400 hover:text-brand-primary hover:bg-blue-50 rounded transition-colors"
                                title="Inspect Skill Radar & Overlap"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* 1-Click Outreach */}
                            <Button
                              size="sm"
                              onClick={(e) => onLaunchOutreach(item, e)}
                              className="h-6 text-[10px] px-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold gap-1 shadow-2xs"
                              title="Generate outreach pitch"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Pitch</span>
                            </Button>

                            {/* Delete Application */}
                            <button
                              type="button"
                              onClick={(e) => onDeleteItem(item.id, e)}
                              className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete application"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}

                {/* Bottom Quick-Add Button for Column */}
                {onQuickAddForStatus && (
                  <button
                    type="button"
                    onClick={() => onQuickAddForStatus(column.defaultStatus)}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:text-brand-primary hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all mt-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to {column.title}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

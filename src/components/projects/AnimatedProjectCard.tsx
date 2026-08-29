import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProjectStatusType,
  STATUS_CONFIGS,
  normalizeStatus,
  StatusHistoryEntry,
} from './statusTypes';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectStatusStepper } from './ProjectStatusStepper';
import { StatusHistoryModal } from './StatusHistoryModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  History,
  CheckCircle2,
  Send,
  MessageSquare,
  ChevronRight,
  Flame,
  Zap,
  BrainCircuit,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

export interface ProjectCardData {
  id: string;
  name: string;
  tagline: string;
  stage?: string;
  status?: string;
  momentum?: number | string;
  cap?: string;
  tags?: string[];
  color?: string;
  chartData?: { time: number; value: number }[];
  updatedAt?: string;
  createdAt?: string;
}

export interface AnimatedProjectCardProps {
  project: ProjectCardData;
  onSelectProject: (id: string) => void;
  onStatusUpdate: (id: string, newStatus: ProjectStatusType, oldStatus: ProjectStatusType) => void;
  historyEntries?: StatusHistoryEntry[];
  onOpenInterviewPrep?: (project: ProjectCardData) => void;
}

export const AnimatedProjectCard: React.FC<AnimatedProjectCardProps> = ({
  project,
  onSelectProject,
  onStatusUpdate,
  historyEntries = [],
  onOpenInterviewPrep,
}) => {
  const currentStatus = normalizeStatus(project.status || project.stage || 'draft');
  const currentConfig = STATUS_CONFIGS[currentStatus] || STATUS_CONFIGS.draft;

  // Track status change transitions
  const [lastTransition, setLastTransition] = useState<{
    from: ProjectStatusType;
    to: ProjectStatusType;
    key: number;
  } | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleStatusChange = (newStatus: ProjectStatusType) => {
    if (newStatus === currentStatus) return;
    const oldStatus = currentStatus;
    setLastTransition({
      from: oldStatus,
      to: newStatus,
      key: Date.now(),
    });
    onStatusUpdate(project.id, newStatus, oldStatus);
  };

  // Auto-dismiss transition notification badge after 4s
  useEffect(() => {
    if (lastTransition) {
      const timer = setTimeout(() => {
        setLastTransition(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastTransition]);

  // Determine next logical status for the one-click "Advance" button
  const getNextStatus = (curr: ProjectStatusType): ProjectStatusType => {
    switch (curr) {
      case 'draft':
        return 'sent';
      case 'sent':
        return 'replied';
      case 'replied':
        return 'interviewing';
      case 'interviewing':
        return 'offer';
      default:
        return 'draft';
    }
  };

  const nextStatus = getNextStatus(currentStatus);
  const nextConfig = STATUS_CONFIGS[nextStatus];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 26,
        }}
        className="group relative bg-[#0f1014] border border-white/10 rounded-3xl p-6 md:p-7 overflow-hidden hover:border-white/25 transition-colors shadow-2xl flex flex-col justify-between"
      >
        {/* Animated Glow Border Halo on Status Transition */}
        <AnimatePresence>
          {lastTransition && (
            <motion.div
              key={`halo-${lastTransition.key}`}
              initial={{ scale: 0.98, opacity: 0.95 }}
              animate={{
                scale: [0.98, 1.02],
                opacity: [0.95, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 rounded-3xl pointer-events-none z-30 border-2"
              style={{
                borderColor: STATUS_CONFIGS[lastTransition.to]?.color || '#3b82f6',
                boxShadow: `0 0 45px ${STATUS_CONFIGS[lastTransition.to]?.glowColor || 'rgba(59,130,246,0.5)'}`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Shimmer Scanline Wave on Status Change */}
        <AnimatePresence>
          {lastTransition && (
            <motion.div
              key={`shimmer-${lastTransition.key}`}
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeInOut' }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none z-30"
            />
          )}
        </AnimatePresence>

        {/* Ambient Top Glow / Stripe */}
        <div
          className={cn(
            'absolute top-0 bottom-0 left-0 w-1.5 opacity-60 group-hover:opacity-100 bg-gradient-to-b transition-opacity duration-500',
            project.color || currentConfig.gradient
          )}
        />

        {/* Card Header */}
        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Project Status Badge with Interactive Dropdown & Animations */}
            <div className="flex items-center gap-2">
              <ProjectStatusBadge
                status={currentStatus}
                onStatusChange={handleStatusChange}
                size="md"
                interactive={true}
              />

              {/* Status History Trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHistoryModal(true);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1 border border-white/5"
                title="View status transition logs"
              >
                <History className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Transition Notification Banner Pill (Framer Motion) */}
            <AnimatePresence>
              {lastTransition && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase shadow-lg border backdrop-blur-xl"
                  style={{
                    backgroundColor: STATUS_CONFIGS[lastTransition.to]?.bgColor,
                    borderColor: STATUS_CONFIGS[lastTransition.to]?.borderColor,
                    color: STATUS_CONFIGS[lastTransition.to]?.color,
                    boxShadow: `0 0 15px ${STATUS_CONFIGS[lastTransition.to]?.glowColor}`,
                  }}
                >
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>
                    Shifted: {STATUS_CONFIGS[lastTransition.from]?.shortLabel} →{' '}
                    {STATUS_CONFIGS[lastTransition.to]?.shortLabel}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Valuation / Stage Indicator */}
            {project.cap && (
              <Badge
                variant="outline"
                className="bg-white/5 border-white/10 text-slate-300 font-mono text-[11px] px-2.5 py-0.5"
              >
                {project.cap}
              </Badge>
            )}
          </div>

          {/* Title & Tagline */}
          <div
            className="cursor-pointer"
            onClick={() => onSelectProject(project.id)}
          >
            <h3 className="text-2xl font-black text-white leading-tight group-hover:text-brand-primary transition-colors flex items-center gap-2">
              {project.name}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-primary" />
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1 line-clamp-2">
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Middle Section: Chart & Stepper */}
        <div className="my-5 space-y-4 relative z-10">
          {/* Interactive Status Stepper Track */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 backdrop-blur-md">
            <ProjectStatusStepper
              status={currentStatus}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Sparkline & Metrics */}
          {project.chartData && project.chartData.length > 0 && (
            <div className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5">
              <div 
                className="w-36 h-10 min-w-[140px] min-h-[40px] opacity-70 group-hover:opacity-100 transition-opacity relative shrink-0"
                style={{ width: '144px', height: '40px', minWidth: '140px', minHeight: '40px' }}
              >
                <ResponsiveContainer width="100%" height="100%" minWidth={140} minHeight={40}>
                  <LineChart data={project.chartData}>
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={currentConfig.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">
                    Momentum
                  </p>
                  <p className="text-lg font-black text-white font-mono flex items-center justify-end gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    {project.momentum || 88}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 relative z-10">
          <div className="flex items-center gap-2">
            {/* Quick "Advance Status" Button with framer-motion micro-interaction */}
            {currentStatus !== 'offer' && currentStatus !== 'closed' ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, x: 2 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(nextStatus);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-mono font-bold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Zap
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: nextConfig.color }}
                />
                <span>
                  Advance: <span style={{ color: nextConfig.color }}>{nextConfig.shortLabel}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </motion.button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Full Scale Achieved</span>
              </div>
            )}

            {/* AI Interview Prep Trigger Button when status is Interviewing */}
            {currentStatus === 'interviewing' && onOpenInterviewPrep && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenInterviewPrep(project);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(147,51,234,0.25)] animate-pulse"
                title="Open AI Interview Prep Dossier"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Prep Dossier</span>
              </motion.button>
            )}
          </div>

          {/* Enter War Room / Detail Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelectProject(project.id)}
            className="text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl px-3"
          >
            Launch War Room
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 -rotate-45 group-hover:rotate-0 transition-transform" />
          </Button>
        </div>
      </motion.div>

      {/* Status History Modal */}
      <StatusHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        projectName={project.name}
        entries={historyEntries.filter((h) => h.projectId === project.id)}
      />
    </>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import {
  ProjectStatusType,
  STATUS_CONFIGS,
  PIPELINE_STAGES,
  normalizeStatus,
} from './statusTypes';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectStatusStepperProps {
  status: string;
  onStatusChange?: (newStatus: ProjectStatusType) => void;
  compact?: boolean;
  className?: string;
}

export const ProjectStatusStepper: React.FC<ProjectStatusStepperProps> = ({
  status: rawStatus,
  onStatusChange,
  compact = false,
  className,
}) => {
  const currentStatus = normalizeStatus(rawStatus);
  const currentIndex = PIPELINE_STAGES.indexOf(currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const progressPercent =
    PIPELINE_STAGES.length > 1
      ? (activeIndex / (PIPELINE_STAGES.length - 1)) * 100
      : 0;

  const currentConfig = STATUS_CONFIGS[currentStatus] || STATUS_CONFIGS.draft;

  return (
    <div className={cn('w-full space-y-2 select-none', className)}>
      {!compact && (
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-300">
            <Sparkles className="w-3 h-3 text-brand-primary" /> Lifecycle Pipeline
          </span>
          <span className="font-semibold text-slate-400">
            Stage {activeIndex + 1} of {PIPELINE_STAGES.length}:{' '}
            <span
              className="font-bold uppercase tracking-wider"
              style={{ color: currentConfig.color }}
            >
              {currentConfig.shortLabel}
            </span>
          </span>
        </div>
      )}

      <div className="relative flex items-center justify-between py-2">
        {/* Background Track */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-white/10 rounded-full overflow-hidden" />

        {/* Animated Active Progress Fill Bar */}
        <motion.div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-1 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
          style={{
            background: `linear-gradient(90deg, #f59e0b 0%, #3b82f6 30%, #10b981 60%, #8b5cf6 85%, #ec4899 100%)`,
          }}
          initial={false}
          animate={{
            width: `calc(${progressPercent}% * (100% - 24px) / 100)`,
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 24,
          }}
        />

        {/* Step Nodes */}
        {PIPELINE_STAGES.map((stageKey, idx) => {
          const stageConfig = STATUS_CONFIGS[stageKey];
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isFuture = idx > activeIndex;

          return (
            <div
              key={stageKey}
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange && stageKey !== currentStatus) {
                  onStatusChange(stageKey);
                }
              }}
            >
              {/* Pulsing Aura if Current */}
              {isCurrent && (
                <motion.div
                  className="absolute -inset-2 rounded-full opacity-40 pointer-events-none"
                  style={{ backgroundColor: stageConfig.color }}
                  animate={{
                    scale: [1, 1.35],
                    opacity: [0.3, 0.7],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Node Circle */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.92 }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  backgroundColor: isCurrent || isPassed ? '#0f1014' : '#14161f',
                  borderColor: isCurrent
                    ? stageConfig.color
                    : isPassed
                    ? '#3b82f6'
                    : 'rgba(255,255,255,0.15)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                }}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-mono font-bold transition-all shadow-md',
                  isCurrent && 'ring-4 ring-white/10'
                )}
                style={{
                  boxShadow: isCurrent
                    ? `0 0 15px ${stageConfig.glowColor}`
                    : undefined,
                }}
              >
                {isPassed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stageConfig.color }}
                    animate={{ scale: [0.85, 1.15] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold group-hover:text-slate-300">
                    {idx + 1}
                  </span>
                )}
              </motion.button>

              {/* Stage Text Label below node */}
              {!compact && (
                <span
                  className={cn(
                    'text-[10px] font-mono font-bold uppercase tracking-wider mt-1.5 transition-colors whitespace-nowrap',
                    isCurrent
                      ? 'text-white'
                      : isPassed
                      ? 'text-slate-300'
                      : 'text-slate-500 group-hover:text-slate-400'
                  )}
                  style={{
                    color: isCurrent ? stageConfig.color : undefined,
                  }}
                >
                  {stageConfig.shortLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

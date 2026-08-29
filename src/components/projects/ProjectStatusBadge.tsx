import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProjectStatusType,
  STATUS_CONFIGS,
  normalizeStatus,
  PIPELINE_STAGES,
} from './statusTypes';
import {
  Pencil,
  Send,
  MessageSquare,
  Users,
  Rocket,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectStatusBadgeProps {
  status: string;
  onStatusChange?: (newStatus: ProjectStatusType) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showSparkles?: boolean;
  className?: string;
}

const STATUS_ICONS: Record<ProjectStatusType, React.ElementType> = {
  draft: Pencil,
  sent: Send,
  replied: MessageSquare,
  interviewing: Users,
  offer: Rocket,
  scaling: Zap,
  closed: CheckCircle2,
};

// Generates 8 particle burst items radiating in a circle
const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * 45 * Math.PI) / 180;
  const distance = 28 + (i % 2) * 10;
  return {
    id: i,
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
  };
});

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  status: rawStatus,
  onStatusChange,
  size = 'md',
  interactive = true,
  showSparkles = true,
  className,
}) => {
  const currentStatus = normalizeStatus(rawStatus);
  const config = STATUS_CONFIGS[currentStatus] || STATUS_CONFIGS.draft;
  const IconComponent = STATUS_ICONS[currentStatus] || Pencil;

  const [isOpen, setIsOpen] = useState(false);
  const [burstKey, setBurstKey] = useState<number>(0);

  const handleSelectStatus = (newStatus: ProjectStatusType, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (newStatus !== currentStatus && onStatusChange) {
      setBurstKey((prev) => prev + 1);
      onStatusChange(newStatus);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactive && onStatusChange) {
      setIsOpen(!isOpen);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-3.5 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Particle Burst on Status Transition */}
      {showSparkles && burstKey > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          {PARTICLES.map((p) => (
            <motion.span
              key={`burst-${burstKey}-${p.id}`}
              initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
              animate={{
                x: p.dx,
                y: p.dy,
                scale: [0.2, 0],
                opacity: [1, 0],
              }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute w-1.5 h-1.5 rounded-full shadow-sm"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 0 10px ${config.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Animated Status Pill */}
      <AnimatePresence mode="wait">
        <motion.button
          key={currentStatus}
          type="button"
          onClick={toggleDropdown}
          disabled={!interactive || !onStatusChange}
          layout
          initial={{ opacity: 0, scale: 0.84, y: 4, filter: 'blur(3px)' }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
          }}
          exit={{ opacity: 0, scale: 0.84, y: -4, filter: 'blur(3px)' }}
          whileHover={
            interactive && onStatusChange
              ? { scale: 1.05, filter: 'brightness(1.15)' }
              : undefined
          }
          whileTap={
            interactive && onStatusChange ? { scale: 0.96 } : undefined
          }
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 24,
          }}
          className={cn(
            'relative font-mono font-bold uppercase tracking-wider rounded-xl border backdrop-blur-xl flex items-center transition-colors select-none shadow-lg',
            config.bgColor,
            config.borderColor,
            config.textColor,
            sizeClasses[size],
            interactive && onStatusChange ? 'cursor-pointer hover:border-white/40' : 'cursor-default',
            className
          )}
        >
          {/* Ambient Inner Gradient Glow */}
          <div
            className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${config.color} 0%, transparent 80%)`,
            }}
          />

          {/* Animated Beacon Dot */}
          <span className="relative flex h-2 w-2">
            <motion.span
              animate={{
                scale: [1, 2],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: config.color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2 shadow-sm"
              style={{ backgroundColor: config.color }}
            />
          </span>

          {/* Icon with subtle spring rotation */}
          <motion.div
            initial={{ rotate: -25, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          >
            <IconComponent className={cn(iconSizes[size], 'shrink-0')} />
          </motion.div>

          {/* Status Label Text */}
          <span className="whitespace-nowrap tracking-wider font-extrabold">
            {config.label}
          </span>

          {/* Interactive Dropdown Chevron */}
          {interactive && onStatusChange && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className={cn(iconSizes[size], 'opacity-70 ml-0.5')} />
            </motion.div>
          )}
        </motion.button>
      </AnimatePresence>

      {/* Floating Status Switcher Menu with Framer-Motion */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Dismiss */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.92, y: 6, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="absolute top-full left-0 mt-2 z-50 min-w-[220px] bg-[#0c0e14]/95 border border-white/20 rounded-2xl p-2 shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-brand-primary" /> Shift Status
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  Instant Synced
                </span>
              </div>

              <div className="space-y-1">
                {PIPELINE_STAGES.map((stageKey) => {
                  const stageConfig = STATUS_CONFIGS[stageKey];
                  const StageIcon = STATUS_ICONS[stageKey] || Pencil;
                  const isSelected = stageKey === currentStatus;

                  return (
                    <motion.button
                      key={stageKey}
                      type="button"
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handleSelectStatus(stageKey, e)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-colors text-left group',
                        isSelected
                          ? 'bg-white/10 text-white font-bold border border-white/20 shadow-sm'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: stageConfig.bgColor,
                            borderColor: stageConfig.borderColor,
                            color: stageConfig.color,
                          }}
                        >
                          <StageIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white tracking-wide">
                            {stageConfig.label}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans line-clamp-1">
                            {stageConfig.description}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div
                          layoutId="selectedCheck"
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stageConfig.color }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

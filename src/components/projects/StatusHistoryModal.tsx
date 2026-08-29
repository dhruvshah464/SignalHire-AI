import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusHistoryEntry, STATUS_CONFIGS } from './statusTypes';
import { History, X, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  entries: StatusHistoryEntry[];
}

export const StatusHistoryModal: React.FC<StatusHistoryModalProps> = ({
  isOpen,
  onClose,
  projectName,
  entries,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with motion fade and blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="relative z-10 w-full max-w-lg bg-[#0f1014] border border-white/20 rounded-3xl p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Status Transition History
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Project: <span className="text-white font-bold">{projectName}</span>
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 rounded-full p-0 text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {entries.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
                  <p className="text-sm text-slate-400 font-mono">
                    No status transitions logged yet for this project.
                  </p>
                  <p className="text-xs text-slate-500">
                    Switch statuses on the card to generate live animated state logs.
                  </p>
                </div>
              ) : (
                entries.map((entry, idx) => {
                  const fromCfg = STATUS_CONFIGS[entry.fromStatus] || STATUS_CONFIGS.draft;
                  const toCfg = STATUS_CONFIGS[entry.toStatus] || STATUS_CONFIGS.sent;

                  return (
                    <motion.div
                      key={entry.id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase"
                            style={{
                              backgroundColor: fromCfg.bgColor,
                              color: fromCfg.color,
                              borderColor: fromCfg.borderColor,
                            }}
                          >
                            {fromCfg.shortLabel}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase"
                            style={{
                              backgroundColor: toCfg.bgColor,
                              color: toCfg.color,
                              borderColor: toCfg.borderColor,
                            }}
                          >
                            {toCfg.shortLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          {entry.note || 'State updated via Ecosystem Control Plane'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 block">
                          {entry.timestamp}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                          Verified
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <Button
                onClick={onClose}
                className="bg-white text-black hover:bg-slate-200 font-bold px-5"
              >
                Close History
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

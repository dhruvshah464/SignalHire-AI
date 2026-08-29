import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterviewTriggerBannerProps {
  isOpen: boolean;
  targetName: string;
  onOpenDossier: () => void;
  onDismiss: () => void;
}

export const InterviewTriggerBanner: React.FC<InterviewTriggerBannerProps> = ({
  isOpen,
  targetName,
  onOpenDossier,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-[#0e0f17] border border-purple-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(147,51,234,0.35)] backdrop-blur-2xl overflow-hidden"
        >
          {/* Glowing animated accent beam */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-pulse" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                    Automated Workflow Triggered
                  </span>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </div>
                <h4 className="text-sm font-black text-white leading-tight">
                  Status Shifted to Interviewing
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  AI Agent has generated custom Technical & Behavioral preparation questions for{' '}
                  <strong className="text-white">{targetName}</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-xs text-slate-400 hover:text-white h-8"
            >
              Later
            </Button>
            <Button
              size="sm"
              onClick={onOpenDossier}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.35)] h-8"
            >
              Open Interview Dossier <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

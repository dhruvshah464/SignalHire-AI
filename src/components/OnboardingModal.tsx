import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Search, 
  FileText, 
  Mail, 
  Rocket 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  onClose: () => void;
}

const steps = [
  {
    title: "Import Your Lead",
    description: "Simply paste a job URL from LinkedIn or Glassdoor. We'll automatically extract the requirements, stack, and recruiter details.",
    icon: Search,
    color: "bg-blue-500",
    illustration: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="w-48 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center px-3 gap-2">
          <div className="flex-1 h-3 bg-slate-200 rounded animate-pulse" />
          <div className="w-12 h-6 bg-blue-500 rounded text-[10px] text-white flex items-center justify-center font-bold">Import</div>
        </div>
      </div>
    )
  },
  {
    title: "AI Analysis",
    description: "Upload your resume once. Our AI calculates your match score for every job and identifies exactly where you stand out.",
    icon: FileText,
    color: "bg-purple-500",
    illustration: (
      <div className="relative w-full h-32 flex items-center justify-center gap-4">
        <div className="w-20 h-28 bg-slate-50 border border-slate-200 rounded shadow-sm p-2 flex flex-col gap-2">
          <div className="h-2 w-full bg-slate-200 rounded" />
          <div className="h-2 w-3/4 bg-slate-200 rounded" />
          <div className="h-2 w-full bg-slate-200 rounded" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sparkles className="text-yellow-500 w-8 h-8 animate-bounce" />
          <span className="text-xs font-black text-slate-800">94% Match</span>
        </div>
      </div>
    )
  },
  {
    title: "Perfect Outreach",
    description: "Get hyper-personalized email drafts, LinkedIn DMs, and follow-ups ready to send. No more writer's block.",
    icon: Mail,
    color: "bg-brand-primary",
    illustration: (
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="w-56 h-32 bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-100" />
            <div className="w-20 h-2 bg-slate-100 rounded" />
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-slate-50 rounded" />
            <div className="w-full h-1.5 bg-slate-50 rounded" />
            <div className="w-2/3 h-1.5 bg-slate-50 rounded" />
          </div>
          <div className="flex justify-end pt-2">
            <div className="px-3 py-1 bg-brand-primary rounded text-[8px] text-white font-bold">Send Campaign</div>
          </div>
        </div>
      </div>
    )
  }
];

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", current.color)}>
                  <current.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step {currentStep + 1} of 3</p>
                  <h2 className="text-2xl font-black text-slate-900">{current.title}</h2>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 flex items-center justify-center min-h-[200px]">
                {current.illustration}
              </div>

              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    i === currentStep ? "w-8 bg-brand-primary" : "w-2 bg-slate-200"
                  )}
                />
              ))}
            </div>

            <Button 
              onClick={next}
              className="h-14 px-8 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-lg font-bold shadow-xl shadow-brand-primary/20 group"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  DollarSign, 
  Briefcase, 
  X, 
  CheckCircle2, 
  Sparkles,
  Sliders,
  Dice5
} from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { toast } from 'sonner';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  const handleRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setFormData(p => ({ ...p, avatarUrl: newAvatar }));
    toast.info('Generated new avatar style.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('Name is required.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Profile Information</h3>
              <p className="text-xs text-slate-500">Update personal identity, contact endpoints, and career targets</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Avatar & Core Identity */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-sm border border-slate-200 shrink-0 overflow-hidden">
              <img 
                src={formData.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen'} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 space-y-1">
              <span className="font-bold text-slate-800 text-xs">Profile Avatar</span>
              <p className="text-[11px] text-slate-500">Dicebear vector avatar generator</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRandomAvatar}
                className="h-7 text-xs gap-1 text-slate-700 mt-1"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>Randomize Avatar</span>
              </Button>
            </div>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Professional Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={formData.headline || ''}
                onChange={e => setFormData(p => ({ ...p, headline: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700">Location & Work Flexibility</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA (Open to Remote)"
                value={formData.location || ''}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Bio Summary */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Professional Bio / Summary</label>
            <textarea
              rows={4}
              value={formData.bio || ''}
              onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="Concise elevator pitch summarizing years of experience, core domains, and key strengths..."
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary leading-relaxed"
            />
          </div>

          {/* Links Grid */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs">Web & Social Profiles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Linkedin className="w-3 h-3 text-blue-600" />
                  <span>LinkedIn URL</span>
                </label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/username"
                  value={formData.links?.linkedin || ''}
                  onChange={e => setFormData(p => ({ ...p, links: { ...p.links, linkedin: e.target.value } }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Github className="w-3 h-3 text-slate-800" />
                  <span>GitHub URL</span>
                </label>
                <input
                  type="text"
                  placeholder="github.com/username"
                  value={formData.links?.github || ''}
                  onChange={e => setFormData(p => ({ ...p, links: { ...p.links, github: e.target.value } }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-600" />
                  <span>Portfolio URL</span>
                </label>
                <input
                  type="text"
                  placeholder="yourportfolio.dev"
                  value={formData.links?.portfolio || ''}
                  onChange={e => setFormData(p => ({ ...p, links: { ...p.links, portfolio: e.target.value } }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Career Targets */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-primary" />
              <span>Career & Compensation Targets</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Target Annual Compensation</label>
                <input
                  type="text"
                  placeholder="e.g. $180,000 - $220,000"
                  value={formData.targetPreferences?.targetSalary || ''}
                  onChange={e => setFormData(p => ({ 
                    ...p, 
                    targetPreferences: { ...p.targetPreferences, targetSalary: e.target.value } 
                  }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Workplace Model</label>
                <select
                  value={formData.targetPreferences?.workPreference || 'remote'}
                  onChange={e => setFormData(p => ({ 
                    ...p, 
                    targetPreferences: { ...p.targetPreferences, workPreference: e.target.value as any } 
                  }))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="remote">Remote-First</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-Site</option>
                  <option value="any">Flexible / Open</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs gap-1.5 h-9 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  getSavedUserProfile, 
  saveUserProfile, 
  DEFAULT_PROFILE, 
  mergeParsedResumeIntoProfile 
} from '@/lib/profile';
import { UserProfile, ResumeParseResult, WorkExperience, EducationItem, SkillCategory } from '@/types/profile';
import { ProfileOverviewHero } from '@/components/profile/ProfileOverviewHero';
import { ResumeParserSection } from '@/components/profile/ResumeParserSection';
import { SkillsManager } from '@/components/profile/SkillsManager';
import { ExperienceManager } from '@/components/profile/ExperienceManager';
import { EducationManager } from '@/components/profile/EducationManager';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  BrainCircuit, 
  Save, 
  CheckCircle2, 
  SlidersHorizontal,
  Compass,
  Briefcase,
  Layers,
  GraduationCap,
  History,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'skills' | 'experience' | 'education'>('all');

  // Load profile on mount
  useEffect(() => {
    const loaded = getSavedUserProfile();
    setProfile(loaded);
  }, []);

  // Handler: When Gemini parses a resume text or document
  const handleResumeParsed = (result: ResumeParseResult, rawText: string) => {
    const updated = mergeParsedResumeIntoProfile(result, profile, rawText);
    setProfile(updated);
    // Auto-save the parsed profile so the user doesn't lose it
    saveUserProfile(updated);
    setHasUnsavedChanges(false);
    toast.success(`Profile updated & saved with ${updated.skills.length} skills and ${updated.experience.length} career milestones!`);
  };

  // Handler: Save profile explicitly
  const handleSaveProfile = () => {
    saveUserProfile(profile);
    setHasUnsavedChanges(false);
    toast.success('Profile data saved successfully! Available across all outreach tools.');
  };

  // Handler: Reset to default
  const handleResetProfile = () => {
    if (window.confirm('Reset profile to default sample data?')) {
      setProfile(DEFAULT_PROFILE);
      saveUserProfile(DEFAULT_PROFILE);
      setHasUnsavedChanges(false);
      toast.info('Profile reset to default.');
    }
  };

  // Sub-handlers for granular updates
  const handleUpdateSkills = (skills: string[], skillCategories?: SkillCategory[]) => {
    const updated: UserProfile = {
      ...profile,
      skills,
      skillCategories: skillCategories || profile.skillCategories,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    setHasUnsavedChanges(true);
    // Persist immediately
    saveUserProfile(updated);
  };

  const handleUpdateExperience = (experience: WorkExperience[]) => {
    const updated: UserProfile = {
      ...profile,
      experience,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    setHasUnsavedChanges(true);
    // Persist immediately
    saveUserProfile(updated);
  };

  const handleUpdateEducation = (education: EducationItem[]) => {
    const updated: UserProfile = {
      ...profile,
      education,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    setHasUnsavedChanges(true);
    // Persist immediately
    saveUserProfile(updated);
  };

  const handleSaveEditModal = (updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
    setHasUnsavedChanges(false);
    toast.success('Personal details and targets updated.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 max-w-5xl mx-auto">
      {/* Top Banner Notice if Unsaved */}
      {hasUnsavedChanges && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs text-blue-900 font-medium">
            <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
            <span>You have unsaved changes in your profile. Click "Save Profile" to synchronize.</span>
          </div>
          <Button
            size="sm"
            onClick={handleSaveProfile}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-7 px-3 gap-1 shadow-2xs font-semibold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Now</span>
          </Button>
        </div>
      )}

      {/* 1. Profile Overview Hero Card */}
      <ProfileOverviewHero
        profile={profile}
        onEditProfile={() => setIsEditModalOpen(true)}
        onSaveProfile={handleSaveProfile}
        onResetProfile={handleResetProfile}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 2. Resume Intelligence & Extraction Engine */}
      <div className="space-y-2">
        <ResumeParserSection
          onParsed={handleResumeParsed}
        />
      </div>

      {/* 3. Navigation Filter Pills */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Sections
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Skills Matrix ({profile.skills.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'experience'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience ({profile.experience.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'education'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education ({profile.education.length})</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
          Last Synced: {new Date(profile.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* 4. Structured Profile Content Modules */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'skills') && (
          <SkillsManager
            skills={profile.skills}
            skillCategories={profile.skillCategories}
            onUpdateSkills={handleUpdateSkills}
          />
        )}

        {(activeTab === 'all' || activeTab === 'experience') && (
          <ExperienceManager
            experience={profile.experience}
            onUpdateExperience={handleUpdateExperience}
          />
        )}

        {(activeTab === 'all' || activeTab === 'education') && (
          <EducationManager
            education={profile.education}
            onUpdateEducation={handleUpdateEducation}
          />
        )}
      </div>

      {/* 5. Edit Profile Details Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveEditModal}
      />
    </div>
  );
}

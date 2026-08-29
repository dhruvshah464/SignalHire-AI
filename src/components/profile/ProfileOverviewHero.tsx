import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  Pencil, 
  Save, 
  Check, 
  Download, 
  Sparkles, 
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { toast } from 'sonner';

interface ProfileOverviewHeroProps {
  profile: UserProfile;
  onEditProfile: () => void;
  onSaveProfile: () => void;
  onResetProfile: () => void;
  hasUnsavedChanges: boolean;
}

export const ProfileOverviewHero: React.FC<ProfileOverviewHeroProps> = ({
  profile,
  onEditProfile,
  onSaveProfile,
  onResetProfile,
  hasUnsavedChanges,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute profile completeness score
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.name?.trim()) score += 15;
    if (profile.headline?.trim()) score += 15;
    if (profile.bio?.trim()) score += 15;
    if (profile.email?.trim()) score += 10;
    if (profile.location?.trim()) score += 10;
    if (profile.skills && profile.skills.length >= 5) score += 15;
    if (profile.experience && profile.experience.length >= 1) score += 15;
    if (profile.education && profile.education.length >= 1) score += 5;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(profile.name || 'candidate').toLowerCase().replace(/\s+/g, '_')}_profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Exported profile to JSON!');
  };

  const handleCopySummary = () => {
    const summaryText = `# ${profile.name}
**${profile.headline}**
Location: ${profile.location} | Email: ${profile.email} | Phone: ${profile.phone}

## Summary
${profile.bio}

## Core Skills (${profile.skills.length})
${profile.skills.join(', ')}

## Work Experience
${profile.experience.map(e => `### ${e.role} at ${e.company} (${e.duration})
${e.highlights?.map(h => `- ${h}`).join('\n') || e.description || ''}`).join('\n\n')}

## Education
${profile.education.map(edu => `- ${edu.degree}, ${edu.school} (${edu.year || ''})`).join('\n')}
`;
    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    toast.success('Markdown summary copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* Top Banner Accent */}
      <div className="h-28 bg-gradient-to-r from-brand-primary/90 via-blue-600 to-indigo-700 relative p-6 flex items-start justify-end">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge className="bg-amber-400 text-amber-950 font-bold border-none shadow-xs text-xs animate-pulse">
              Unsaved Edits
            </Badge>
          )}
          <Button
            size="sm"
            onClick={onSaveProfile}
            className="bg-white text-brand-primary hover:bg-slate-50 font-bold text-xs h-8 gap-1.5 shadow-sm border border-white/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </Button>
        </div>
      </div>

      <CardContent className="p-6 pt-0 relative">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 -mt-12">
          {/* Avatar & Core Bio */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md border border-slate-200">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-brand-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold uppercase overflow-hidden">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{profile.name?.slice(0, 2) || 'SC'}</span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs" title="Profile Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile.name || 'Candidate Profile'}
                </h1>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px] gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {completeness}% Profile Strength
                </Badge>
              </div>

              <p className="text-sm font-semibold text-brand-primary">
                {profile.headline || 'Software Engineer'}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                )}
                {profile.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEditProfile}
              className="text-xs text-slate-700 hover:text-slate-900 border-slate-200 h-8 gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="text-xs text-slate-700 hover:text-slate-900 border-slate-200 h-8 gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Copied' : 'Copy MD'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="text-xs text-slate-700 hover:text-slate-900 border-slate-200 h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onResetProfile}
              className="text-xs text-slate-400 hover:text-red-500 h-8 p-2"
              title="Reset Profile to Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Bio Summary Section */}
        {profile.bio && (
          <div className="mt-6 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-primary" />
              <span>Executive Bio & Value Proposition</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Social / Portfolio Links */}
        {profile.links && (profile.links.linkedin || profile.links.github || profile.links.portfolio) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Web Links:</span>
            {profile.links.linkedin && (
              <a 
                href={profile.links.linkedin.startsWith('http') ? profile.links.linkedin : `https://${profile.links.linkedin}`}
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {profile.links.github && (
              <a 
                href={profile.links.github.startsWith('http') ? profile.links.github : `https://${profile.links.github}`}
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-slate-800" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {profile.links.portfolio && (
              <a 
                href={profile.links.portfolio.startsWith('http') ? profile.links.portfolio : `https://${profile.links.portfolio}`}
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Plus, 
  Pencil, 
  Trash2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  ChevronUp,
  Building2,
  ListPlus
} from 'lucide-react';
import { WorkExperience } from '@/types/profile';
import { toast } from 'sonner';

interface ExperienceManagerProps {
  experience: WorkExperience[];
  onUpdateExperience: (experience: WorkExperience[]) => void;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  experience,
  onUpdateExperience,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State for editing or adding
  const [formData, setFormData] = useState<Partial<WorkExperience>>({
    role: '',
    company: '',
    duration: '',
    location: '',
    description: '',
    highlights: ['']
  });

  const handleStartAdd = () => {
    setFormData({
      role: '',
      company: '',
      duration: '',
      location: '',
      description: '',
      highlights: ['']
    });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleStartEdit = (exp: WorkExperience) => {
    setFormData({
      ...exp,
      highlights: exp.highlights && exp.highlights.length > 0 ? [...exp.highlights] : ['']
    });
    setEditingId(exp.id);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleHighlightChange = (index: number, value: string) => {
    const updated = [...(formData.highlights || [''])];
    updated[index] = value;
    setFormData(prev => ({ ...prev, highlights: updated }));
  };

  const handleAddHighlightField = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), '']
    }));
  };

  const handleRemoveHighlightField = (index: number) => {
    const updated = (formData.highlights || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, highlights: updated.length > 0 ? updated : [''] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role?.trim() || !formData.company?.trim()) {
      toast.error('Role title and company name are required.');
      return;
    }

    const cleanedHighlights = (formData.highlights || [])
      .map(h => h.trim())
      .filter(h => h.length > 0);

    if (isAddingNew) {
      const newExp: WorkExperience = {
        id: `exp-${Date.now()}`,
        role: formData.role.trim(),
        company: formData.company.trim(),
        duration: formData.duration?.trim() || 'Present',
        location: formData.location?.trim() || '',
        description: formData.description?.trim() || '',
        highlights: cleanedHighlights
      };
      onUpdateExperience([newExp, ...experience]);
      toast.success(`Added experience at ${newExp.company}.`);
    } else if (editingId) {
      const updated = experience.map(exp => {
        if (exp.id === editingId) {
          return {
            ...exp,
            role: formData.role!.trim(),
            company: formData.company!.trim(),
            duration: formData.duration?.trim() || exp.duration,
            location: formData.location?.trim() || '',
            description: formData.description?.trim() || '',
            highlights: cleanedHighlights
          };
        }
        return exp;
      });
      onUpdateExperience(updated);
      toast.success('Experience record updated.');
    }

    handleCancel();
  };

  const handleDelete = (id: string, company: string) => {
    const updated = experience.filter(exp => exp.id !== id);
    onUpdateExperience(updated);
    toast.info(`Removed experience at ${company}.`);
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">Career Experience Timeline</CardTitle>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 ml-1">
                {experience.length} Positions
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Structured employment history and quantified achievements extracted from your resume.
            </CardDescription>
          </div>

          {!isAddingNew && !editingId && (
            <Button
              size="sm"
              onClick={handleStartAdd}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Inline Add / Edit Form */}
        {(isAddingNew || editingId) && (
          <form onSubmit={handleSave} className="p-5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-primary" />
                {isAddingNew ? 'Add New Work Experience' : 'Edit Work Experience'}
              </h4>
              <button 
                type="button" 
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Role / Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Systems Architect"
                  value={formData.role || ''}
                  onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Company / Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={formData.company || ''}
                  onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Duration / Dates</label>
                <input
                  type="text"
                  placeholder="e.g. Jan 2022 - Present"
                  value={formData.duration || ''}
                  onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  value={formData.location || ''}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Role Summary</label>
              <input
                type="text"
                placeholder="Brief high-level summary of responsibilities"
                value={formData.description || ''}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Key Achievements & Bullet Points</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddHighlightField}
                  className="text-xs text-brand-primary hover:text-brand-primary h-7 px-2 gap-1"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Add Highlight</span>
                </Button>
              </div>

              <div className="space-y-2">
                {(formData.highlights || ['']).map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder="e.g. Scaled distributed microservices reducing latency by 45%..."
                      value={hl}
                      onChange={e => handleHighlightChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlightField(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Position</span>
              </Button>
            </div>
          </form>
        )}

        {/* Experience List */}
        {experience.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 mb-3">No work experience entries recorded yet.</p>
            <Button size="sm" onClick={handleStartAdd} variant="outline" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Position
            </Button>
          </div>
        ) : (
          <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {experience.map((exp) => (
              <div 
                key={exp.id} 
                className="relative pl-6 group transition-all"
              >
                {/* Timeline node */}
                <div className="absolute left-[-21px] top-1 w-4 h-4 rounded-full bg-white border-2 border-brand-primary shadow-xs group-hover:scale-110 transition-transform"></div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                        {exp.role}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium mt-0.5">
                        <span className="flex items-center gap-1 text-slate-800 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {exp.company}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {exp.duration}
                        </span>
                        {exp.location && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {exp.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(exp)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-brand-primary"
                        title="Edit position"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(exp.id, exp.company)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-red-500"
                        title="Delete position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-slate-600 italic mb-2.5">
                      {exp.description}
                    </p>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 mt-2">
                      {exp.highlights.map((hl, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 mt-1.5 shrink-0"></span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

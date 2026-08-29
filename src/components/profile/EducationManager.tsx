import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Plus, 
  Pencil, 
  Trash2, 
  School, 
  Calendar, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { EducationItem } from '@/types/profile';
import { toast } from 'sonner';

interface EducationManagerProps {
  education: EducationItem[];
  onUpdateEducation: (education: EducationItem[]) => void;
}

export const EducationManager: React.FC<EducationManagerProps> = ({
  education,
  onUpdateEducation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState<Partial<EducationItem>>({
    degree: '',
    school: '',
    year: ''
  });

  const handleStartAdd = () => {
    setFormData({ degree: '', school: '', year: '' });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleStartEdit = (edu: EducationItem) => {
    setFormData({ ...edu });
    setEditingId(edu.id);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.degree?.trim() || !formData.school?.trim()) {
      toast.error('Degree and school name are required.');
      return;
    }

    if (isAddingNew) {
      const newEdu: EducationItem = {
        id: `edu-${Date.now()}`,
        degree: formData.degree.trim(),
        school: formData.school.trim(),
        year: formData.year?.trim() || ''
      };
      onUpdateEducation([...education, newEdu]);
      toast.success(`Added education from ${newEdu.school}.`);
    } else if (editingId) {
      const updated = education.map(edu => {
        if (edu.id === editingId) {
          return {
            ...edu,
            degree: formData.degree!.trim(),
            school: formData.school!.trim(),
            year: formData.year?.trim() || ''
          };
        }
        return edu;
      });
      onUpdateEducation(updated);
      toast.success('Education record updated.');
    }

    handleCancel();
  };

  const handleDelete = (id: string, school: string) => {
    const updated = education.filter(e => e.id !== id);
    onUpdateEducation(updated);
    toast.info(`Removed education from ${school}.`);
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">Education & Credentials</CardTitle>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 ml-1">
                {education.length} Credentials
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Degrees, institutions, and certifications extracted from your resume.
            </CardDescription>
          </div>

          {!isAddingNew && !editingId && (
            <Button
              size="sm"
              onClick={handleStartAdd}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Inline Add / Edit Form */}
        {(isAddingNew || editingId) && (
          <form onSubmit={handleSave} className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                {isAddingNew ? 'Add Education' : 'Edit Education'}
              </h4>
              <button type="button" onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Degree / Qualification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.S. in Computer Science"
                  value={formData.degree || ''}
                  onChange={e => setFormData(p => ({ ...p, degree: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">School / University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University"
                  value={formData.school || ''}
                  onChange={e => setFormData(p => ({ ...p, school: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Graduation Year / Dates</label>
                <input
                  type="text"
                  placeholder="e.g. 2017 - 2021"
                  value={formData.year || ''}
                  onChange={e => setFormData(p => ({ ...p, year: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100">
              <Button type="button" variant="outline" size="sm" onClick={handleCancel} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save</span>
              </Button>
            </div>
          </form>
        )}

        {/* Education List */}
        {education.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 mb-2">No education records found.</p>
            <Button size="sm" onClick={handleStartAdd} variant="outline" className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {education.map((edu) => (
              <div 
                key={edu.id}
                className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                    {edu.degree}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1 text-slate-700">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      {edu.school}
                    </span>
                    {edu.year && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {edu.year}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(edu)}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-brand-primary"
                    title="Edit degree"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(edu.id, edu.school)}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-red-500"
                    title="Delete degree"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

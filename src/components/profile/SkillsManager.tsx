import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Sparkles, 
  Plus, 
  X, 
  Copy, 
  Check, 
  Layers, 
  Search, 
  Code2, 
  Cpu, 
  Cloud, 
  Boxes,
  Flame,
  Tag
} from 'lucide-react';
import { SkillCategory } from '@/types/profile';
import { toast } from 'sonner';

interface SkillsManagerProps {
  skills: string[];
  skillCategories?: SkillCategory[];
  onUpdateSkills: (skills: string[], skillCategories?: SkillCategory[]) => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  skillCategories,
  onUpdateSkills,
}) => {
  const [newSkillInput, setNewSkillInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;

    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already in your skills list.`);
      setNewSkillInput('');
      return;
    }

    const updated = [...skills, trimmed];
    onUpdateSkills(updated, skillCategories);
    setNewSkillInput('');
    toast.success(`Added "${trimmed}" to your skills.`);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove);
    // Also remove from categories if present
    const updatedCats = skillCategories?.map(cat => ({
      ...cat,
      skills: cat.skills.filter(s => s !== skillToRemove)
    }));
    onUpdateSkills(updated, updatedCats);
    toast.info(`Removed "${skillToRemove}".`);
  };

  const handleCopySkills = () => {
    navigator.clipboard.writeText(skills.join(', '));
    setCopied(true);
    toast.success('Skills copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSkills = skills.filter(s => 
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('language') || lower.includes('core')) return <Code2 className="w-4 h-4 text-blue-500" />;
    if (lower.includes('front') || lower.includes('ui') || lower.includes('web')) return <Boxes className="w-4 h-4 text-emerald-500" />;
    if (lower.includes('back') || lower.includes('cloud') || lower.includes('devops')) return <Cloud className="w-4 h-4 text-indigo-500" />;
    if (lower.includes('ai') || lower.includes('ml') || lower.includes('system')) return <Cpu className="w-4 h-4 text-purple-500" />;
    return <Tag className="w-4 h-4 text-slate-500" />;
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">Extracted Skills Matrix</CardTitle>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 ml-1">
                {skills.length} Skills
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              AI-parsed technical proficiencies and competencies extracted from your resume.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySkills}
              className="text-xs text-slate-600 hover:text-slate-900 gap-1.5 h-8"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy All'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Controls: Search and Add */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Docker, GraphQL)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!newSkillInput.trim()}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white shrink-0 gap-1.5 h-9"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </form>
        </div>

        {/* Categorized Skills if available */}
        {skillCategories && skillCategories.length > 0 && !searchQuery && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Categorized Domains</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillCategories.map((cat, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon(cat.category)}
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {cat.category}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 ml-auto">
                      {cat.skills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs group hover:border-slate-300 transition-all"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Skills Stream */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>All Skills ({filteredSkills.length})</span>
            </div>
            {filteredSkills.length !== skills.length && (
              <span className="text-[11px] text-slate-500 lowercase">
                Showing {filteredSkills.length} of {skills.length}
              </span>
            )}
          </div>

          {filteredSkills.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
              No skills found matching "{searchQuery}". Press Enter above to add it.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              {filteredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-200/90 shadow-xs hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    title={`Remove ${skill}`}
                    className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

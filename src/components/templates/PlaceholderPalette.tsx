import React, { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  User, 
  UserCheck, 
  Link2, 
  Search, 
  Copy, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AVAILABLE_PLACEHOLDERS } from '@/lib/templateStorage';
import { TemplatePlaceholder, PlaceholderCategory } from '@/types/template';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PlaceholderPaletteProps {
  onInsertPlaceholder?: (syntax: string) => void;
  className?: string;
  activeTargetName?: string;
  compact?: boolean;
}

export function PlaceholderPalette({
  onInsertPlaceholder,
  className,
  activeTargetName = 'field',
  compact = false
}: PlaceholderPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'All Placeholders', icon: Sparkles },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'job', label: 'Job & Skills', icon: Briefcase },
    { id: 'candidate', label: 'You (Candidate)', icon: User },
    { id: 'recruiter', label: 'Recruiter / Contact', icon: UserCheck },
    { id: 'links', label: 'Links', icon: Link2 }
  ];

  const filteredPlaceholders = AVAILABLE_PLACEHOLDERS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      p.label.toLowerCase().includes(q) || 
      p.key.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleCopyOrInsert = (p: TemplatePlaceholder) => {
    if (onInsertPlaceholder) {
      onInsertPlaceholder(p.syntax);
      toast.success(`Inserted ${p.syntax} into ${activeTargetName}`);
    } else {
      navigator.clipboard.writeText(p.syntax);
      setCopiedKey(p.key);
      toast.success(`Copied ${p.syntax} to clipboard`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getCategoryColor = (cat: PlaceholderCategory) => {
    switch (cat) {
      case 'company':
        return 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200';
      case 'job':
        return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200';
      case 'candidate':
        return 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'recruiter':
        return 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200';
      case 'links':
        return 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={cn("bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">
            {"{ }"}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dynamic Placeholders
            </h4>
            <p className="text-[11px] text-slate-400">
              Click any variable to insert into {activeTargetName}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      {!compact && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs whitespace-nowrap transition-all",
                  isSelected
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                )}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Placeholder Chips Grid */}
      <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
        {filteredPlaceholders.map((placeholder) => {
          const isCopied = copiedKey === placeholder.key;
          return (
            <button
              key={placeholder.key}
              type="button"
              onClick={() => handleCopyOrInsert(placeholder)}
              title={`${placeholder.description}\nSample: "${placeholder.sampleValue}"`}
              className={cn(
                "group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all transform active:scale-95 shadow-2xs",
                getCategoryColor(placeholder.category)
              )}
            >
              <span className="font-bold">{placeholder.syntax}</span>
              {isCopied ? (
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : (
                <span className="text-[10px] opacity-60 font-sans font-normal group-hover:opacity-100 transition-opacity">
                  {placeholder.label}
                </span>
              )}
            </button>
          );
        })}

        {filteredPlaceholders.length === 0 && (
          <div className="w-full py-4 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1">
            <Info className="w-4 h-4 text-slate-300" />
            <span>No placeholders match "{searchQuery}"</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Handlebars syntax supported
        </span>
        <span className="font-medium text-slate-500">
          {filteredPlaceholders.length} variables available
        </span>
      </div>
    </div>
  );
}

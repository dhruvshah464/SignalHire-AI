import React from 'react';
import { JobAnalysisResult } from '@/types/jobAnalysis';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Trash2, ArrowRight, Clock, Building2, MapPin } from 'lucide-react';

interface JobAnalysisHistoryProps {
  history: JobAnalysisResult[];
  onSelect: (item: JobAnalysisResult) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  activeId?: string;
}

export function JobAnalysisHistory({
  history,
  onSelect,
  onDelete,
  activeId
}: JobAnalysisHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="border-brand-border shadow-xs bg-white">
      <CardHeader className="py-3.5 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Recent Job Analyzed ({history.length})
          </CardTitle>
        </div>
        <span className="text-[10px] text-slate-400">Cached in Job Radar</span>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {history.map((item) => {
          const isActive = activeId === item.id;
          const score = item.candidateMatch?.matchScore;

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-50 ${
                isActive ? 'bg-blue-50/70 border-l-4 border-brand-primary' : ''
              }`}
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.job.title}
                  </h4>
                  {score !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      score >= 60 ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {score}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{item.job.company}</span>
                  <span className="text-slate-300">•</span>
                  <span>{new Date(item.analyzedAt).toLocaleDateString()}</span>
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-red-600"
                  onClick={(e) => onDelete(item.id, e)}
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

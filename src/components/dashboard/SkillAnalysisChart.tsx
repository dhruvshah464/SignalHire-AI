import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { JobAnalysisResult, JobMustHaveSkill, JobMissingSkill } from '@/types/jobAnalysis';
import { UserProfile } from '@/types/profile';
import { getSavedUserProfile } from '@/lib/profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Radar as RadarIcon, 
  SlidersHorizontal,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Info
} from 'lucide-react';

interface SkillAnalysisChartProps {
  analysis: JobAnalysisResult;
  userProfile?: UserProfile;
  className?: string;
  onSelectSkill?: (skillName: string, isGap: boolean) => void;
}

type ChartViewMode = 'radar' | 'category-bar' | 'tech-spectrum' | 'distribution';

export function SkillAnalysisChart({
  analysis,
  userProfile: propProfile,
  className = '',
  onSelectSkill
}: SkillAnalysisChartProps) {
  const userProfile = propProfile || getSavedUserProfile();
  const [viewMode, setViewMode] = useState<ChartViewMode>('radar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'matched' | 'gaps'>('all');
  const [activeSkillDetail, setActiveSkillDetail] = useState<{
    name: string;
    category: string;
    isMatched: boolean;
    importance?: string;
    recommendation?: string;
    demandLevel?: number;
    resumeLevel?: number;
  } | null>(null);

  const { job, skillsAnalysis, candidateMatch } = analysis;

  // Process & structure data across all dimensions
  const processedData = useMemo(() => {
    const candidateSkillsLower = new Set(
      (userProfile?.skills || []).map(s => s.toLowerCase().trim())
    );

    // Matched skills from AI + fallback heuristic
    const matchedSkillsSet = new Set(
      (candidateMatch?.matchedSkills || []).map(s => s.toLowerCase().trim())
    );

    // Missing skills map
    const missingSkillsMap = new Map<string, JobMissingSkill>();
    (candidateMatch?.missingSkills || []).forEach(gap => {
      missingSkillsMap.set(gap.name.toLowerCase().trim(), gap);
    });

    // 1. All job requirements
    const allJobSkills: Array<{
      name: string;
      category: string;
      importance: 'Critical' | 'High' | 'Nice-to-Have';
      isMustHave: boolean;
      description?: string;
    }> = [
      ...skillsAnalysis.mustHaveSkills.map(s => ({
        name: s.name,
        category: s.category || 'Core Technologies',
        importance: (s.importance || 'High') as 'Critical' | 'High',
        isMustHave: true,
        description: s.description
      })),
      ...skillsAnalysis.niceToHaveSkills.map(s => ({
        name: s.name,
        category: s.category || 'Bonus / Differentiator',
        importance: 'Nice-to-Have' as const,
        isMustHave: false,
        description: s.description
      }))
    ];

    // Deduplicate job skills
    const uniqueJobSkills = Array.from(
      new Map(allJobSkills.map(item => [item.name.toLowerCase(), item])).values()
    );

    // Categories list
    const categoriesSet = new Set<string>();
    uniqueJobSkills.forEach(s => categoriesSet.add(s.category));
    skillsAnalysis.skillCategories?.forEach(c => categoriesSet.add(c.category));
    const categories = Array.from(categoriesSet);

    // Categorized breakdown
    const categoryStats: Record<string, {
      category: string;
      totalReq: number;
      matchedCount: number;
      gapCount: number;
      criticalGaps: number;
      matchedList: string[];
      gapList: string[];
      jobDemandScore: number;
      resumeScore: number;
    }> = {};

    categories.forEach(cat => {
      categoryStats[cat] = {
        category: cat,
        totalReq: 0,
        matchedCount: 0,
        gapCount: 0,
        criticalGaps: 0,
        matchedList: [],
        gapList: [],
        jobDemandScore: 0,
        resumeScore: 0
      };
    });

    // Individual tech spectrum items
    const techSpectrumList = uniqueJobSkills.map(skill => {
      const sLower = skill.name.toLowerCase().trim();
      const isDirectMatch = matchedSkillsSet.has(sLower) || candidateSkillsLower.has(sLower);
      const gapInfo = missingSkillsMap.get(sLower);
      
      const isCritical = skill.importance === 'Critical' || gapInfo?.priority === 'Critical';
      const isHigh = skill.importance === 'High' || gapInfo?.priority === 'High';
      
      const jobDemand = isCritical ? 100 : isHigh ? 80 : 60;
      const resumeLevel = isDirectMatch ? 100 : gapInfo ? (gapInfo.priority === 'Critical' ? 10 : 25) : 40;

      // Update category stats
      const catKey = skill.category || 'Core Technologies';
      if (!categoryStats[catKey]) {
        categoryStats[catKey] = {
          category: catKey,
          totalReq: 0,
          matchedCount: 0,
          gapCount: 0,
          criticalGaps: 0,
          matchedList: [],
          gapList: [],
          jobDemandScore: 0,
          resumeScore: 0
        };
      }

      categoryStats[catKey].totalReq += 1;
      categoryStats[catKey].jobDemandScore += jobDemand;

      if (isDirectMatch) {
        categoryStats[catKey].matchedCount += 1;
        categoryStats[catKey].matchedList.push(skill.name);
        categoryStats[catKey].resumeScore += 100;
      } else {
        categoryStats[catKey].gapCount += 1;
        categoryStats[catKey].gapList.push(skill.name);
        if (isCritical) categoryStats[catKey].criticalGaps += 1;
        categoryStats[catKey].resumeScore += resumeLevel;
      }

      return {
        name: skill.name,
        category: skill.category,
        importance: skill.importance,
        jobDemand,
        resumeLevel,
        isMatched: isDirectMatch,
        gapPriority: gapInfo?.priority,
        recommendation: gapInfo?.recommendation,
        status: isDirectMatch 
          ? 'Verified Match' 
          : isCritical 
          ? 'Critical Gap' 
          : 'Moderate Gap'
      };
    });

    // Radar Chart Dataset (Categories comparison)
    const radarData = Object.values(categoryStats)
      .filter(c => c.totalReq > 0)
      .map(c => {
        const avgJobDemand = Math.round(c.jobDemandScore / c.totalReq);
        const avgResumeScore = Math.round(c.resumeScore / c.totalReq);
        const matchPercent = Math.round((c.matchedCount / c.totalReq) * 100);

        return {
          category: c.category.length > 18 ? c.category.slice(0, 16) + '…' : c.category,
          fullCategory: c.category,
          JobRequirement: avgJobDemand,
          CandidateResume: avgResumeScore,
          coveragePercent: matchPercent,
          matchedCount: c.matchedCount,
          gapCount: c.gapCount,
          matchedList: c.matchedList,
          gapList: c.gapList
        };
      });

    // Category Bar Chart Dataset
    const categoryBarData = Object.values(categoryStats)
      .filter(c => c.totalReq > 0)
      .map(c => ({
        category: c.category,
        Matched: c.matchedCount,
        Gaps: c.gapCount,
        Total: c.totalReq,
        coverageRate: Math.round((c.matchedCount / c.totalReq) * 100),
        criticalGaps: c.criticalGaps,
        matchedList: c.matchedList,
        gapList: c.gapList
      }))
      .sort((a, b) => b.Total - a.Total);

    // Distribution Data for Pie / Radial Chart
    const totalMatched = techSpectrumList.filter(t => t.isMatched).length;
    const totalCriticalGaps = techSpectrumList.filter(t => !t.isMatched && (t.importance === 'Critical' || t.gapPriority === 'Critical')).length;
    const totalModerateGaps = techSpectrumList.filter(t => !t.isMatched && !((t.importance === 'Critical' || t.gapPriority === 'Critical'))).length;
    const totalTransferable = (candidateMatch?.transferableStrengths || []).length;

    const distributionData = [
      { name: 'Verified Match', value: totalMatched, color: '#10b981' },
      { name: 'Transferable Strength', value: Math.max(1, totalTransferable), color: '#3b82f6' },
      { name: 'Critical Gap', value: totalCriticalGaps, color: '#ef4444' },
      { name: 'Secondary / Bonus Gap', value: totalModerateGaps, color: '#f59e0b' }
    ].filter(d => d.value > 0);

    // Overall Coverage Metrics
    const totalRequirementsCount = uniqueJobSkills.length || 1;
    const overallMatchRate = Math.round((totalMatched / totalRequirementsCount) * 100);
    const mustHavesCount = skillsAnalysis.mustHaveSkills.length || 1;
    const mustHavesCovered = skillsAnalysis.mustHaveSkills.filter(m => 
      matchedSkillsSet.has(m.name.toLowerCase().trim()) || candidateSkillsLower.has(m.name.toLowerCase().trim())
    ).length;
    const mustHaveCoverageRate = Math.round((mustHavesCovered / mustHavesCount) * 100);

    return {
      radarData,
      categoryBarData,
      techSpectrumList,
      distributionData,
      categories: ['all', ...categories],
      metrics: {
        totalRequirements: uniqueJobSkills.length,
        totalMatched,
        totalGaps: totalCriticalGaps + totalModerateGaps,
        totalCriticalGaps,
        overallMatchRate,
        mustHavesCount,
        mustHavesCovered,
        mustHaveCoverageRate,
        matchScore: candidateMatch?.matchScore ?? overallMatchRate,
        matchTier: candidateMatch?.matchTier ?? 'Strong Match'
      }
    };
  }, [analysis, userProfile, candidateMatch, skillsAnalysis]);

  // Filtered tech spectrum list
  const filteredTechSpectrum = useMemo(() => {
    return processedData.techSpectrumList.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (filterType === 'matched' && !item.isMatched) return false;
      if (filterType === 'gaps' && item.isMatched) return false;
      return true;
    });
  }, [processedData.techSpectrumList, selectedCategory, filterType]);

  // Handle tech item click
  const handleItemClick = (item: any) => {
    setActiveSkillDetail({
      name: item.name,
      category: item.category || 'Core Skill',
      isMatched: item.isMatched,
      importance: item.importance,
      recommendation: item.recommendation,
      demandLevel: item.jobDemand,
      resumeLevel: item.resumeLevel
    });
    if (onSelectSkill) {
      onSelectSkill(item.name, !item.isMatched);
    }
  };

  return (
    <div id="skill-analysis-visualization-root" className={`space-y-6 ${className}`}>
      
      {/* Top Metrics High-Contrast Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Overall Match Score */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overall Alignment</span>
            <Target className="w-3.5 h-3.5 text-brand-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {processedData.metrics.matchScore}%
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              {processedData.metrics.matchTier}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-brand-primary h-full rounded-full transition-all duration-500" 
              style={{ width: `${processedData.metrics.matchScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Matched Skills Count */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/70 bg-emerald-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Direct Overlap</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900 tracking-tight">
              {processedData.metrics.totalMatched}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              / {processedData.metrics.totalRequirements} Skills
            </span>
          </div>
          <p className="text-[10px] text-emerald-700/80">
            Verified on your active resume
          </p>
        </div>

        {/* Metric 3: Must-Have Core Coverage */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200/70 bg-blue-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Core Must-Haves</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-950 tracking-tight">
              {processedData.metrics.mustHaveCoverageRate}%
            </span>
            <span className="text-[11px] text-blue-700 font-medium">
              {processedData.metrics.mustHavesCovered}/{processedData.metrics.mustHavesCount}
            </span>
          </div>
          <p className="text-[10px] text-blue-700/80">
            Non-negotiable job requirements
          </p>
        </div>

        {/* Metric 4: Identified Gaps */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200/70 bg-amber-50/20 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
            <span>Identified Gaps</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950 tracking-tight">
              {processedData.metrics.totalGaps}
            </span>
            <span className="text-[11px] font-bold text-red-600">
              ({processedData.metrics.totalCriticalGaps} Critical)
            </span>
          </div>
          <p className="text-[10px] text-amber-800/80">
            Actionable bridge areas
          </p>
        </div>
      </div>

      {/* Main Interactive Recharts Visualization Container */}
      <Card className="border-brand-border bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center border border-blue-200 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Interactive Resume & Job Skill Analysis</span>
                    <Badge className="bg-brand-primary text-white text-[10px] font-mono px-1.5 py-0 border-none">
                      Recharts
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Visual comparative analysis comparing {userProfile?.name ? `${userProfile.name}'s resume` : 'candidate profile'} vs requirements for <span className="font-semibold text-slate-700">{job.title}</span> at <span className="font-semibold text-slate-700">{job.company}</span>.
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* View Mode Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start md:self-auto overflow-x-auto max-w-full">
              <button
                id="view-mode-radar"
                type="button"
                onClick={() => setViewMode('radar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  viewMode === 'radar'
                    ? 'bg-white text-brand-primary shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <RadarIcon className="w-3.5 h-3.5" />
                <span>Competency Radar</span>
              </button>

              <button
                id="view-mode-category-bar"
                type="button"
                onClick={() => setViewMode('category-bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  viewMode === 'category-bar'
                    ? 'bg-white text-brand-primary shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Category Breakdown</span>
              </button>

              <button
                id="view-mode-tech-spectrum"
                type="button"
                onClick={() => setViewMode('tech-spectrum')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  viewMode === 'tech-spectrum'
                    ? 'bg-white text-brand-primary shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Tech-by-Tech Fit</span>
              </button>

              <button
                id="view-mode-distribution"
                type="button"
                onClick={() => setViewMode('distribution')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  viewMode === 'distribution'
                    ? 'bg-white text-brand-primary shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>Match Distribution</span>
              </button>
            </div>
          </div>

          {/* Sub-Filters (Category + Match/Gap filter for Tech Spectrum & Breakdown) */}
          {(viewMode === 'tech-spectrum' || viewMode === 'category-bar') && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-semibold mr-1">Category:</span>
                {processedData.categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      selectedCategory === cat
                        ? 'bg-brand-primary text-white border-brand-primary shadow-2xs font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  All ({processedData.metrics.totalRequirements})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('matched')}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    filterType === 'matched' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700'
                  }`}
                >
                  Matched ({processedData.metrics.totalMatched})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('gaps')}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    filterType === 'gaps' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-700'
                  }`}
                >
                  Gaps ({processedData.metrics.totalGaps})
                </button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          
          {/* VIEW 1: RADAR COMPETENCY MATRIX */}
          {viewMode === 'radar' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                
                {/* Recharts Radar Chart */}
                <div className="w-full lg:w-3/5 h-[360px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={processedData.radarData}>
                      <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <PolarAngleAxis 
                        dataKey="category" 
                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                      />
                      
                      {/* Job Requirement Envelope */}
                      <Radar
                        name="Job Requirement Depth"
                        dataKey="JobRequirement"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />

                      {/* Candidate Stated/Inferred Skills */}
                      <Radar
                        name="Candidate Resume Coverage"
                        dataKey="CandidateResume"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.45}
                        strokeWidth={2.5}
                      />

                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        iconType="circle"
                      />
                      
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs">
                                <div className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1 flex items-center justify-between">
                                  <span>{data.fullCategory}</span>
                                  <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[10px]">
                                    {data.coveragePercent}% Coverage
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span>Resume Strength:</span>
                                  </span>
                                  <span className="font-bold text-emerald-400">{data.CandidateResume}%</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                    <span>Job Requirement:</span>
                                  </span>
                                  <span className="font-bold text-indigo-400">{data.JobRequirement}%</span>
                                </div>
                                
                                {data.matchedList?.length > 0 && (
                                  <div className="pt-1 text-[11px] text-emerald-300">
                                    <span className="font-semibold text-slate-400">Matched: </span>
                                    {data.matchedList.slice(0, 4).join(', ')}
                                    {data.matchedList.length > 4 ? ` +${data.matchedList.length - 4}` : ''}
                                  </div>
                                )}
                                
                                {data.gapList?.length > 0 && (
                                  <div className="pt-0.5 text-[11px] text-amber-300">
                                    <span className="font-semibold text-slate-400">Gaps: </span>
                                    {data.gapList.slice(0, 3).join(', ')}
                                    {data.gapList.length > 3 ? ` +${data.gapList.length - 3}` : ''}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Right Side: Radar Insight Breakdown Cards */}
                <div className="w-full lg:w-2/5 space-y-3">
                  <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-brand-primary" />
                      <span>Domain Alignment Breakdown</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The radar polygon reveals your coverage depth across all core engineering domains required for this position.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {processedData.radarData.map(cat => (
                      <div 
                        key={cat.fullCategory}
                        className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {cat.fullCategory}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="text-emerald-600 font-semibold">{cat.matchedCount} Matched</span>
                            <span>•</span>
                            <span className={cat.gapCount > 0 ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
                              {cat.gapCount} Gaps
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-black text-sm text-slate-900">
                            {cat.coveragePercent}%
                          </div>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full rounded-full ${
                                cat.coveragePercent >= 75 
                                  ? 'bg-emerald-500' 
                                  : cat.coveragePercent >= 50 
                                  ? 'bg-blue-500' 
                                  : 'bg-amber-500'
                              }`} 
                              style={{ width: `${cat.coveragePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 2: CATEGORY OVERLAP & GAP BREAKDOWN (STACKED BAR) */}
          {viewMode === 'category-bar' && (
            <div className="space-y-6">
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processedData.categoryBarData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      label={{ value: 'Number of Competencies / Skills', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      width={120}
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5">
                              <div className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1">
                                {data.category} ({data.coverageRate}% Fit)
                              </div>
                              <div className="flex items-center justify-between text-emerald-300">
                                <span>Directly Matched:</span>
                                <span className="font-bold">{data.Matched} skills</span>
                              </div>
                              <div className="flex items-center justify-between text-amber-300">
                                <span>Skill Gaps:</span>
                                <span className="font-bold">{data.Gaps} skills</span>
                              </div>
                              {data.criticalGaps > 0 && (
                                <div className="text-red-400 font-semibold text-[11px]">
                                  ⚠ {data.criticalGaps} Critical priority gap(s)
                                </div>
                              )}
                              <div className="text-slate-400 text-[10px] pt-1">
                                Total Requirements: {data.Total}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }} 
                    />
                    <Bar 
                      dataKey="Matched" 
                      name="Directly Matched Skills" 
                      stackId="a" 
                      fill="#10b981" 
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="Gaps" 
                      name="Skill Gaps to Address" 
                      stackId="a" 
                      fill="#f59e0b" 
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Categorized Quick Pills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {processedData.categoryBarData.map(cat => (
                  <div key={cat.category} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{cat.category}</span>
                      <Badge className={`text-[10px] font-bold ${
                        cat.coverageRate >= 75 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : cat.coverageRate >= 50
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {cat.coverageRate}% Fit
                      </Badge>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      {cat.matchedList.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cat.matchedList.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {cat.gapList.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cat.gapList.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-medium">
                              ! {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: TECH-BY-TECH FIT & SPECTRUM */}
          {viewMode === 'tech-spectrum' && (
            <div className="space-y-6">
              
              {/* Individual Technology Bar Chart */}
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredTechSpectrum.slice(0, 14)}
                    margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-35} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      label={{ value: 'Proficiency / Demand (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs">
                              <div className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-1 flex items-center justify-between">
                                <span>{data.name}</span>
                                <Badge className={`text-[10px] ${data.isMatched ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                  {data.status}
                                </Badge>
                              </div>
                              <div className="text-slate-300 text-[11px]">
                                <span className="text-slate-400">Category:</span> {data.category}
                              </div>
                              <div className="flex items-center justify-between text-indigo-300">
                                <span>Job Requirement Priority:</span>
                                <span className="font-bold">{data.jobDemand}% ({data.importance})</span>
                              </div>
                              <div className="flex items-center justify-between text-emerald-300">
                                <span>Resume Stated Alignment:</span>
                                <span className="font-bold">{data.resumeLevel}%</span>
                              </div>
                              {data.recommendation && (
                                <div className="text-amber-200 text-[11px] pt-1 bg-amber-950/40 p-1.5 rounded border border-amber-800/60 leading-relaxed">
                                  💡 {data.recommendation}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }} />
                    <Bar 
                      dataKey="jobDemand" 
                      name="Job Requirement Priority" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="resumeLevel" 
                      name="Resume Fit Level" 
                      radius={[4, 4, 0, 0]}
                    >
                      {filteredTechSpectrum.slice(0, 14).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isMatched ? '#10b981' : entry.importance === 'Critical' ? '#ef4444' : '#f59e0b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Interactive Skill Clickable Tiles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Click Any Technology for Deep-Dive Coaching</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing {filteredTechSpectrum.length} skills
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {filteredTechSpectrum.map(tech => (
                    <button
                      key={tech.name}
                      type="button"
                      onClick={() => handleItemClick(tech)}
                      className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] flex flex-col justify-between gap-2 ${
                        activeSkillDetail?.name === tech.name
                          ? 'ring-2 ring-brand-primary border-brand-primary bg-blue-50/50 shadow-2xs'
                          : tech.isMatched
                          ? 'bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/60'
                          : tech.importance === 'Critical'
                          ? 'bg-red-50/30 border-red-200/80 hover:bg-red-50/60'
                          : 'bg-amber-50/30 border-amber-200/80 hover:bg-amber-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{tech.name}</span>
                        {tech.isMatched ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${tech.importance === 'Critical' ? 'text-red-500' : 'text-amber-500'}`} />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono">{tech.category}</span>
                        <span className={`font-bold ${tech.isMatched ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {tech.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Skill Inspection Drawer */}
              {activeSkillDetail && (
                <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 space-y-3 animate-in fade-in duration-200 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{activeSkillDetail.name}</span>
                      <Badge className={activeSkillDetail.isMatched ? 'bg-emerald-500 text-white border-none' : 'bg-amber-500 text-white border-none'}>
                        {activeSkillDetail.isMatched ? 'Verified Resume Skill' : 'Gap Area'}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-600 text-[10px]">
                        {activeSkillDetail.category}
                      </Badge>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setActiveSkillDetail(null)}
                      className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800"
                    >
                      Dismiss
                    </button>
                  </div>

                  {activeSkillDetail.recommendation ? (
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tactical Advice to Bridge This Gap in Screenings:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {activeSkillDetail.recommendation}
                      </p>
                    </div>
                  ) : activeSkillDetail.isMatched ? (
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>This skill is directly verified on your active candidate profile. Be ready to articulate specific metrics and system scale from your past projects.</span>
                    </div>
                  ) : null}
                </div>
              )}

            </div>
          )}

          {/* VIEW 4: MATCH DISTRIBUTION & GAP IMPACT */}
          {viewMode === 'distribution' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                
                {/* Recharts Pie / Donut Chart */}
                <div className="w-full lg:w-1/2 h-[320px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedData.distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {processedData.distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const percent = Math.round((Number(data.value) / processedData.metrics.totalRequirements) * 100);
                            return (
                              <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
                                  <span>{data.name}</span>
                                </div>
                                <div className="text-slate-300">
                                  {data.value} Competencies ({percent}% of total)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Donut Stat Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {processedData.metrics.matchScore}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Match Fit
                    </span>
                  </div>
                </div>

                {/* Right Side: Key Takeaways & Distribution Breakdown */}
                <div className="w-full lg:w-1/2 space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-brand-primary" />
                      <span>Application Readiness Assessment</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {processedData.metrics.matchScore >= 80 ? (
                        <span className="text-emerald-700 font-semibold">
                          Exceptional alignment! You exceed the threshold for this position with strong core coverage.
                        </span>
                      ) : processedData.metrics.matchScore >= 65 ? (
                        <span className="text-blue-700 font-semibold">
                          Solid competitive match. Focus your cold outreach on highlighting transferable strengths for identified gaps.
                        </span>
                      ) : (
                        <span className="text-amber-800 font-semibold">
                          Growth opportunity role. Emphasize adjacent engineering achievements and fast ramp-up trajectory.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {processedData.distributionData.map(d => (
                      <div key={d.name} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="truncate">{d.name}</span>
                        </div>
                        <div className="text-xl font-black text-slate-900">
                          {d.value} <span className="text-xs font-normal text-slate-500">skills</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Transferable Strengths Quick Tag List */}
                  {candidateMatch?.transferableStrengths && candidateMatch.transferableStrengths.length > 0 && (
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 space-y-1.5 text-xs">
                      <div className="font-bold text-blue-900 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Key Bridge Strengths:</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 text-[11px]">
                        {candidateMatch.transferableStrengths.slice(0, 3).map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-brand-primary font-bold">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}

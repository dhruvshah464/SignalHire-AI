import React, { useState, useEffect } from 'react';
import { supabase, Outreach } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  Pencil, 
  Radar, 
  Layers, 
  Send,
  History,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { OnboardingModal } from '@/components/OnboardingModal';
import { AnimatePresence, motion } from 'motion/react';
import { JobSkillInputCard } from '@/components/dashboard/JobSkillInputCard';
import { JobSkillAnalysisView } from '@/components/dashboard/JobSkillAnalysisView';
import { JobAnalysisHistory } from '@/components/dashboard/JobAnalysisHistory';
import { OutreachPipelineTable } from '@/components/dashboard/OutreachPipelineTable';
import { analyzeJobSkills } from '@/lib/gemini';
import { 
  getSavedJobAnalyses, 
  saveJobAnalysis, 
  deleteSavedJobAnalysis 
} from '@/lib/jobAnalysisStorage';
import { 
  getPipelineItems, 
  savePipelineItem, 
  addJobAnalysisToPipeline 
} from '@/lib/pipelineStorage';
import { PipelineItem } from '@/types/pipeline';
import { JobAnalysisResult } from '@/types/jobAnalysis';
import { getSavedUserProfile } from '@/lib/profile';
import { UserProfile } from '@/types/profile';
import { toast } from 'sonner';

export default function Dashboard() {
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [loadingOutreaches, setLoadingOutreaches] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Outreach Pipeline State
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>(() => getPipelineItems());

  // AI Skill Analysis State
  const [currentAnalysis, setCurrentAnalysis] = useState<JobAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<JobAnalysisResult[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getSavedUserProfile());

  const navigate = useNavigate();

  useEffect(() => {
    // Check onboarding status
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    // Load saved job analyses from local storage
    const loadedHistory = getSavedJobAnalyses();
    setSavedAnalyses(loadedHistory);
    // If there's history and no active analysis, load the latest one for convenience
    if (loadedHistory.length > 0 && !currentAnalysis) {
      setCurrentAnalysis(loadedHistory[0]);
    }

    // Refresh pipeline items
    setPipelineItems(getPipelineItems());

    async function fetchOutreaches() {
      try {
        const { data, error } = await supabase
          .from('outreaches')
          .select('*')
          .order('created_at', { ascending: false });

        let allOutreaches = data || [];

        // Check local storage for demo items
        const localString = localStorage.getItem('demo_outreaches');
        if (localString) {
          const localOutreaches = JSON.parse(localString);
          // Combine and filter out duplicates if any
          allOutreaches = [...localOutreaches, ...allOutreaches].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }

        if (error) {
          console.warn('Supabase fetch failed, using local storage only:', error);
          if (localString) {
            allOutreaches = JSON.parse(localString);
          }
        }
        
        setOutreaches(allOutreaches);
      } catch (error) {
        console.error('Error fetching outreaches:', error);
      } finally {
        setLoadingOutreaches(false);
      }
    }

    fetchOutreaches();
  }, []);

  // Handler: Trigger AI Job Scrape & Skill Analysis
  const handleAnalyzeJob = async (params: {
    url?: string;
    keywords?: string;
    rawDescription?: string;
    userProfile?: UserProfile;
  }) => {
    setIsAnalyzing(true);
    try {
      const activeProfile = params.userProfile || getSavedUserProfile();
      const result = await analyzeJobSkills({
        url: params.url,
        keywords: params.keywords,
        rawDescription: params.rawDescription,
        userProfile: activeProfile
      });

      // Attach client ID and timestamp if missing
      const fullResult: JobAnalysisResult = {
        ...result,
        id: result.id || `job-analysis-${Date.now()}`,
        sourceType: params.url ? 'url' : params.keywords ? 'keywords' : 'text',
        inputQuery: params.url || params.keywords || 'Pasted Description',
        analyzedAt: new Date().toISOString()
      };

      setCurrentAnalysis(fullResult);
      // Auto save to radar history
      const updatedHistory = saveJobAnalysis(fullResult);
      setSavedAnalyses(updatedHistory);

      // Auto add to Outreach Pipeline as bookmarked lead
      const { items: updatedPipeline } = addJobAnalysisToPipeline(fullResult, 'bookmarked');
      setPipelineItems(updatedPipeline);

      toast.success(
        `Scraped & analyzed ${fullResult.job.title} at ${fullResult.job.company}! Added to Pipeline.`
      );
    } catch (err: any) {
      console.error('Job Analysis Error:', err);
      toast.error(err.message || 'Failed to analyze job posting. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler: Save / Bookmark analysis
  const handleSaveAnalysis = (analysis: JobAnalysisResult) => {
    const updated = saveJobAnalysis(analysis);
    setSavedAnalyses(updated);
    toast.success('Job analysis saved to your Job Radar history.');
  };

  // Handler: Track in Pipeline
  const handleTrackInPipeline = (analysis: JobAnalysisResult, initialStatus: 'applied' | 'interviewing' | 'bookmarked') => {
    const { items: updatedPipeline, addedItem } = addJobAnalysisToPipeline(analysis, initialStatus);
    setPipelineItems(updatedPipeline);
    toast.success(`Tracked "${addedItem.jobTitle}" in Outreach Pipeline as ${initialStatus.toUpperCase()}`);
  };

  // Handler: Open Pipeline item analysis
  const handleOpenPipelineItemAnalysis = (item: PipelineItem) => {
    // Check if we have matching rawJobAnalysisId
    const matchingAnalysis = savedAnalyses.find(
      a => a.id === item.rawJobAnalysisId ||
           (a.job.company.toLowerCase() === item.company.toLowerCase() && 
            a.job.title.toLowerCase() === item.jobTitle.toLowerCase())
    );

    if (matchingAnalysis) {
      setCurrentAnalysis(matchingAnalysis);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    } else {
      // Create synthetic analysis result from pipeline item
      const syntheticAnalysis: JobAnalysisResult = {
        id: item.rawJobAnalysisId || item.id,
        sourceType: item.jobUrl ? 'url' : 'keywords',
        inputQuery: item.jobUrl || `${item.jobTitle} at ${item.company}`,
        analyzedAt: item.scrapedAt,
        job: {
          title: item.jobTitle,
          company: item.company,
          location: item.location,
          workplaceType: item.workplaceType,
          seniority: item.seniority || 'Senior',
          salaryEstimate: item.salaryEstimate,
          summary: item.notes || `Tracked application for ${item.jobTitle} at ${item.company}.`,
          url: item.jobUrl,
          recruiter: item.recruiterName ? {
            name: item.recruiterName,
            linkedinUrl: item.recruiterUrl
          } : undefined
        },
        skillsAnalysis: {
          mustHaveSkills: (item.mustHaveSkills || ['TypeScript', 'System Design', 'React', 'Problem Solving']).map(s => ({
            name: s,
            category: 'Core Competency',
            importance: 'Critical'
          })),
          niceToHaveSkills: (item.missingSkills || []).map(s => ({
            name: s,
            category: 'Bonus'
          })),
          skillCategories: [
            { category: 'Key Requirements', skills: item.mustHaveSkills || [] }
          ],
          responsibilities: [
            `Design and execute high-impact features for ${item.company}.`,
            'Collaborate with product and cross-functional teams.'
          ],
          techStackOverview: (item.mustHaveSkills || []).join(', ')
        },
        candidateMatch: item.matchScore ? {
          matchScore: item.matchScore,
          matchTier: (item.matchTier as any) || 'Strong Match',
          matchedSkills: item.mustHaveSkills || [],
          missingSkills: (item.missingSkills || []).map(s => ({
            name: s,
            priority: 'High',
            recommendation: `Brush up on ${s} fundamentals prior to technical screening.`
          })),
          alignmentSummary: `Strong domain alignment with ${item.company}'s engineering culture.`,
          transferableStrengths: ['Full-stack problem solving', 'Production velocity'],
          resumeTailoringAdvice: [`Highlight experience with ${(item.mustHaveSkills || [])[0] || 'relevant stack'}.`],
          suggestedTalkingPoints: [`Walk through scaling challenges solved with ${(item.mustHaveSkills || [])[0] || 'core tools'}.`],
          interviewQuestionsToExpect: [
            {
              question: `How would you architect a fault-tolerant system at ${item.company}?`,
              category: 'System Design',
              recommendedAngle: 'Focus on distributed resilience, data contracts, and observability.'
            }
          ]
        } : undefined
      };

      setCurrentAnalysis(syntheticAnalysis);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  // Handler: Delete analysis from history
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSavedJobAnalysis(id);
    setSavedAnalyses(updated);
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(updated.length > 0 ? updated[0] : null);
    }
    toast.info('Removed from history.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-slate-100 text-slate-600';
      case 'replied': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-blue-50 text-blue-600';
    }
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem('has_seen_onboarding', 'true');
    setShowOnboarding(false);
  };

  const filteredOutreaches = outreaches.filter(o => 
    o.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if current active analysis is in pipeline
  const isCurrentInPipeline = currentAnalysis ? pipelineItems.some(
    p => (p.company.toLowerCase() === currentAnalysis.job.company.toLowerCase() && 
          p.jobTitle.toLowerCase() === currentAnalysis.job.title.toLowerCase()) ||
         p.rawJobAnalysisId === currentAnalysis.id
  ) : false;

  const currentPipelineStatus = currentAnalysis ? pipelineItems.find(
    p => (p.company.toLowerCase() === currentAnalysis.job.company.toLowerCase() && 
          p.jobTitle.toLowerCase() === currentAnalysis.job.title.toLowerCase()) ||
         p.rawJobAnalysisId === currentAnalysis.id
  )?.status : undefined;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <AnimatePresence>
        {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      </AnimatePresence>

      {/* 1. Primary AI Job Scrape & Skill Analysis Input Interface */}
      <JobSkillInputCard
        onAnalyze={handleAnalyzeJob}
        isLoading={isAnalyzing}
      />

      {/* 2. Dynamic Deep-Dive AI Skill Analysis View (When loaded or selected) */}
      {currentAnalysis && (
        <JobSkillAnalysisView
          analysis={currentAnalysis}
          onClose={() => setCurrentAnalysis(null)}
          onSave={handleSaveAnalysis}
          isSaved={savedAnalyses.some(a => a.id === currentAnalysis.id)}
          onTrackInPipeline={handleTrackInPipeline}
          isPipelineTracked={isCurrentInPipeline}
          pipelineStatus={currentPipelineStatus}
        />
      )}

      {/* 3. Primary Feature: Outreach & Application Pipeline Table */}
      <OutreachPipelineTable
        items={pipelineItems}
        onItemsChange={(newItems) => setPipelineItems(newItems)}
        onOpenAnalysis={handleOpenPipelineItemAnalysis}
      />

      {/* 4. Lower Workspace: Recent Campaigns & Radar History */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Generated Pitch Campaigns & Messages
              </h2>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold font-mono">
                {outreaches.length} Pitches
              </Badge>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Personalized recruiter cold emails, connection notes, and follow-up templates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/new">
              <Button className="bg-brand-primary hover:bg-brand-primary/90 gap-1.5 rounded-xl font-semibold px-3.5 text-xs h-9 shadow-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>New Outreach</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Outreaches & History */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            
            {/* Search Outreach Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Filter campaigns by role or company..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Outreach Campaigns List */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden divide-y divide-slate-100">
              <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Pitch Deliveries</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredOutreaches.length} active
                </span>
              </div>

              {loadingOutreaches ? (
                <div className="p-10 text-center text-slate-400 italic text-xs">
                  Gathering outreaches...
                </div>
              ) : filteredOutreaches.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs space-y-2">
                  <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No active campaigns matching your query.</p>
                  <Link to="/new">
                    <Button variant="outline" size="sm" className="text-xs h-7 mt-1">
                      Create First Outreach
                    </Button>
                  </Link>
                </div>
              ) : (
                <motion.div layout className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {filteredOutreaches.map((outreach) => (
                      <motion.div
                        key={outreach.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          backgroundColor: outreach.status === 'sent' ? 'var(--color-blue-50, #eff6ff)' : '#ffffff'
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => navigate(`/outreach/${outreach.id}`)}
                        className={cn(
                          "block p-3.5 transition-colors border-l-4 cursor-pointer relative group",
                          outreach.status === 'sent' ? "border-blue-600" : "border-transparent hover:bg-slate-50"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-xs truncate pr-2 text-slate-900">{outreach.job_title}</h3>
                          <div className="flex items-center gap-1.5">
                            {outreach.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/new', { state: { editOutreachId: outreach.id } });
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                            <motion.span 
                              layout="position"
                              className={cn(
                                "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded",
                                getStatusColor(outreach.status)
                              )}
                            >
                              {outreach.status}
                            </motion.span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2 truncate">
                          {outreach.company_name} • {outreach.recruiter_name || 'HR Team'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 border border-slate-100 font-mono">
                            {new Date(outreach.created_at).toLocaleDateString()}
                          </span>
                          {outreach.resume_data?.matchScore && (
                            <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700 font-bold border border-emerald-200">
                              {outreach.resume_data.matchScore}% Fit
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Saved Job Analyses History Widget */}
            <JobAnalysisHistory
              history={savedAnalyses}
              onSelect={(item) => {
                setCurrentAnalysis(item);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              onDelete={handleDeleteHistory}
              activeId={currentAnalysis?.id}
            />

          </div>

          {/* Right Column: Quick Status & Strategic Insights */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {!currentAnalysis ? (
              <Card className="glass-card shadow-xs h-full min-h-[320px] flex flex-col items-center justify-center p-10 text-center text-slate-400 bg-slate-50/50 border-dashed border-2 rounded-2xl">
                <div className="max-w-md space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-brand-primary flex items-center justify-center mx-auto shadow-2xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    AI Job Description Scraper & Skill Radar
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Paste a job URL or search keywords above. Gemini will instantly scrape requirements, extract must-have vs bonus skills, and benchmark your candidate profile.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="border-brand-border shadow-xs bg-white p-6 rounded-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center font-bold">
                      <Radar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Quick Application Roadmap: {currentAnalysis.job.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Targeting {currentAnalysis.job.company} • {currentAnalysis.job.location}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      navigate('/new', {
                        state: {
                          prefilledJob: {
                            title: currentAnalysis.job.title,
                            company: currentAnalysis.job.company,
                            description: currentAnalysis.job.summary + '\n\n' + (currentAnalysis.job.fullDescription || currentAnalysis.skillsAnalysis.responsibilities.join('\n')),
                            url: currentAnalysis.job.url || '',
                            recruiter_name: currentAnalysis.job.recruiter?.name || '',
                            recruiter_url: currentAnalysis.job.recruiter?.linkedinUrl || '',
                            matchScore: currentAnalysis.candidateMatch?.matchScore || 85
                          }
                        }
                      });
                    }}
                    className="bg-brand-primary text-white text-xs h-8 px-3.5 gap-1.5 font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Generate Outreach</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Must-Haves
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {currentAnalysis.skillsAnalysis.mustHaveSkills.length} Skills
                    </span>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentAnalysis.skillsAnalysis.mustHaveSkills.slice(0, 3).map(s => s.name).join(', ')}
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      Candidate Fit
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {currentAnalysis.candidateMatch?.matchScore || 85}%
                    </span>
                    <p className="text-[11px] text-emerald-600 truncate">
                      {currentAnalysis.candidateMatch?.matchTier || 'Strong Match'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      Action Plan
                    </span>
                    <span className="text-lg font-black text-blue-700">
                      {currentAnalysis.candidateMatch?.missingSkills.length || 0} Gap Areas
                    </span>
                    <p className="text-[11px] text-blue-600 truncate">
                      Tactical talking points ready
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

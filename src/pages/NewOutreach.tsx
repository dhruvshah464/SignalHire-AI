import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, ChevronRight, Briefcase, FileText, Sparkles, Loader2, ArrowLeft, Upload, X, Trophy, ThumbsDown, Lightbulb, Target, Pencil, Save, Mail, Search, ExternalLink } from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { generateOutreach, parseResume, extractJobFromText } from '@/lib/gemini';
import { z } from 'zod';
import { toast } from 'sonner';

const jobSchema = z.object({
  url: z.string().min(1, "Job URL is required").url("Please enter a valid URL (including https://)")
});

const resumeSchema = z.object({
  text: z.string().optional(),
  file: z.any().optional(),
}).refine(data => (data.text && data.text.trim().length > 50) || data.file, {
  message: "Please upload a resume file or paste at least 50 characters of your experience.",
  path: ["text"]
});

export default function NewOutreach() {
  const [step, setStep] = useState(1);
  const [jobUrl, setJobUrl] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [outreachResult, setOutreachResult] = useState<any>(null);
  const [editableMessages, setEditableMessages] = useState<any>(null);
  const [editingField, setEditingField] = useState<{ type: string, index?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTab, setSearchTab] = useState<'search' | 'url'>('search');
  const navigate = useNavigate();
  const location = useLocation();
  const editOutreachId = location.state?.editOutreachId;

  React.useEffect(() => {
    async function loadDraft() {
      if (!editOutreachId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('outreaches')
          .select('*')
          .eq('id', editOutreachId)
          .single();
          
        if (error) {
          // Check local storage for demo
          const localString = localStorage.getItem('demo_outreaches');
          if (localString) {
            const localOutreaches = JSON.parse(localString);
            const found = localOutreaches.find((o: any) => o.id === editOutreachId);
            if (found) {
              populateFromDraft(found);
            }
          }
        } else if (data) {
          populateFromDraft(data);
        }
      } catch (err) {
        console.error('Error loading draft', err);
      } finally {
        setLoading(false);
      }
    }
    
    function populateFromDraft(draft: any) {
      if (draft.job_data) {
        setJobUrl(draft.job_url || '');
        setJobData(draft.job_data);
      }
      if (draft.resume_data) {
        setResumeData(draft.resume_data);
        if (draft.resume_data.original_text) {
          setResumeText(draft.resume_data.original_text);
        }
      }
      if (draft.outreach_result) {
        setOutreachResult(draft.outreach_result);
      }
      if (draft.messages) {
        setEditableMessages(draft.messages);
      }
      // Jump to step 3 since we have everything theoretically, 
      // but if we only have job data we jump to step 2.
      if (draft.messages) {
        setStep(3);
      } else if (draft.resume_data) {
        setStep(2);
      }
    }

    loadDraft();
  }, [editOutreachId]);

  const handleNextStep = () => {
    setError(null);
    setFieldErrors({});
    setStep(step + 1);
  };
  const handlePrevStep = () => {
    setError(null);
    setFieldErrors({});
    setStep(step - 1);
  };

  const searchJobs = async () => {
    if (!searchQuery.trim()) {
      setFieldErrors({ search: "Please enter a job title or keyword" });
      return;
    }
    setIsSearching(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const response = await fetch(`/api/search-jobs?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.data || []);
      if (!data.data || data.data.length === 0) {
        toast.info("No jobs found for this query");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      toast.error("Failed to search jobs. You can still paste a URL manually.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (job: any) => {
    setJobData({
      title: job.job_title,
      company: job.employer_name,
      description: job.job_description,
      url: job.job_apply_link,
      recruiter_name: '',
      recruiter_url: ''
    });
    setJobUrl(job.job_apply_link || '');
    setSearchResults([]);
    setSearchQuery('');
    toast.success('Job details imported from search');
  };

  const scrapeJob = async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Validate with Zod
      jobSchema.parse({ url: jobUrl });

      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl })
      });
      
      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      
      // If server returned raw text for AI extraction, use Gemini here
      if (data.rawText && (!data.description || data.description.length < 100)) {
        try {
          const aiData = await extractJobFromText(data.rawText);
          data.title = aiData.title || data.title;
          data.company = aiData.company || data.company;
          data.description = aiData.description || data.description;
          data.recruiter_name = aiData.recruiter_name || data.recruiter_name;
          data.recruiter_url = aiData.recruiter_url || data.recruiter_url;
        } catch (aiErr) {
          console.warn('AI job extraction failed, using best-guess scraper results', aiErr);
        }
      }

      setJobData(data);
      toast.success('Job details imported successfully');
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach(e => {
          if (e.path[0]) errors[e.path[0].toString()] = e.message;
        });
        setFieldErrors(errors);
      } else {
        console.error('Scraping error:', err);
        setError(err.message || 'Failed to scrape job details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const processResume = async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Validate with Zod
      resumeSchema.parse({ text: resumeText, file: resumeFile });

      let textToParse = resumeText;

      if (resumeFile && !resumeText) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        
        const response = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to upload resume file');
        }

        const uploadData = await response.json();
        textToParse = uploadData.text;
      }

      if (!textToParse) {
        throw new Error('Please upload a resume or paste your experience text.');
      }

      const data = await parseResume(textToParse);
      setResumeData(data);
      toast.success('Resume processed successfully');
      handleNextStep();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach(e => {
          if (e.path[0]) errors[e.path[0].toString()] = e.message;
        });
        setFieldErrors(errors);
      } else {
        console.error('Parsing error:', err);
        setError(err.message || 'Failed to parse resume. Please ensure it contains clear professional info.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeText(''); // Clear text if file is uploaded
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeText('');
    }
  };

  const finalizeOutreach = async () => {
    setLoading(true);
    setError(null);
    try {
      const outreachData = await generateOutreach(jobData, resumeData);
      setOutreachResult(outreachData);
      setEditableMessages({ ...outreachData });
      setStep(4);
      toast.success('Outreach sequence generated!');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedResumeData = {
        ...resumeData,
        matchScore: outreachResult?.matchScore || 85,
        improvementSuggestions: outreachResult?.improvementSuggestions || []
      };

      const payload = {
        job_title: jobData?.title || 'Unknown Job',
        job_url: jobData?.url || '',
        company_name: jobData?.company || 'Unknown Company',
        recruiter_name: jobData?.recruiter_name || '',
        recruiter_email: jobData?.recruiter_email || '',
        recruiter_url: jobData?.recruiter_url || '',
        job_data: jobData,
        resume_data: updatedResumeData,
        messages: editableMessages,
        status: 'draft' as const,
        updated_at: new Date().toISOString()
      };
      
      const idToSave = editOutreachId || Math.random().toString(36).substring(7);

      let sbError = null;
      let finalData = null;

      if (editOutreachId) {
        const { data, error } = await supabase.from('outreaches').update(payload).eq('id', editOutreachId).select();
        sbError = error;
        finalData = data;
      } else {
        const fullPayload = {
          ...payload,
          id: idToSave,
          user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
          created_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from('outreaches').insert([fullPayload]).select();
        sbError = error;
        finalData = data;
      }

      if (sbError) {
        console.warn('Supabase save failed, falling back to local storage:', sbError);
        const existingString = localStorage.getItem('demo_outreaches') || '[]';
        let existing = JSON.parse(existingString);
        
        if (editOutreachId) {
            const idx = existing.findIndex((o: any) => o.id === editOutreachId);
            if (idx !== -1) {
                existing[idx] = { ...existing[idx], ...payload };
            }
        } else {
            existing = [...existing, { 
              ...payload, 
              id: idToSave, 
              user_id: '00000000-0000-0000-0000-000000000000', 
              created_at: new Date().toISOString() 
            }];
        }
        
        localStorage.setItem('demo_outreaches', JSON.stringify(existing));
        toast.info(editOutreachId ? 'Draft updated! (Demo Mode)' : 'Saved to local storage (Demo Mode)');
        navigate(`/outreach/${idToSave}`);
      } else if (finalData && finalData.length > 0) {
        toast.success(editOutreachId ? 'Draft updated successfully!' : 'Campaign saved successfully!');
        navigate(`/outreach/${finalData[0].id}`);
      } else {
        throw new Error('Failed to save outreach.');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save campaign.');
      toast.error('Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = (field: string, value: string, index?: number) => {
    setEditableMessages((prev: any) => {
      if (index !== undefined && field === 'follow_ups') {
        const newFollowUps = [...prev.follow_ups];
        newFollowUps[index] = value;
        return { ...prev, follow_ups: newFollowUps };
      }
      return { ...prev, [field]: value };
    });
  };

  const steps = [
    { title: 'Job Details', icon: Briefcase },
    { title: 'Resume Info', icon: FileText },
    { title: 'AI Generation', icon: Sparkles },
    { title: 'Results', icon: Target },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Button>
        <h1 className="text-2xl font-bold">New Outreach Campaign</h1>
      </div>

      {/* Stepper */}
      <div className="flex justify-between relative px-2">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0"></div>
        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              step > i + 1 ? "bg-green-500 text-white" :
              step === i + 1 ? "bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/20" :
              "bg-white border-2 border-slate-200 text-slate-400"
            )}>
              {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              step === i + 1 ? "text-brand-primary" : "text-slate-400"
            )}>{s.title}</span>
          </div>
        ))}
      </div>

      <Card className="glass-card shadow-xl shadow-slate-200/50">
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Find Job</h2>
                <p className="text-slate-500">Search for jobs directly or paste a link from any job board.</p>
              </div>

              <Tabs value={searchTab} onValueChange={(v) => setSearchTab(v as 'search' | 'url')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="search"><Search className="w-4 h-4 mr-2" /> Search Jobs</TabsTrigger>
                  <TabsTrigger value="url"><ExternalLink className="w-4 h-4 mr-2" /> Paste URL</TabsTrigger>
                </TabsList>
                <TabsContent value="search" className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" 
                        placeholder="E.g. Frontend Developer at Google..." 
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium",
                          fieldErrors.search ? "border-red-300 bg-red-50" : "border-slate-200"
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchJobs()}
                      />
                      {fieldErrors.search && <p className="text-red-500 text-xs font-medium italic">{fieldErrors.search}</p>}
                    </div>
                    <Button 
                      onClick={searchJobs} 
                      disabled={isSearching}
                      className="bg-brand-primary hover:bg-brand-primary/90 h-12 py-3 px-6 shrink-0"
                    >
                      {isSearching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Search
                    </Button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 border border-slate-100 rounded-xl max-h-[300px] overflow-y-auto bg-slate-50 divide-y divide-slate-100">
                      {searchResults.map((result: any) => (
                        <div key={result.job_id} className="p-4 hover:bg-white transition-colors cursor-pointer group" onClick={() => selectSearchResult(result)}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm text-slate-800 group-hover:text-brand-primary transition-colors">{result.job_title}</h4>
                            <div className="flex items-center gap-2">
                              {result.job_publisher && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                  {result.job_publisher}
                                </span>
                              )}
                              {result.job_apply_link && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 px-2 text-[10px] uppercase font-bold hover:bg-slate-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(result.job_apply_link, '_blank');
                                  }}
                                >
                                  Apply Now
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs font-medium text-slate-500">{result.employer_name}</p>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{result.job_description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <input 
                        type="url" 
                        placeholder="https://www.linkedin.com/jobs/view/..." 
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium",
                          fieldErrors.url ? "border-red-300 bg-red-50" : "border-slate-200"
                        )}
                        value={jobUrl}
                        onChange={(e) => {
                          setJobUrl(e.target.value);
                          if (jobData) setJobData(null);
                        }}
                      />
                      {fieldErrors.url && <p className="text-red-500 text-xs font-medium italic animate-in fade-in slide-in-from-top-1">{fieldErrors.url}</p>}
                    </div>
                    <Button 
                      onClick={scrapeJob} 
                      disabled={loading}
                      className="bg-brand-primary hover:bg-brand-primary/90 h-12 py-3 px-6 shrink-0"
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {jobData ? "Re-Import Job" : "Import Job"}
                    </Button>
                  </div>
                  {!jobData && (
                    <div className="pt-4 border-t border-dashed border-slate-200">
                      <p className="text-xs text-slate-400">Supported: LinkedIn, Glassdoor, Indeed, and most company career pages.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {jobData && (
                <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Job Details & Recruiter</h3>
                    {jobData.url && (
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="h-8 border-slate-200 text-slate-700 font-bold"
                        onClick={() => window.open(jobData.url, '_blank')}
                      >
                        Apply Now <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Job Title</label>
                      <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium" value={jobData.title || ''} readOnly />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company</label>
                      <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium" value={jobData.company || ''} readOnly />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recruiter Name</label>
                      <input 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none" 
                        placeholder="E.g. Jane Doe (Optional)"
                        value={jobData.recruiter_name || ''} 
                        onChange={(e) => setJobData({ ...jobData, recruiter_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recruiter LinkedIn URL</label>
                      <input 
                        type="url"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none" 
                        placeholder="https://linkedin.com/in/... (Optional)"
                        value={jobData.recruiter_url || ''} 
                        onChange={(e) => setJobData({ ...jobData, recruiter_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleNextStep} className="bg-brand-primary hover:bg-brand-primary/90">
                      Continue to Resume <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {!jobData && (
                <div className="pt-4 border-t border-dashed border-slate-200">
                  <p className="text-xs text-slate-400">Supported: LinkedIn, Glassdoor, Indeed, and most company career pages.</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Your Professional Profile</h2>
                <p className="text-slate-500">Upload your resume (PDF/DOCX) or paste your key highlights. AI will extract the details.</p>
              </div>

              {fieldErrors.text && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {fieldErrors.text}
                </div>
              )}

              {!resumeFile && !resumeText ? (
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
                    isDragging ? "border-brand-primary bg-brand-primary/5 scale-[1.01]" : "border-slate-200 hover:border-slate-300"
                  )}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt"
                  />
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Upload Resume</h3>
                  <p className="text-sm text-slate-500 mb-6">Drag and drop your file here, or click to browse</p>
                  <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>PDF</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>DOCX</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>TXT</span>
                  </div>
                </div>
              ) : resumeFile ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center text-brand-primary shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{resumeFile.name}</p>
                      <p className="text-xs text-slate-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-500" 
                    onClick={() => setResumeFile(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ) : null}

              {(!resumeFile || resumeText) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or paste manually</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>
                  <textarea 
                    className="w-full h-48 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium resize-none text-sm"
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      if (e.target.value) setResumeFile(null);
                    }}
                  ></textarea>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={handlePrevStep}>Back</Button>
                <Button 
                  onClick={processResume} 
                  disabled={(!resumeText && !resumeFile) || loading}
                  className="bg-brand-primary hover:bg-brand-primary/90 px-8"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Review & Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold">Ready to Generate Magic?</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                  We'll analyze <span className="text-slate-900 font-bold">{jobData?.title}</span> at <span className="text-slate-900 font-bold">{jobData?.company}</span> and craft a sequence perfectly tailored to your experience.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border text-xs font-bold shadow-sm italic">J</div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Matched Experience</p>
                    <p className="text-sm font-medium">{resumeData?.name} — {resumeData?.skills?.slice(0, 5).join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <Button variant="ghost" className="flex-1" onClick={handlePrevStep}>Back to Resume</Button>
                <Button 
                  onClick={finalizeOutreach} 
                  disabled={loading}
                  className="bg-brand-primary hover:bg-brand-primary/90 flex-1 h-12 text-lg shadow-lg shadow-brand-primary/30"
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  Generate My Outreach
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Analysis Complete!</h2>
                <p className="text-slate-500">Here is how you stack up for the role.</p>
              </div>

              <div className="relative aspect-video max-h-[300px] w-full rounded-3xl overflow-hidden flex items-center justify-center bg-slate-900 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent mix-blend-overlay"></div>
                <div className="relative z-10 text-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-8 border-brand-primary/20 flex items-center justify-center">
                       <span className="text-4xl font-black text-white">{outreachResult?.matchScore}%</span>
                    </div>
                    {(outreachResult?.matchScore || 0) >= 80 && (
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
                        <Trophy className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                     <h3 className="text-white font-bold text-lg">{jobData?.title}</h3>
                     <p className="text-slate-400 text-sm">{jobData?.company}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn(
                  "p-6 rounded-2xl border",
                  (outreachResult?.matchScore || 0) >= 60 
                    ? "bg-green-50 border-green-100" 
                    : "bg-orange-50 border-orange-100"
                )}>
                  <div className="flex items-center gap-3 mb-4">
                    {(outreachResult?.matchScore || 0) >= 60 ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-6 h-6 text-orange-600" />
                    )}
                    <h4 className="font-bold text-slate-900">Match Verdict</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {(outreachResult?.matchScore || 0) >= 80 
                      ? "Excellent match! Your background aligns perfectly with the core requirements. The outreach sequence has been tuned for a high-confidence approach."
                      : (outreachResult?.matchScore || 0) >= 60
                      ? "Good match. You have most of the key skills. We've highlighted your transferable experience to bridge any minor gaps."
                      : "Low match detected. You might need to emphasize specific projects or certifications to stand out for this particular role."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl border bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-slate-400" />
                    <h4 className="font-bold text-slate-900">Target Contact</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recruiter Email</label>
                      <input 
                        type="email"
                        placeholder="recruiter@company.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                        value={jobData?.recruiter_email || ''}
                        onChange={(e) => setJobData({ ...jobData, recruiter_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recruiter Name</label>
                      <input 
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                        value={jobData?.recruiter_name || ''}
                        onChange={(e) => setJobData({ ...jobData, recruiter_name: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {(outreachResult?.improvementSuggestions?.length > 0) && (
                   <div className="p-6 rounded-2xl border bg-blue-50 border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                      <h4 className="font-bold text-slate-900">Quick Fixes</h4>
                    </div>
                    <ul className="space-y-2">
                       {outreachResult.improvementSuggestions.slice(0, 3).map((s: string, i: number) => (
                         <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0"></span>
                           {s}
                         </li>
                       ))}
                    </ul>
                   </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 border-l-4 border-brand-primary pl-3">Review Outreach</h3>
                  <p className="text-xs text-slate-400 font-medium">Click any section to edit</p>
                </div>

                {/* Cold Email */}
                <Card className="border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cold Email & Subject</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setEditingField(editingField?.type === 'cold_email' ? null : { type: 'cold_email' })}>
                      {editingField?.type === 'cold_email' ? <><Save className="w-3 h-3" /> Finish</> : <><Pencil className="w-3 h-3" /> Edit</>}
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    {editingField?.type === 'cold_email' ? (
                      <div className="p-4 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject Line</label>
                          <input 
                            className="w-full p-2 text-sm font-bold border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            value={editableMessages.email_subject || ''}
                            onChange={(e) => updateMessage('email_subject', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Body</label>
                          <textarea
                            className="w-full h-48 p-2 text-sm font-medium focus:outline-none focus:ring-0 resize-none border rounded-lg"
                            value={editableMessages.cold_email}
                            onChange={(e) => updateMessage('cold_email', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-4">
                         <div className="pb-4 border-b border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Subject</p>
                          <p className="text-sm font-bold text-slate-800">{editableMessages.email_subject || `Application: ${jobData?.title}`}</p>
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                          {editableMessages.cold_email}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* LinkedIn DM */}
                <Card className="border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">LinkedIn DM</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setEditingField(editingField?.type === 'linkedin_dm' ? null : { type: 'linkedin_dm' })}>
                      {editingField?.type === 'linkedin_dm' ? <><Save className="w-3 h-3" /> Finish</> : <><Pencil className="w-3 h-3" /> Edit</>}
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    {editingField?.type === 'linkedin_dm' ? (
                      <textarea
                        className="w-full h-24 p-4 text-sm font-medium focus:outline-none focus:ring-0 resize-none"
                        value={editableMessages.linkedin_dm}
                        onChange={(e) => updateMessage('linkedin_dm', e.target.value)}
                      />
                    ) : (
                      <div className="p-4 text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                        {editableMessages.linkedin_dm}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* LinkedIn Connection Request */}
                <Card className="border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">LinkedIn Connection Request</span>
                      <span className="text-[10px] text-slate-400 font-medium">(Short & Personal)</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setEditingField(editingField?.type === 'linkedin_connection_request' ? null : { type: 'linkedin_connection_request' })}>
                      {editingField?.type === 'linkedin_connection_request' ? <><Save className="w-3 h-3" /> Finish</> : <><Pencil className="w-3 h-3" /> Edit</>}
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    {editingField?.type === 'linkedin_connection_request' ? (
                      <div className="p-4 space-y-3">
                        <textarea
                          className="w-full h-24 p-3 text-sm font-medium border rounded-lg focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                          value={editableMessages.linkedin_connection_request || ''}
                          onChange={(e) => updateMessage('linkedin_connection_request', e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] font-bold",
                            (editableMessages.linkedin_connection_request?.length || 0) > 300 ? "text-red-500" : "text-slate-400"
                          )}>
                            {editableMessages.linkedin_connection_request?.length || 0}/300
                          </span>
                          <Button size="sm" className="bg-brand-primary h-8" onClick={() => setEditingField(null)}>
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                        {editableMessages.linkedin_connection_request}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Follow Ups */}
                {editableMessages.follow_ups?.map((msg: string, idx: number) => (
                  <Card key={idx} className="border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Follow-up {idx + 1}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setEditingField(editingField?.type === 'follow_ups' && editingField.index === idx ? null : { type: 'follow_ups', index: idx })}>
                        {editingField?.type === 'follow_ups' && editingField.index === idx ? <><Save className="w-3 h-3" /> Finish</> : <><Pencil className="w-3 h-3" /> Edit</>}
                      </Button>
                    </div>
                    <CardContent className="p-0">
                      {editingField?.type === 'follow_ups' && editingField.index === idx ? (
                        <textarea
                          className="w-full h-32 p-4 text-sm font-medium focus:outline-none focus:ring-0 resize-none"
                          value={msg}
                          onChange={(e) => updateMessage('follow_ups', e.target.value, idx)}
                        />
                      ) : (
                        <div className="p-4 text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                          {msg}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => setStep(3)}
                  disabled={loading}
                >
                  Regenerate
                </Button>
                <Button 
                  className="flex-[2] h-12 bg-brand-primary hover:bg-brand-primary/90 text-lg shadow-lg shadow-brand-primary/20"
                  onClick={saveCampaign}
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Finalize Campaign <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

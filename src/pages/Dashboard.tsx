import React, { useState, useEffect } from 'react';
import { supabase, Outreach } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Search, ExternalLink, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { OnboardingModal } from '@/components/OnboardingModal';
import { AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check onboarding status
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

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
        setLoading(false);
      }
    }

    fetchOutreaches();
  }, []);

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

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      </AnimatePresence>
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-brand-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Active Outreaches</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
              {outreaches.length} Total
            </span>
            Manage and track your personalized campaigns.
          </p>
        </div>
        <Link to="/new">
          <Button className="bg-brand-primary hover:bg-brand-primary/90 gap-2 rounded-lg font-semibold px-4">
            <Plus className="w-4 h-4" />
            New Outreach
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search job title..." 
              className="w-full bg-white border border-brand-border rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
            />
          </div>

          <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400 italic text-sm">
                Gathering outreaches...
              </div>
            ) : outreaches.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No active campaigns.
              </div>
            ) : outreaches.map((outreach) => (
              <Link 
                key={outreach.id} 
                to={`/outreach/${outreach.id}`}
                className={cn(
                  "block p-4 hover:bg-blue-50 transition-colors border-l-4",
                  outreach.status === 'sent' ? "border-blue-600" : "border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm truncate pr-2">{outreach.job_title}</h3>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                    getStatusColor(outreach.status)
                  )}>
                    {outreach.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2 truncate">
                  {outreach.company_name} • {outreach.recruiter_name || 'HR Team'}
                </p>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 border border-slate-100">
                    {new Date(outreach.created_at).toLocaleDateString()}
                  </span>
                  {outreach.resume_data?.matchScore && (
                    <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded text-green-700 font-bold">
                      {outreach.resume_data.matchScore}% Match
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <Card className="glass-card shadow-sm h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-slate-50/50 border-dashed border-2">
             <div className="max-w-sm">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-sm font-medium">Select a campaign to view generation logic and simulate interviews.</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

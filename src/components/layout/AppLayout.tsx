import React, { useEffect, useState } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, UserCircle, Settings, LogOut, Signal, Briefcase, Compass, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const match = useMatch('/outreach/:id');
  const [companyData, setCompanyData] = useState<{name: string, logo?: string} | null>(null);

  useEffect(() => {
    async function fetchCompany() {
      if (!match?.params.id) {
        setCompanyData(null);
        return;
      }
      try {
        const { data } = await supabase
          .from('outreaches')
          .select('company_name, job_data')
          .eq('id', match.params.id)
          .single();
          
        if (data) {
          setCompanyData({
            name: data.company_name,
            logo: data.job_data?.logo || null
          });
          return;
        }
      } catch (err) {
        // ignore error
      }

      // Check local storage fallback
      try {
        const local = localStorage.getItem('demo_outreaches');
        if (local) {
          const parsed = JSON.parse(local);
          const found = parsed.find((o: any) => o.id === match.params.id);
          if (found) {
            setCompanyData({
              name: found.company_name,
              logo: found.job_data?.logo || null
            });
          }
        }
      } catch (err) {
        // ignore
      }
    }
    fetchCompany();
  }, [match?.params.id]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Compass, label: 'InnovationOS', path: '/projects' },
    { icon: PlusCircle, label: 'New Outreach', path: '/new' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isInnovation = location.pathname === '/projects';

  return (
    <div className={cn("flex h-screen", isInnovation ? "bg-[#0a0a0b]" : "bg-slate-50")}>
      {/* Sidebar */}
      <aside className={cn("w-64 border-r flex flex-col shadow-sm transition-all duration-300 z-50", isInnovation ? "bg-[#131417] border-white/5" : "border-brand-border bg-white")}>
        <div className="p-6">
          {companyData ? (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              {companyData.logo ? (
                <img src={companyData.logo} alt={companyData.name} className="w-10 h-10 object-contain rounded-lg border border-slate-100 shadow-sm" />
              ) : (
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-sm font-bold">
                  <Briefcase className="w-5 h-5 text-white/80" />
                </div>
              )}
              <div className="flex flex-col">
                <span className={cn("font-bold text-sm tracking-tight line-clamp-1", isInnovation ? "text-slate-200" : "text-slate-800")}>{companyData.name}</span>
                <span className={cn("text-[10px] font-medium uppercase tracking-widest", isInnovation ? "text-slate-500" : "text-slate-400")}>{isInnovation ? "Core Node" : "Active Outreach"}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-sm", isInnovation ? "bg-brand-primary text-white" : "bg-brand-primary text-white")}>
                {isInnovation ? <Cpu className="w-4 h-4 text-white" /> : "S"}
              </div>
              <span className={cn("font-bold text-xl tracking-tight", isInnovation ? "text-slate-200" : "text-slate-800")}>{isInnovation ? "InnovationOS" : "SignalHire AI"}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 mt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm",
                  isActive
                    ? (isInnovation ? "bg-white/10 text-brand-primary font-bold" : "bg-brand-primary/10 text-brand-primary font-bold")
                    : (isInnovation ? "text-slate-500 hover:bg-white/5 hover:text-slate-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-brand-primary" : (isInnovation ? "text-slate-600 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600")
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={cn("p-4 border-t", isInnovation ? "border-white/5" : "border-brand-border")}>
          <div className={cn("flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors", isInnovation ? "hover:bg-white/5" : "hover:bg-slate-50")}>
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300"></div>
            <div>
              <p className={cn("text-sm font-semibold", isInnovation ? "text-slate-300" : "text-slate-700")}>Sarah Chen</p>
              <p className={cn("text-xs font-medium", isInnovation ? "text-slate-500" : "text-brand-primary")}>Pro Plan Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Header */}
        {!isInnovation && (
          <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {navItems.find(i => i.path === location.pathname)?.label || 'Outreach'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
              </div>
            </div>
          </header>
        )}

        <div className={cn(isInnovation ? "h-full" : "p-8 max-w-6xl mx-auto")}>
          {children}
        </div>
      </main>
    </div>
  );
}

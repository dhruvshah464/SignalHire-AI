import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, UserCircle, Settings, LogOut, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: PlusCircle, label: 'New Outreach', path: '/new' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-border bg-white flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">SignalHire AI</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group",
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                location.pathname === item.path ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300"></div>
            <div>
              <p className="text-sm font-semibold">Sarah Chen</p>
              <p className="text-xs text-slate-500">Pro Plan Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {navItems.find(i => i.path === location.pathname)?.label || 'Outreach'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

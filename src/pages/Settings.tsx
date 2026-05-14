import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  CreditCard, 
  Zap, 
  Mail, 
  Smartphone,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-slate-500">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { icon: Bell, label: 'Notifications', active: true },
            { icon: CreditCard, label: 'Subscription', active: false },
            { icon: Lock, label: 'Privacy & Security', active: false },
            { icon: Mail, label: 'Email Preferences', active: false },
            { icon: Smartphone, label: 'App Settings', active: false },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                item.active 
                  ? 'bg-white shadow-sm border border-brand-border text-brand-primary' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.active ? 'text-brand-primary' : 'text-slate-400'}`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose how you want to be notified about outreach activities.</CardDescription>
                </div>
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: 'New Responses', desc: 'When a recruiter replies to your outreach.', checked: true },
                { title: 'AI Generation Complete', desc: 'When your custom outreach sequences are ready.', checked: true },
                { title: 'Weekly Summary', desc: 'A roundup of your campaign performance.', checked: false },
              ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold tracking-tight">{pref.title}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${pref.checked ? 'bg-brand-primary' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pref.checked ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-brand-primary/20 bg-brand-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-brand-primary fill-brand-primary" />
                <Badge className="bg-brand-primary text-white hover:bg-brand-primary">PRO PLAN</Badge>
              </div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>You are currently on the Pro Annual plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-brand-primary/10 shadow-sm">
                <div>
                  <p className="text-sm font-bold">$29.00 / month</p>
                  <p className="text-xs text-slate-500 italic">Next billing date: June 14, 2026</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs font-bold border-brand-primary text-brand-primary hover:bg-brand-primary/5">
                  Manage Billing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

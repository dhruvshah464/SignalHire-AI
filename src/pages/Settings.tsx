import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Privacy & Security');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState([
    { title: 'New Responses', desc: 'When a recruiter replies to your outreach.', checked: true },
    { title: 'AI Generation Complete', desc: 'When your custom outreach sequences are ready.', checked: true },
    { title: 'Weekly Summary', desc: 'A roundup of your campaign performance.', checked: false },
  ]);

  const handleToggle2FA = () => {
    const newState = !is2FAEnabled;
    setIs2FAEnabled(newState);
    if (newState) {
      toast.success('Two-factor authentication enabled', {
        description: 'Your account is now secured with 2FA.',
      });
    } else {
      toast.warning('Two-factor authentication disabled', {
        description: 'Your account security has been reduced.',
      });
    }
  };

  const toggleNotification = (index: number) => {
    const newSettings = [...notificationSettings];
    newSettings[index].checked = !newSettings[index].checked;
    setNotificationSettings(newSettings);
    toast.success('Notification preference updated');
  };

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
            { icon: Bell, label: 'Notifications' },
            { icon: CreditCard, label: 'Subscription' },
            { icon: Lock, label: 'Privacy & Security' },
            { icon: Mail, label: 'Email Preferences' },
            { icon: Smartphone, label: 'App Settings' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                activeTab === item.label 
                  ? 'bg-white shadow-sm border border-brand-border text-brand-primary' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${activeTab === item.label ? 'text-brand-primary' : 'text-slate-400'}`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'Notifications' && (
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
                {notificationSettings.map((pref, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold tracking-tight">{pref.title}</p>
                      <p className="text-xs text-slate-500">{pref.desc}</p>
                    </div>
                    <div 
                      onClick={() => toggleNotification(idx)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${pref.checked ? 'bg-brand-primary' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pref.checked ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'Subscription' && (
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
          )}

          {activeTab === 'Privacy & Security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account.</CardDescription>
                    </div>
                    {is2FAEnabled ? (
                      <ShieldCheck className="w-8 h-8 text-green-500" />
                    ) : (
                      <ShieldAlert className="w-8 h-8 text-amber-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`p-4 rounded-xl border ${is2FAEnabled ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className="flex gap-3">
                      <div className={`mt-0.5 ${is2FAEnabled ? 'text-green-600' : 'text-amber-600'}`}>
                        {is2FAEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${is2FAEnabled ? 'text-green-900' : 'text-amber-900'}`}>
                          {is2FAEnabled ? '2FA is active' : '2FA is not enabled'}
                        </h4>
                        <p className={`text-sm mt-1 ${is2FAEnabled ? 'text-green-700' : 'text-amber-700'}`}>
                          {is2FAEnabled 
                            ? 'Your account is currently protected by two-factor authentication. You will be required to enter a security code when logging in from new devices.' 
                            : 'Enable two-factor authentication to protect your account from unauthorized access even if your password is stolen.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!is2FAEnabled && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-800">How it works:</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                        <li>Toggle the switch below to turn on 2FA.</li>
                        <li>You will be prompted to scan a QR code using an authenticator app (like Google Authenticator or Authy).</li>
                        <li>Enter the 6-digit code from your app to verify setup.</li>
                      </ol>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">Authenticator App</p>
                      <p className="text-xs text-slate-500">Use time-based one-time passwords (TOTP)</p>
                    </div>
                    <div 
                      onClick={handleToggle2FA}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${is2FAEnabled ? 'bg-brand-primary' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${is2FAEnabled ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Privacy</CardTitle>
                  <CardDescription>Manage how we use your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold tracking-tight">Allow AI Training</p>
                      <p className="text-xs text-slate-500">Allow your anonymized outreach data to improve our AI models.</p>
                    </div>
                    <div className="w-12 h-6 rounded-full relative cursor-pointer bg-slate-200">
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all left-1 shadow-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['Email Preferences', 'App Settings'].includes(activeTab) && (
            <Card>
              <CardHeader>
                <CardTitle>{activeTab}</CardTitle>
                <CardDescription>Settings for {activeTab.toLowerCase()} will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">This section is currently under construction.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

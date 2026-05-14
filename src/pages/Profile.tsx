import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Zap, Globe, Github, Linkedin } from 'lucide-react';

export default function Profile() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Avatar & Basic Info */}
        <Card className="w-full md:w-80 shrink-0">
          <CardContent className="pt-8 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-primary to-blue-600 p-1 mb-4 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-4 border-white overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold">Sarah Chen</h2>
            <p className="text-sm text-slate-500 mb-4">Senior UX Designer</p>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              <Zap className="w-3 h-3 mr-1 fill-blue-700" /> Pro Plan
            </Badge>

            <div className="w-full mt-8 space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <span className="text-xs">LinkedIn Connected</span>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 text-slate-400 border-dashed">
                <Github className="w-4 h-4" />
                <span className="text-xs">Connect GitHub</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Details */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-500 cursor-not-allowed">
                    <User className="w-4 h-4" />
                    <span>Sarah Chen</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-500 cursor-not-allowed">
                    <Mail className="w-4 h-4" />
                    <span>sarah.chen@example.com</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Location</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-500 cursor-not-allowed">
                    <Globe className="w-4 h-4" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-400">Security Status</label>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100 text-green-700 font-medium">
                    <Shield className="w-4 h-4" />
                    <span>Two-Factor Auth Enabled</span>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button className="bg-brand-primary hover:bg-brand-primary/90">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Your engagement across SignalHire AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-slate-900">42</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outreaches</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-slate-900">89%</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Score</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-slate-900">12</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

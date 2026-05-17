import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Activity, 
  Users, 
  Rocket, 
  Target, 
  Zap, 
  BrainCircuit, 
  TrendingUp,
  Cpu,
  Trophy,
  ArrowRight,
  Globe,
  Radar,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

// --- MOCK DATA ---

const MOCK_PODS = [
  {
    id: '1',
    name: 'Nexus API',
    tagline: 'Universal API for AI Agents',
    stage: 'Prototype',
    readinessScore: 92,
    teamSize: 4,
    tags: ['AI', 'DevTools', 'Infrastructure'],
    color: 'from-blue-500 to-cyan-400',
    chartData: Array.from({ length: 20 }, () => ({ value: Math.floor(Math.random() * 100) + 20 }))
  },
  {
    id: '2',
    name: 'Aether OS',
    tagline: 'Spatial Computing Operating System',
    stage: 'Validation',
    readinessScore: 78,
    teamSize: 2,
    tags: ['AR/VR', 'OS', 'Hardware'],
    color: 'from-purple-500 to-pink-500',
    chartData: Array.from({ length: 20 }, () => ({ value: Math.floor(Math.random() * 80) + 10 }))
  },
  {
    id: '3',
    name: 'Synthetix Bio',
    tagline: 'AI-driven protein folding for longevity',
    stage: 'MVP',
    readinessScore: 88,
    teamSize: 6,
    tags: ['Biotech', 'Health', 'AI'],
    color: 'from-emerald-400 to-teal-500',
    chartData: Array.from({ length: 20 }, () => ({ value: Math.floor(Math.random() * 120) + 50 }))
  },
  {
    id: '4',
    name: 'Vortex Finance',
    tagline: 'Decentralized startup liquidity pool',
    stage: 'Idea',
    readinessScore: 64,
    teamSize: 1,
    tags: ['DeFi', 'Fintech', 'Web3'],
    color: 'from-orange-400 to-amber-500',
    chartData: Array.from({ length: 20 }, () => ({ value: Math.floor(Math.random() * 50) + 10 }))
  }
];

const METRICS = [
  { label: 'Active Pods', value: '1,248', icon: Rocket, trend: '+12%' },
  { label: 'Global Innovation Index', value: '94.2', icon: Activity, trend: '+3.4%' },
  { label: 'AI Ventures Founded', value: '342', icon: BrainCircuit, trend: '+28%' },
  { label: 'Capital Deployed', value: '$14.2M', icon: Radar, trend: '+15%' }
];

export default function ProjectsFeed() {
  const [activeTab, setActiveTab] = useState<'discover' | 'founder-dna' | 'market' | 'ai-architect'>('discover');
  const [activePodId, setActivePodId] = useState<string | null>(null);

  const activePod = MOCK_PODS.find(p => p.id === activePodId);

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0b] text-slate-200 p-8 relative flex flex-col font-sans">
      {/* Background Grid & Ambient Gradients */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      {activePod ? (
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -30 }}
           className="relative z-10 flex flex-col h-full space-y-6"
         >
           <div className="flex items-center justify-between">
             <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setActivePodId(null)}>
               <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Discover
             </Button>
             <div className="flex gap-2">
               <Button className="bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                 Join Team
               </Button>
               <Button variant="outline" className="text-white border-white/10 hover:bg-white/5 disabled:opacity-50">
                 Enter War Room
               </Button>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#131417]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                   <div className={cn("absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-20", activePod.color)} />
                   
                   <Badge variant="outline" className="bg-white/5 border-white/10 text-white shadow-sm mb-4">
                     {activePod.stage} Stage
                   </Badge>
                   <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{activePod.name}</h1>
                   <p className="text-lg text-slate-400 mb-8">{activePod.tagline}</p>

                   <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                     <div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AI Readiness</p>
                       <p className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                         <Activity className="w-5 h-5"/> {activePod.readinessScore}/100
                       </p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Est. Funding Prob.</p>
                       <p className="text-2xl font-black text-white">74%</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Time to MVP</p>
                       <p className="text-2xl font-black text-brand-primary">4 Wks</p>
                     </div>
                   </div>
                </div>

                <div className="bg-[#131417]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">AI Execution Roadmap</h3>
                  <div className="space-y-4">
                    {[
                      { status: 'completed', task: 'Market Opportunity Sizing', time: 'Completed' },
                      { status: 'completed', task: 'Competitor Analysis Matrix', time: 'Completed' },
                      { status: 'in-progress', task: 'Core Infrastructure Architecture', time: 'In Progress' },
                      { status: 'pending', task: 'Beta Launch Campaign', time: 'Next' }
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                          step.status === 'completed' ? "bg-emerald-400/20 text-emerald-400" :
                          step.status === 'in-progress' ? "bg-brand-primary/20 text-brand-primary" :
                          "bg-slate-800 text-slate-500"
                        )}>
                          ✓
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-200">{step.task}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase">{step.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-brand-primary/10 to-transparent border border-brand-primary/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <Cpu className="w-16 h-16 text-brand-primary" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-brand-primary mb-1">AI Autopilot Active</h3>
                      <p className="text-sm text-slate-400 mb-6">Orchestrating 3 parallel workflows</p>
                      
                      <div className="space-y-3">
                        <div className="flex bg-black/20 p-2 rounded-lg items-center gap-3 border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs text-slate-300">Drafting PRD for MVP</span>
                        </div>
                        <div className="flex bg-black/20 p-2 rounded-lg items-center gap-3 border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                          <span className="text-xs text-slate-300">Sourcing Full Stack Eng profiles</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#131417]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">AI Employees</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'AI CTO', desc: 'Architecture & Code', active: true },
                        { title: 'AI Growth Lead', desc: 'GTM Strategy', active: true },
                        { title: 'AI Analyst', desc: 'Market Research', active: false }
                      ].map((agent, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 border-transparent hover:border-white/10 transition-colors">
                           <div>
                             <p className="font-bold text-white text-sm flex items-center gap-2">
                               {agent.title} {agent.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                             </p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-wider">{agent.desc}</p>
                           </div>
                           <Button variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                             <Settings className="w-3 h-3" />
                           </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#131417]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-slate-500">Live Team ({activePod.teamSize})</h3>
                  <div className="space-y-3">
                    {Array.from({ length: activePod.teamSize }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <img src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-8 h-8 rounded-full bg-slate-800" alt="Avatar"/>
                           <div>
                             <p className="text-sm font-bold text-white">Contributor {i+1}</p>
                             <p className="text-[10px] text-slate-400">Full Stack / AI</p>
                           </div>
                        </div>
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#131417]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                   <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-slate-500">Momentum Velocity</h3>
                   <div className="h-40 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={activePod.chartData}>
                           <defs>
                             <linearGradient id={`grad-detail-${activePod.id}`} x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill={`url(#grad-detail-${activePod.id})`} />
                         </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </div>
              </div>
           </div>
         </motion.div>
      ) : (
      <>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              InnovationOS
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            The global operating system for startup ecosystem and talent collaboration.
          </p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-xl backdrop-blur-md">
          {[
            { id: 'discover', label: 'Global Pods' },
            { id: 'founder-dna', label: 'Founder DNA' },
            { id: 'market', label: 'Innovation Index' },
            { id: 'ai-architect', label: 'AI Architect' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300",
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 relative z-10"
      >
        {METRICS.map((metric, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <metric.icon className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                {metric.trend}
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-white tracking-tight">{metric.value}</h4>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{metric.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'discover' && (
          <motion.div
            key="discover"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 relative z-10"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-primary" /> Active Innovation Pods
              </h2>
              <Button className="bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20">
                <Sparkles className="w-4 h-4 mr-2" /> Initialize Pod
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {MOCK_PODS.map((pod, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={pod.id} 
                  onClick={() => setActivePodId(pod.id)}
                  className="group relative bg-[#131417] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500 cursor-pointer"
                >
                   {/* Cinematic Top Glow */}
                   <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity", pod.color)} />
                   
                   <div className="p-6">
                     <div className="flex justify-between items-start mb-6">
                       <div>
                         <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">{pod.name}</h3>
                         <p className="text-sm text-slate-400">{pod.tagline}</p>
                       </div>
                       <Badge variant="outline" className="bg-white/5 border-white/10 text-white shadow-sm">
                         {pod.stage}
                       </Badge>
                     </div>

                     <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
                          <div className="flex items-center gap-1.5 text-lg font-black text-white">
                            <Activity className="w-4 h-4 text-brand-primary" /> {pod.readinessScore}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Team</span>
                          <div className="flex items-center gap-1.5 text-lg font-black text-white">
                            <Users className="w-4 h-4 text-purple-400" /> {pod.teamSize}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden">
                           <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 z-10">Momentum</span>
                           <div className="absolute inset-0 top-6 opacity-40">
                             <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={pod.chartData}>
                                 <defs>
                                   <linearGradient id={`grad-${pod.id}`} x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                   </linearGradient>
                                 </defs>
                                 <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill={`url(#grad-${pod.id})`} />
                               </AreaChart>
                             </ResponsiveContainer>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                       <div className="flex gap-2">
                         {pod.tags.map(tag => (
                           <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/10">
                             {tag}
                           </span>
                         ))}
                       </div>
                       <Button variant="ghost" className="text-slate-400 hover:text-white group-hover:bg-white/5 group-hover:translate-x-1 transition-all h-8 px-3">
                         View Pod <ArrowRight className="w-4 h-4 ml-2" />
                       </Button>
                     </div>
                   </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-white/10">
              <h2 className="text-xl font-bold text-white mb-6">Live Ecosystem Feed</h2>
              <div className="max-w-3xl space-y-6">
                {[
                  { user: 'Sarah Chen', action: 'shipped feature', project: 'Nexus API', time: '12m ago', upvotes: 24, replies: 3, img: 'https://i.pravatar.cc/150?img=1' },
                  { user: 'Mike Johnson', action: 'joined as Full Stack', project: 'Vortex Finance', time: '1h ago', upvotes: 45, replies: 12, img: 'https://i.pravatar.cc/150?img=11' },
                  { user: 'Elena Rodriguez', action: 'earned badge', event: 'Top 1% Innovator', time: '3h ago', upvotes: 112, replies: 28, img: 'https://i.pravatar.cc/150?img=5' }
                ].map((update, i) => (
                   <div key={i} className="flex gap-4 p-5 bg-[#131417]/80 backdrop-blur-sm border border-white/5 rounded-2xl">
                      <img src={update.img} alt={update.user} className="w-12 h-12 rounded-full border border-white/20 shadow-md" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-300 mb-1">
                          <strong className="text-white">{update.user}</strong> {update.action} 
                          {update.project ? <strong className="text-brand-primary"> {update.project}</strong> : <strong className="text-emerald-400"> {update.event}</strong>}
                        </p>
                        <p className="text-xs text-slate-500 mb-4">{update.time}</p>
                        
                        <div className="flex items-center gap-4 text-slate-400">
                          <button className="flex items-center gap-1.5 text-xs font-bold hover:text-brand-primary transition-colors">
                            <Rocket className="w-4 h-4" /> {update.upvotes}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-bold hover:text-white transition-colors">
                             <Users className="w-4 h-4" /> {update.replies} Replies
                          </button>
                        </div>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'founder-dna' && (
          <motion.div
            key="founder-dna"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 relative z-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
               <div className="lg:col-span-1 bg-[#131417]/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <img src="https://i.pravatar.cc/150?u=me" alt="Me" className="w-16 h-16 rounded-full border-2 border-white/20" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Alex Developer</h3>
                      <p className="text-sm text-brand-primary font-medium">Technical Architect</p>
                    </div>
                  </div>
                  <div className="space-y-4 relative z-10 mb-6">
                    <div className="flex justify-between items-center bg-white/5 rounded-lg p-3 border border-white/5">
                      <span className="text-sm text-slate-400 font-medium">Execution Consistency</span>
                      <span className="text-lg font-black text-white">98th %</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 rounded-lg p-3 border border-white/5">
                      <span className="text-sm text-slate-400 font-medium">Collab Quality</span>
                      <span className="text-lg font-black text-emerald-400">9.4/10</span>
                    </div>
                  </div>
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20">
                    View Neural Profile
                  </Button>
               </div>

               <div className="lg:col-span-2 bg-[#131417]/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-primary" /> Recommended Co-founders
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Sarah Chen', type: 'Product Strategist', match: '96%', gap: 'Fills GTM Gap', img: 'https://i.pravatar.cc/150?img=1' },
                      { name: 'Mike Johnson', type: 'Operational Executor', match: '92%', gap: 'Fills Ops Gap', img: 'https://i.pravatar.cc/150?img=11' }
                    ].map((user, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <img src={user.img} className="w-10 h-10 rounded-full" alt="founder" />
                          <div>
                            <p className="font-bold text-white mb-0.5">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-400">{user.match} Match</p>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{user.gap}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4 mt-12 flex items-center gap-2">
               <Cpu className="w-5 h-5 text-purple-400" /> Founder DNA Archetypes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[
                 { title: 'Visionary', desc: 'Identifies macro trends and shapes the 10-year thesis.', color: 'text-yellow-400' },
                 { title: 'Systems Builder', desc: 'Creates scalable architectures and tech infra.', color: 'text-blue-400' },
                 { title: 'Growth Hacker', desc: 'Finds unconventional distribution channels.', color: 'text-emerald-400' },
                 { title: 'UX Architect', desc: 'Obsesses over product feel and user psychology.', color: 'text-pink-400' }
               ].map((arch, i) => (
                 <div key={i} className="bg-[#131417] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all cursor-pointer group">
                   <h4 className={cn("text-lg font-black mb-2 group-hover:scale-105 transition-transform origin-left", arch.color)}>{arch.title}</h4>
                   <p className="text-sm text-slate-400">{arch.desc}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 relative z-10"
          >
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-emerald-400" /> Innovation Stock Market
               </h2>
               <div className="flex gap-2">
                 <Badge variant="outline" className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20">Market Open</Badge>
                 <Badge variant="outline" className="bg-white/5 text-slate-300 border-white/10">Global Index: 14,291 ▲</Badge>
               </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
               {/* Leaderboard or hot stocks */}
               <div className="lg:col-span-3 bg-[#131417]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Trending Ventures</h3>
                 <div className="space-y-2">
                   <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-2 border-b border-white/5">
                     <div className="col-span-4">Venture</div>
                     <div className="col-span-2 text-right">Momentum</div>
                     <div className="col-span-2 text-right">Backers</div>
                     <div className="col-span-2 text-right">Execution</div>
                     <div className="col-span-2 text-right">Price Action</div>
                   </div>
                   {[
                     { name: 'Quantum AI Agents', ticker: '$QAA', momentum: '98.4', backers: '1.2k', exec: 'A+', trend: '+14.2%', up: true },
                     { name: 'Vortex Finance', ticker: '$VRX', momentum: '84.2', backers: '420', exec: 'B+', trend: '+4.1%', up: true },
                     { name: 'Synthetix Bio', ticker: '$SYN', momentum: '92.1', backers: '891', exec: 'S', trend: '+22.5%', up: true },
                     { name: 'Aether OS', ticker: '$ATH', momentum: '41.5', backers: '112', exec: 'C-', trend: '-8.4%', up: false },
                     { name: 'Nexus API', ticker: '$NEX', momentum: '76.8', backers: '2.1k', exec: 'A', trend: '+2.1%', up: true },
                   ].map((stock, i) => (
                     <div key={i} className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/10">
                        <div className="col-span-4">
                          <p className="font-bold text-white leading-tight">{stock.name}</p>
                          <p className="text-xs text-brand-primary font-mono">{stock.ticker}</p>
                        </div>
                        <div className="col-span-2 text-right font-mono text-white font-bold">{stock.momentum}</div>
                        <div className="col-span-2 text-right font-mono text-slate-400">{stock.backers}</div>
                        <div className="col-span-2 text-right">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-bold", stock.exec.includes('S') || stock.exec.includes('A') ? "bg-emerald-400/20 text-emerald-400" : stock.exec.includes('B') ? "bg-blue-400/20 text-blue-400" : "bg-red-400/20 text-red-400")}>{stock.exec}</span>
                        </div>
                        <div className={cn("col-span-2 text-right font-mono font-bold flex justify-end items-center gap-1", stock.up ? "text-emerald-400" : "text-red-400")}>
                          {stock.trend} {stock.up ? '▲' : '▼'}
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* My Portfolio / Reputation */}
               <div className="space-y-6">
                 <div className="bg-[#131417]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">My Ecosystem Rep</h3>
                   <div className="text-4xl font-black text-white mb-1"><span className="text-brand-primary">◈</span> 428.5k</div>
                   <p className="text-xs text-emerald-400 font-bold mb-6">+12.4k this week</p>
                   <Button className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20">
                     Back New Venture
                   </Button>
                 </div>

                 <div className="bg-[#131417]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Top Predictors</h3>
                   <div className="space-y-4">
                     {[
                        { name: 'Elena R.', accuracy: '94%', rank: 1 },
                        { name: 'Dr. Zhang', accuracy: '89%', rank: 2 },
                        { name: 'Marcus T.', accuracy: '86%', rank: 3 }
                     ].map((user, i) => (
                       <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <span className="text-xs font-bold text-slate-600">#{user.rank}</span>
                           <p className="text-sm font-bold text-white">{user.name}</p>
                         </div>
                         <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">{user.accuracy} hit rate</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'ai-architect' && (
          <motion.div
            key="ai-architect"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="border border-white/10 rounded-2xl bg-[#131417]/80 backdrop-blur-xl relative z-10 flex flex-col items-center justify-center p-12 text-center my-6 h-[80vh]"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="w-24 h-24 bg-brand-primary/20 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping" />
              <BrainCircuit className="w-12 h-12 text-brand-primary" />
            </div>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Venture Architect AI</h2>
            <p className="text-slate-400 max-w-xl mb-12 text-lg">
              Describe a problem or market thesis. Our intelligence engine will synthesize a complete startup blueprint, identify required tech stacks, and match you with available co-founders.
            </p>

            <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row gap-2 relative z-10 box-shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <input 
                type="text" 
                placeholder="e.g. A marketplace for unused compute power..."
                className="flex-1 bg-transparent border-none text-white px-6 focus:ring-0 focus:outline-none placeholder:text-slate-600 text-lg py-4"
              />
              <Button size="lg" className="bg-brand-primary text-white font-bold px-8 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform h-auto py-4 rounded-xl">
                <Sparkles className="w-5 h-5 mr-3" /> Synthesize
              </Button>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-3 relative z-10">
              {["Decentralized AI", "Longevity Tech", "Creator Economy", "Space Logistics"].map(topic => (
                <button key={topic} className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 hover:border-brand-primary/30 hover:scale-105 transition-all">
                  {topic}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}


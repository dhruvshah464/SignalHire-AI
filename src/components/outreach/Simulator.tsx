import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, Loader2, RefreshCw, Activity } from 'lucide-react';
import { simulateRecruiterChat, evaluateSimulatorResponse } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'model' | 'coach';
  text: string;
  evaluation?: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

export default function Simulator({ jobData }: { jobData: any }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi there! I'm the recruiter for the ${jobData?.title} role. Thanks for your interest. To start, could you tell me why you're interested in joining us?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scoringIndex, setScoringIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Create history without 'coach' messages for the recruiter simulation
      const historyForSim = newMessages.filter(m => m.role !== 'coach').map(m => ({
        role: m.role as 'user' | 'model',
        text: m.text
      }));
      const response = await simulateRecruiterChat(historyForSim, jobData);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get a response from the AI recruiter.');
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async (index: number) => {
    setScoringIndex(index);
    try {
      // Get the history up to this message
      const historyToScore = messages.slice(0, index + 1).filter(m => m.role !== 'coach').map(m => ({
        role: m.role as 'user' | 'model',
        text: m.text
      }));
      
      const evaluation = await evaluateSimulatorResponse(historyToScore, jobData);
      
      const newMessages = [...messages];
      newMessages[index] = {
        ...newMessages[index],
        evaluation
      };
      setMessages(newMessages);
      toast.success('Reply scored successfully!');
    } catch (error) {
      console.error('Scoring error:', error);
      toast.error('Failed to score this reply.');
    } finally {
      setScoringIndex(null);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-slate-900 rounded-xl shadow-lg border-none overflow-hidden">
      <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">Recruiter AI Simulation</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-400">Role: Critical Tech Recruiter</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white" onClick={() => setMessages([{ role: 'model', text: "Let's start over. Tell me a bit about your experience." }])}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex flex-col gap-1",
              m.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "flex gap-3 max-w-[80%]",
                m.role === 'user' ? "flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0",
                  m.role === 'model' ? "bg-slate-700 text-white" : "bg-brand-primary text-white"
                )}>
                  {m.role === 'model' ? 'AI' : 'ME'}
                </div>
                <div className={cn(
                  "rounded-2xl p-3 text-sm leading-relaxed relative group",
                  m.role === 'model' 
                    ? "bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none" 
                    : "bg-brand-primary text-white shadow-md rounded-tr-none"
                )}>
                  {m.text}
                  {m.role === 'user' && !m.evaluation && (
                    <Button 
                      onClick={() => handleScore(i)}
                      disabled={scoringIndex === i}
                      size="sm"
                      variant="secondary"
                      className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-[10px] uppercase font-bold"
                    >
                      {scoringIndex === i ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Score'}
                    </Button>
                  )}
                </div>
              </div>
              
              {m.evaluation && (
                <div className="max-w-[80%] bg-slate-800/80 border border-brand-primary/30 rounded-xl p-4 mt-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-brand-primary" />
                    <span className="font-bold text-white">Reply Score: {m.evaluation.score}/100</span>
                  </div>
                  <p className="mb-3 text-slate-400 text-xs">{m.evaluation.feedback}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-green-400 mb-1 block">Strengths</span>
                      <ul className="text-xs list-disc list-inside space-y-1 text-slate-300">
                        {m.evaluation.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-red-400 mb-1 block">To Improve</span>
                      <ul className="text-xs list-disc list-inside space-y-1 text-slate-300">
                        {m.evaluation.improvements.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-[10px] italic ml-11">
              <Loader2 className="w-3 h-3 animate-spin" />
              AI Recruiter is thinking...
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-800 border-t border-slate-700">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              placeholder="Practice your reply..." 
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-primary transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" disabled={loading || !input.trim()} className="bg-brand-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase">
              Send
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}

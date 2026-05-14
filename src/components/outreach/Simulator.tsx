import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, Loader2, RefreshCw } from 'lucide-react';
import { simulateRecruiterChat } from '@/lib/gemini';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Simulator({ jobData }: { jobData: any }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi there! I'm the recruiter for the ${jobData?.title} role. Thanks for your interest. To start, could you tell me why you're interested in joining us?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      const response = await simulateRecruiterChat(newMessages, jobData);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
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
              "flex gap-3",
              m.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0",
                m.role === 'model' ? "bg-slate-700 text-white" : "bg-brand-primary text-white"
              )}>
                {m.role === 'model' ? 'AI' : 'ME'}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed",
                m.role === 'model' 
                  ? "bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none" 
                  : "bg-brand-primary text-white shadow-md rounded-tr-none"
              )}>
                {m.text}
              </div>
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
            <Button type="submit" disabled={loading} className="bg-brand-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase">
              Score
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}

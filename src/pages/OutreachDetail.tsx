import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Outreach } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, ExternalLink, Mail, MessageSquare, Clock, CheckCircle, Copy, Share2, MoreVertical, Save, Loader2, Pencil } from 'lucide-react';
import Simulator from '@/components/outreach/Simulator';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { toast } from 'sonner';

const emailSchema = z.string().email("Please enter a valid email address");

export default function OutreachDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outreach, setOutreach] = useState<Outreach | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [suggestedEmails, setSuggestedEmails] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    async function fetchOutreach() {
      try {
        const { data, error } = await supabase
          .from('outreaches')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          // Check local storage for fallback
          const localString = localStorage.getItem('demo_outreaches');
          if (localString) {
            const localOutreaches = JSON.parse(localString);
            const found = localOutreaches.find((o: any) => o.id === id);
            if (found) {
              setOutreach(found);
              // Set local mock suggestions
              const emails = Array.from(new Set(localOutreaches.map((o: any) => o.recruiter_email).filter(Boolean)));
              setSuggestedEmails(emails as string[]);
              setLoading(false);
              return;
            }
          }
          throw error;
        }
        setOutreach(data);
        
        // Fetch previous recruiter emails for autocomplete
        const { data: allOutreaches } = await supabase
          .from('outreaches')
          .select('recruiter_email')
          .not('recruiter_email', 'is', null);
          
        if (allOutreaches) {
          const uniqueEmails = Array.from(new Set(allOutreaches.map(o => o.recruiter_email).filter(Boolean)));
          setSuggestedEmails(uniqueEmails as string[]);
        }
      } catch (error) {
        console.error('Error fetching outreach:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOutreach();
  }, [id]);

  useEffect(() => {
    if (outreach) {
      setNotes(outreach.notes || '');
    }
  }, [outreach]);

  const handleSaveNotes = async () => {
    if (!outreach || !id) return;
    setIsSavingNotes(true);
    try {
      setOutreach(prev => prev ? { ...prev, notes } : null);

      const { error } = await supabase
        .from('outreaches')
        .update({ notes })
        .eq('id', id);
        
      if (error) {
        // Update local storage if it was a demo item
        const localString = localStorage.getItem('demo_outreaches');
        if (localString) {
          const localOutreaches = JSON.parse(localString);
          const index = localOutreaches.findIndex((o: any) => o.id === id);
          if (index !== -1) {
            localOutreaches[index] = { ...localOutreaches[index], notes };
            localStorage.setItem('demo_outreaches', JSON.stringify(localOutreaches));
          }
        }
      }
      toast.success('Notes saved successfully');
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // A/B Testing State
  const [activeVariantId, setActiveVariantId] = useState<string>('A');
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const getVariants = () => {
    if (!outreach) return [];
    if (outreach.messages.email_variants && outreach.messages.email_variants.length > 0) {
      return outreach.messages.email_variants;
    }
    // Default fallback variant
    return [{
      id: 'A',
      subject: outreach.messages.email_subject || `Application: ${outreach.job_title} at ${outreach.company_name}`,
      body: outreach.messages.cold_email || '',
      sent_count: outreach.status === 'sent' || outreach.status === 'replied' || outreach.status === 'closed' ? 1 : 0,
      reply_count: outreach.status === 'replied' ? 1 : 0
    }];
  };

  const updateStatus = async (status: string) => {
    try {
      const updates: Partial<Outreach> = { status: status as any };
      
      // Initialize scheduling when moving to 'sent'
      if (status === 'sent' && !outreach.next_follow_up_at) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 3); // First follow-up in 3 days
        updates.next_follow_up_at = nextDate.toISOString();
        updates.last_follow_up_index = -1;
      }
      
      let finalMessages = outreach.messages;

      // Update reply metric if replied
      if (status === 'replied') {
        const currentVariants = getVariants();
        const vIndex = currentVariants.findIndex(v => v.id === activeVariantId);
        if (vIndex !== -1 && currentVariants[vIndex].reply_count === 0) { // Only increment once per reply update
          currentVariants[vIndex].reply_count += 1;
          finalMessages = { ...outreach.messages, email_variants: currentVariants };
          updates.messages = finalMessages as any;
        }
      }

      // Local update first for immediate response
      setOutreach(prev => prev ? { ...prev, ...updates, messages: finalMessages } : null);

      const { error } = await supabase
        .from('outreaches')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        // Update local storage if it was a demo item
        const localString = localStorage.getItem('demo_outreaches');
        if (localString) {
          const localOutreaches = JSON.parse(localString);
          const index = localOutreaches.findIndex((o: any) => o.id === id);
          if (index !== -1) {
            localOutreaches[index] = { ...localOutreaches[index], ...updates };
            localStorage.setItem('demo_outreaches', JSON.stringify(localOutreaches));
          }
        }
      }
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const [showEmailInput, setShowEmailInput] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // A/B testing variables
  const variants = getVariants();
  const activeVariant = variants.find(v => v.id === activeVariantId) || variants[0];

  const handleCreateVariant = async () => {
    if (!outreach || !id) return;
    const currentVariants = getVariants();
    if (currentVariants.length >= 2) return; // Only allow A and B for now

    const newVariant = {
      id: 'B',
      subject: currentVariants[0].subject,
      body: currentVariants[0].body,
      sent_count: 0,
      reply_count: 0
    };

    const newVariants = [...currentVariants, newVariant];
    const newMessages = { ...outreach.messages, email_variants: newVariants };

    setOutreach({ ...outreach, messages: newMessages });
    setActiveVariantId('B');
    setIsEditingVariant(true);
    setEditSubject(newVariant.subject);
    setEditBody(newVariant.body);

    await supabase.from('outreaches').update({ messages: newMessages }).eq('id', id);
  };

  const handleSaveVariant = async () => {
    if (!outreach || !id || !activeVariant) return;
    const currentVariants = getVariants();
    const index = currentVariants.findIndex(v => v.id === activeVariant.id);
    if (index === -1) return;

    currentVariants[index] = { ...activeVariant, subject: editSubject, body: editBody };
    const newMessages = { ...outreach.messages, email_variants: currentVariants };

    // Also update root cold_email if we are saving variant A so it doesn't break other things
    if (activeVariant.id === 'A') {
      newMessages.email_subject = editSubject;
      newMessages.cold_email = editBody;
    }

    setOutreach({ ...outreach, messages: newMessages });
    setIsEditingVariant(false);

    await supabase.from('outreaches').update({ messages: newMessages }).eq('id', id);
    toast.success('Variant saved');
  };

  const handleCancelEdit = () => {
    setIsEditingVariant(false);
  };

  const handleSendEmail = async () => {
    if (!outreach) return;
    setValidationError(null);
    
    const emailToValidate = tempEmail || outreach.recruiter_email || '';

    // If we don't have an email, we should probably ask for it first
    if (!emailToValidate && !showEmailInput) {
      setShowEmailInput(true);
      return;
    }

    // Validate email if provided
    if (emailToValidate) {
      const result = emailSchema.safeParse(emailToValidate);
      if (!result.success) {
        setValidationError(result.error.issues[0].message);
        setShowEmailInput(true);
        return;
      }
    } else if (showEmailInput) {
      // If we are showing the input but it's empty
      setValidationError("Email is required to send via Gmail");
      return;
    }

    const subject = activeVariant.subject;
    const body = activeVariant.body;
    const to = tempEmail || outreach.recruiter_email || '';
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(gmailUrl, '_blank');
    
    // Update metric
    const currentVariants = getVariants();
    const vIndex = currentVariants.findIndex(v => v.id === activeVariant.id);
    if (vIndex !== -1) {
      currentVariants[vIndex].sent_count += 1;
      const newMessages = { ...outreach.messages, email_variants: currentVariants };
      setOutreach({ ...outreach, messages: newMessages });
      await supabase.from('outreaches').update({ messages: newMessages }).eq('id', id!);
    }

    // Update status to sent tracking
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    await updateStatus('sent');
    setSending(false);
    setShowEmailInput(false);
  };

  const saveRecruiterEmail = async () => {
    if (!id) return;
    setValidationError(null);

    if (!tempEmail) {
      setValidationError("Email is required");
      return;
    }

    const result = emailSchema.safeParse(tempEmail);
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }

    try {
      const { error } = await supabase
        .from('outreaches')
        .update({ recruiter_email: tempEmail })
        .eq('id', id);
      
      if (!error) {
        setOutreach(prev => prev ? { ...prev, recruiter_email: tempEmail } : null);
        setShowEmailInput(false);
        toast.success('Recruiter email saved');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to save email');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!outreach) return <div>Outreach not found</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hover:bg-slate-100" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{outreach.job_title}</h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
              <span>{outreach.company_name}</span>
              <span>•</span>
              {outreach.recruiter_url ? (
                <a 
                  href={outreach.recruiter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline flex items-center gap-1"
                >
                  {outreach.recruiter_name || 'LinkedIn Profile'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span>{outreach.recruiter_name || 'HR Team'}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {outreach.job_url && (
            <Button 
              size="sm"
              variant="outline" 
              className="h-8 border-slate-200 text-slate-700 font-bold"
              onClick={() => window.open(outreach.job_url, '_blank')}
            >
              Apply Now <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          )}
          <Badge className={cn(
            "border-none text-[10px] font-bold uppercase tracking-wider px-2 py-1",
            outreach.status === 'replied' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
          )}>
            Status: {outreach.status}
          </Badge>
          {outreach.status === 'draft' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-brand-border h-9"
              onClick={() => navigate('/new', { state: { editOutreachId: outreach.id } })}
            >
              <Pencil className="w-4 h-4 mr-2" /> Edit Draft
            </Button>
          )}
          <Button variant="outline" size="sm" className="border-brand-border h-9">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Messages & Follow-ups */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="emails" className="w-full">
            <div className="border-b border-brand-border mb-6">
              <TabsList className="bg-transparent h-auto p-0 gap-8">
                <TabsTrigger value="emails" className="bg-transparent h-auto py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary data-[state=active]:shadow-none text-sm font-medium">
                  Cold Email
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="bg-transparent h-auto py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary data-[state=active]:shadow-none text-sm font-medium">
                  LinkedIn DM
                </TabsTrigger>
                <TabsTrigger value="followups" className="bg-transparent h-auto py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary data-[state=active]:shadow-none text-sm font-medium">
                  Follow-up Sequence
                </TabsTrigger>
                <TabsTrigger value="simulator" className="bg-transparent h-auto py-4 px-0 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary data-[state=active]:shadow-none text-sm font-medium">
                  Simulator
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="emails" className="mt-0">
              <Card className="glass-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold text-slate-700">Generated Email Draft</CardTitle>
                    <CardDescription className="text-xs">Injected profile match and sentiment analysis.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                     <Button 
                        size="sm" 
                        className={cn(
                          "h-8 gap-2 bg-brand-primary hover:bg-brand-primary/90",
                          outreach.status === 'sent' && "bg-green-100 text-green-700 hover:bg-green-100"
                        )}
                        onClick={handleSendEmail}
                        disabled={sending || outreach.status === 'sent'}
                      >
                        {sending ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : outreach.status === 'sent' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        {outreach.status === 'sent' ? 'Sent' : 'Open in Gmail'}
                      </Button>
                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-brand-primary" onClick={() => copyToClipboard(outreach.messages.cold_email)}>
                        <Copy className="w-4 h-4" />
                     </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {showEmailInput && (
                    <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Recipient's Email</label>
                        <Button variant="ghost" size="sm" className="h-4 p-0 text-[10px] text-slate-400" onClick={() => setShowEmailInput(false)}>Cancel</Button>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input 
                            type="email" 
                            placeholder="recruiter@company.com" 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                            value={tempEmail}
                            onChange={(e) => {
                              setTempEmail(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          />
                          {showSuggestions && suggestedEmails.filter(email => String(email).toLowerCase().includes(tempEmail.toLowerCase())).length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                              {suggestedEmails
                                .filter(email => String(email).toLowerCase().includes(tempEmail.toLowerCase()))
                                .map(email => (
                                  <div 
                                    key={email} 
                                    className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    onClick={() => {
                                      setTempEmail(email);
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    {email}
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                        <Button size="sm" onClick={saveRecruiterEmail} className="bg-brand-primary">Save & Close</Button>
                      </div>
                      {validationError && (
                        <p className="text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">{validationError}</p>
                      )}
                      <p className="text-[10px] text-slate-400">Required to connect with Gmail automatically.</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-8 gap-y-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recipient</p>
                      <p className="text-sm font-bold text-slate-800">
                        {outreach.recruiter_name || 'HR/Hiring Team'} 
                        {outreach.recruiter_email && <span className="text-slate-400 font-normal ml-2">({outreach.recruiter_email})</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                       {variants.map(v => (
                         <Button
                           key={v.id}
                           variant={activeVariantId === v.id ? "default" : "outline"}
                           size="sm"
                           onClick={() => {
                             setActiveVariantId(v.id);
                             setIsEditingVariant(false);
                           }}
                           className={cn("h-8 px-4", activeVariantId === v.id ? "bg-brand-primary" : "border-slate-200 text-slate-600")}
                         >
                           Variant {v.id}
                           {v.sent_count > 0 && <span className="ml-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{v.sent_count} sent</span>}
                         </Button>
                       ))}
                       {variants.length < 2 && (
                         <Button variant="outline" size="sm" onClick={handleCreateVariant} className="h-8 border-dashed border-slate-300 text-slate-500">
                           + Add Variation
                         </Button>
                       )}
                    </div>
                    {!isEditingVariant && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditSubject(activeVariant.subject);
                        setEditBody(activeVariant.body);
                        setIsEditingVariant(true);
                      }} className="h-8 text-slate-500">
                        <Pencil className="w-4 h-4 mr-2" /> Edit Variant
                      </Button>
                    )}
                  </div>

                  {isEditingVariant ? (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</p>
                        <input 
                          type="text" 
                          value={editSubject}
                          onChange={e => setEditSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Body</p>
                        <textarea 
                          value={editBody}
                          onChange={e => setEditBody(e.target.value)}
                          className="w-full h-64 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                        <Button size="sm" onClick={handleSaveVariant} className="bg-brand-primary">Save Changes</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</p>
                        <p className="text-sm font-bold text-slate-800">{activeVariant.subject}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-lg text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap border border-slate-100">
                        {activeVariant.body}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="linkedin" className="mt-0">
              <div className="space-y-6">
                <Card className="glass-card shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-bold text-slate-700">LinkedIn InMail / DM</CardTitle>
                      <CardDescription className="text-xs">Optimized for high response rates on mobile.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-brand-primary" onClick={() => copyToClipboard(outreach.messages.linkedin_dm)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="bg-slate-50 p-6 rounded-lg text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap border border-slate-100">
                      {outreach.messages.linkedin_dm}
                    </div>
                  </CardContent>
                </Card>

                {outreach.messages.linkedin_connection_request && (
                  <Card className="border-dashed border-2 border-brand-primary/20 bg-brand-primary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 text-brand-primary">
                        <Share2 className="w-4 h-4" />
                        <CardTitle className="text-sm font-bold">Personalized Connection Request</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {outreach.recruiter_name 
                          ? `Send this along with your invite to ${outreach.recruiter_name}.` 
                          : "Send this along with your LinkedIn connection invite."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-white/80 p-4 rounded-lg text-sm text-slate-600 italic relative group">
                        {outreach.messages.linkedin_connection_request}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                          onClick={() => copyToClipboard(outreach.messages.linkedin_connection_request || '')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="mt-4">
                        {outreach.recruiter_url ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full h-9 border-brand-primary text-brand-primary hover:bg-brand-primary/5 font-bold"
                            asChild
                          >
                            <a href={outreach.recruiter_url} target="_blank" rel="noopener noreferrer">
                              Connect on LinkedIn
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </a>
                          </Button>
                        ) : (
                          <p className="text-[10px] text-slate-400 text-center italic">
                            Recruiter profile not found. Find them on LinkedIn to use this message.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="glass-card shadow-sm mt-8 border-t-4 border-t-slate-200">
                  <CardHeader className="pb-4 border-b border-slate-50">
                    <CardTitle className="text-sm font-bold text-slate-700">Reference: Cold Email Draft</CardTitle>
                    <CardDescription className="text-xs">Preview of your generated cold email, for quick reference while sending LinkedIn messages.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-x-8 gap-y-4 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recipient</p>
                        <p className="text-sm font-bold text-slate-800">
                          {outreach.recruiter_name || 'HR/Hiring Team'} 
                          {outreach.recruiter_email && <span className="text-slate-400 font-normal ml-2">({outreach.recruiter_email})</span>}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</p>
                        <p className="text-sm font-bold text-slate-800">{outreach.messages.email_subject || `Application: ${outreach.job_title}`}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 mt-4 p-6 rounded-lg text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap border border-slate-100">
                      {outreach.messages.cold_email}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="followups" className="mt-0">
               <div className="space-y-4">
                  {outreach.messages.follow_ups.map((msg, i) => (
                    <Card key={i} className={cn(
                      "glass-card shadow-sm overflow-hidden transition-all",
                      outreach.last_follow_up_index !== undefined && outreach.last_follow_up_index >= i 
                        ? "opacity-60 grayscale-[0.5]" 
                        : (outreach.last_follow_up_index === i - 1 && outreach.status === 'sent')
                          ? "border-brand-primary/50 bg-brand-primary/5 ring-1 ring-brand-primary/20"
                          : ""
                    )}>
                       <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            Day {i === 0 ? 3 : i === 1 ? 7 : 14}
                            {outreach.last_follow_up_index !== undefined && outreach.last_follow_up_index >= i ? (
                              <Badge className="bg-green-100 text-green-700 text-[8px] h-4 border-none">SENT</Badge>
                            ) : (outreach.last_follow_up_index === i - 1 && outreach.status === 'sent') ? (
                              <Badge className="bg-brand-primary text-white text-[8px] h-4 border-none animate-pulse">SCHEDULED</Badge>
                            ) : null}
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(msg)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                       </div>
                       <CardContent className="pt-6 pb-6 p-6 font-medium text-sm text-slate-600 leading-relaxed">
                          {msg}
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="simulator" className="mt-6">
              <Simulator jobData={outreach.job_data} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: CRM & Info */}
        <div className="space-y-6">
          <Card className="glass-card border-none shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg">Outreach Strategy</CardTitle>
              <CardDescription>Track your progress for this role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {['sent', 'replied', 'closed'].map((status) => (
                    <Button 
                      key={status}
                      variant={outreach.status === status ? 'default' : 'outline'}
                      className={cn(
                        "capitalize border-slate-200",
                        outreach.status === status ? "bg-brand-primary text-white" : "hover:bg-slate-50"
                      )}
                      onClick={() => updateStatus(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
                {outreach.status === 'sent' && outreach.next_follow_up_at && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-[9px] text-brand-primary font-bold uppercase tracking-widest mb-1">Queue Active</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Next Follow-up:</span>
                      <span className="text-xs font-bold text-slate-900">{new Date(outreach.next_follow_up_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Job Links & Overview</p>
                <div className="space-y-2">
                  <a href={outreach.job_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all text-sm font-medium group">
                    View on LinkedIn
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-primary" />
                  </a>
                  {outreach.job_data?.description && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Job Description Summary</p>
                      <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap line-clamp-6">
                        {outreach.job_data.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Candidate Snapshot</p>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                  <p className="text-sm font-bold text-slate-700">{outreach.resume_data?.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {outreach.resume_data?.skills?.slice(0, 5).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-white text-[10px] font-bold">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Internal Notes</p>
                  {notes !== (outreach.notes || '') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-[10px] text-slate-500 hover:text-brand-primary"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                    >
                      {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                      Save
                    </Button>
                  )}
                </div>
                <textarea
                  className="w-full h-32 p-3 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:bg-white outline-none resize-none transition-all"
                  placeholder="Add details about this campaign, reminders, or insights..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-slate-900 hover:bg-slate-800 h-12 gap-2 shadow-lg shadow-slate-900/10">
            <Share2 className="w-5 h-5" />
            Share with Mentor
          </Button>
        </div>
      </div>
    </div>
  );
}

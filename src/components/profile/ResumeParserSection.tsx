import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  SlidersHorizontal,
  BrainCircuit,
  Wand2,
  FileCheck2,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAMPLE_RESUMES } from '@/lib/profile';
import { parseResume } from '@/lib/gemini';
import { ResumeParseResult } from '@/types/profile';
import { toast } from 'sonner';

interface ResumeParserSectionProps {
  onParsed: (result: ResumeParseResult, rawText: string) => void;
  isParsing?: boolean;
}

export const ResumeParserSection: React.FC<ResumeParserSectionProps> = ({
  onParsed,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'presets'>('text');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsingLocal, setIsParsingLocal] = useState(false);
  const [parsingStep, setParsingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetSelect = (presetText: string, presetTitle: string) => {
    setResumeText(presetText);
    setActiveTab('text');
    toast.info(`Loaded preset for "${presetTitle}". Ready to parse with Gemini.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleParse = async () => {
    setError(null);
    let textToProcess = resumeText;

    if (activeTab === 'file') {
      if (!selectedFile) {
        setError('Please select or upload a resume file (PDF, DOCX, or TXT).');
        return;
      }

      setIsParsingLocal(true);
      setParsingStep('Extracting document text...');

      try {
        const formData = new FormData();
        formData.append('resume', selectedFile);

        const uploadRes = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to extract text from resume file');
        }

        const uploadData = await uploadRes.json();
        textToProcess = uploadData.text;
        setResumeText(textToProcess);
      } catch (uploadErr: any) {
        setIsParsingLocal(false);
        setParsingStep(null);
        setError(uploadErr.message || 'Error processing resume file.');
        toast.error('File parsing failed: ' + uploadErr.message);
        return;
      }
    }

    if (!textToProcess || textToProcess.trim().length < 30) {
      setError('Please provide at least 30 characters of resume content to extract meaningful skills and experience.');
      setIsParsingLocal(false);
      setParsingStep(null);
      return;
    }

    setIsParsingLocal(true);
    setParsingStep('Gemini Neural Parsing: Extracting skills & experience...');

    try {
      setParsingStep('Analyzing employment timeline and competencies with Gemini...');
      const parseResult = await parseResume(textToProcess);

      setParsingStep('Synthesizing career highlights and profile metadata...');
      await new Promise(r => setTimeout(r, 400));

      onParsed(parseResult, textToProcess);
      toast.success('Resume parsed successfully with Gemini! Review extracted details below.');
    } catch (parseErr: any) {
      console.error('Resume parsing failed:', parseErr);
      setError(parseErr.message || 'Gemini resume parsing failed. Please check your text and try again.');
      toast.error('Parsing failed: ' + (parseErr.message || 'Unknown error'));
    } finally {
      setIsParsingLocal(false);
      setParsingStep(null);
    }
  };

  const handleClear = () => {
    setResumeText('');
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className="border-brand-primary/20 shadow-md bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100/80 bg-white/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Gemini Resume Intelligence Engine
              </CardTitle>
              <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 text-xs ml-1">
                Gemini 3.7 Flash
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Extract technical skills, career chronology, quantifiable achievements, and education from any text input or document.
            </CardDescription>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'text'
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'file'
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                activeTab === 'presets'
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Sample Presets</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Text Input Mode */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Resume Text / Experience Paste</span>
                <span className="text-slate-400 font-normal">(Raw text, LinkedIn export, or CV bullets)</span>
              </label>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>{resumeText.length} characters</span>
                {resumeText && (
                  <button 
                    onClick={handleClear}
                    className="text-slate-500 hover:text-red-500 transition-colors underline font-sans"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={7}
                placeholder="Paste your complete resume text or career highlights here...
Example:
Alex Mercer - Senior Software Engineer
Email: alex@example.com | Location: Seattle, WA

EXPERIENCE:
Senior Distributed Systems Engineer at CloudMatrix (2021 - Present)
- Designed and scaled low-latency message broker in Go and Rust processing 50k req/s
- Mentored junior engineers and led architectural RFC reviews

SKILLS:
Go, Rust, TypeScript, React, Docker, Kubernetes, PostgreSQL, Distributed Systems, AWS"
                className="w-full p-4 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-inner leading-relaxed transition-all"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Document File Upload Mode */}
        {activeTab === 'file' && (
          <div className="space-y-3">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
            />

            {!selectedFile ? (
              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer bg-white/70",
                  isDragging ? "border-brand-primary bg-brand-primary/5 scale-[1.01]" : "border-slate-200 hover:border-slate-300 hover:bg-white"
                )}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-primary shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">Click to browse or drop resume file</h4>
                <p className="text-xs text-slate-500 mb-3">Supported formats: PDF, DOCX, Word, or plain TXT</p>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="px-2 py-0.5 bg-slate-100 rounded">PDF</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">DOCX</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded">TXT</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white border border-blue-200 rounded-xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{selectedFile.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 text-xs text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Presets Mode */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Select an industry archetype to test Gemini resume parsing instantly:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_RESUMES.map((preset, idx) => (
                <div 
                  key={idx}
                  onClick={() => handlePresetSelect(preset.text, preset.title)}
                  className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-brand-primary hover:shadow-sm cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                      {preset.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">{preset.subtitle}</p>
                  <div className="mt-3 text-[11px] font-semibold text-brand-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Load & Edit</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls & Loading Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Parses skills, career timeline, education, and creates profile summary.</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              onClick={handleParse}
              disabled={isParsingLocal || (activeTab === 'text' && !resumeText.trim()) || (activeTab === 'file' && !selectedFile)}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs h-9 px-4 gap-2 shadow-xs transition-all"
            >
              {isParsingLocal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Parsing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract & Parse Resume</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Parsing Progress Feedback */}
        {isParsingLocal && parsingStep && (
          <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center gap-3 animate-in fade-in">
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary shrink-0" />
            <div className="text-xs text-blue-900 font-medium">{parsingStep}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

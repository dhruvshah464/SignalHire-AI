import { JobAnalysisResult } from '@/types/jobAnalysis';

const STORAGE_KEY = 'signalhire_saved_job_analyses';

export function getSavedJobAnalyses(): JobAnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved job analyses from localStorage', e);
    return [];
  }
}

export function saveJobAnalysis(analysis: JobAnalysisResult): JobAnalysisResult[] {
  try {
    const existing = getSavedJobAnalyses();
    // Prepend and deduplicate by id or (title + company)
    const filtered = existing.filter(
      item => item.id !== analysis.id && 
      !(item.job.title.toLowerCase() === analysis.job.title.toLowerCase() && 
        item.job.company.toLowerCase() === analysis.job.company.toLowerCase())
    );
    const updated = [analysis, ...filtered].slice(0, 20); // Keep last 20
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save job analysis to localStorage', e);
    return [];
  }
}

export function deleteSavedJobAnalysis(id: string): JobAnalysisResult[] {
  try {
    const existing = getSavedJobAnalyses();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete job analysis', e);
    return [];
  }
}

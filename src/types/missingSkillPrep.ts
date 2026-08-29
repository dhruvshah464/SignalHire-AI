export interface MissingSkillQuestion {
  id: string;
  skillName: string;
  question: string;
  category: string;
  difficulty: 'Core Knowledge' | 'Scenario & Tradeoffs' | 'Architectural Deep-Dive';
  interviewerIntent: string;
  bridgeStrategy: string;
  sampleModelAnswer: string;
  keywordsToDrop: string[];
  pitfallsToAvoid: string;
}

export interface MissingSkillPrepGroup {
  skillName: string;
  priority: 'Critical' | 'High' | 'Medium';
  gapType: string;
  fastLearnerProofAngle: string;
  questions: MissingSkillQuestion[];
}

export interface MissingSkillsInterviewPrepResult {
  id: string;
  targetRole: string;
  targetCompany: string;
  generatedAt: string;
  totalQuestions: number;
  skillsCovered: string[];
  prepGroups: MissingSkillPrepGroup[];
  generalDefenseStrategy: string;
}

export interface MissingSkillAnswerEvaluation {
  score: number;
  grade: 'Flawless Bridge' | 'Strong Defense' | 'Needs Transferable Proof' | 'Vulnerable to Probing';
  summary: string;
  strengths: string[];
  gapsInAnswer: string[];
  suggestedKeywordsIncluded: string[];
  missingHighSignalKeywords: string[];
  modelRefinedAnswer: string;
}

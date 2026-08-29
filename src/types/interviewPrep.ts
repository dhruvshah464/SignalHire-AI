export interface KeyCompetency {
  name: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium';
}

export interface TechnicalQuestion {
  id: string;
  question: string;
  category: 'System Design' | 'Architecture & Infrastructure' | 'Algorithms & Scalability' | 'API Design & Protocols' | 'Security & Reliability' | string;
  difficulty: 'Foundational' | 'Advanced' | 'Staff / Principal';
  whyTheyAsk: string;
  keyConcepts: string[];
  sampleAnswerFramework: string;
}

export interface BehavioralQuestion {
  id: string;
  question: string;
  category: 'Leadership & Ownership' | 'Tradeoffs & Crisis Management' | 'Cross-Functional Collaboration' | 'Technical Disagreement' | string;
  idealAnswerApproach: string;
  redFlagsToAvoid: string;
}

export interface ToughProbingQuestion {
  id: string;
  question: string;
  scenario: string;
  proTip: string;
}

export interface StrategicTip {
  id: string;
  category: 'Pre-Interview Battleplan' | 'Live Execution & Communication' | 'Whiteboard / Technical Defense' | 'Post-Interview & Offer Leverage';
  title: string;
  tip: string;
  impactLevel: 'Critical' | 'High';
}

export interface QuestionToAskInterviewer {
  id: string;
  question: string;
  rationale: string;
  category: 'Engineering Culture' | 'Technical Architecture' | 'Business & Growth' | 'Team & Autonomy';
}

export interface SimulationSeed {
  initialInterviewerGreeting: string;
  persona: string;
  primaryFocus: string;
}

export interface InterviewPrepDossier {
  id: string;
  targetId: string;
  targetType: 'project' | 'outreach' | 'job';
  targetName: string;
  subtitle?: string;
  generatedAt: string;
  roleSummary: string;
  keyCompetencies: KeyCompetency[];
  technicalQuestions: TechnicalQuestion[];
  behavioralQuestions: BehavioralQuestion[];
  toughProbingQuestions: ToughProbingQuestion[];
  strategicTips: StrategicTip[];
  questionsToAskInterviewer: QuestionToAskInterviewer[];
  simulationSeed: SimulationSeed;
}

export interface AnswerEvaluationResult {
  score: number;
  grade: 'Exceptional' | 'Strong' | 'Adequate' | 'Needs Work';
  summary: string;
  strengths: string[];
  improvements: string[];
  modelRefinedAnswer: string;
}

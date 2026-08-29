import {
  MissingSkillsInterviewPrepResult,
  MissingSkillAnswerEvaluation
} from '@/types/missingSkillPrep';

const STORAGE_PREFIX = 'missing_skills_prep_';

export interface GenerateMissingSkillsPrepParams {
  missingSkills: Array<{ name: string; priority?: string; recommendation?: string } | string>;
  jobDetails?: {
    title?: string;
    company?: string;
    seniority?: string;
    workplaceType?: string;
    techStackOverview?: string;
    responsibilities?: string[];
    summary?: string;
  };
  candidateProfile?: any;
  matchedSkills?: string[];
  focusSkill?: string;
}

export async function generateMissingSkillsInterviewPrep(
  params: GenerateMissingSkillsPrepParams
): Promise<MissingSkillsInterviewPrepResult> {
  const response = await fetch('/api/generate-missing-skills-interview-prep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate missing skills interview prep');
  }

  return response.json();
}

export async function evaluateMissingSkillAnswer(params: {
  question: string;
  skillName: string;
  userAnswer: string;
  bridgeStrategy?: string;
  matchedSkills?: string[];
}): Promise<MissingSkillAnswerEvaluation> {
  const response = await fetch('/api/evaluate-missing-skill-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to evaluate answer');
  }

  return response.json();
}

export function getSavedMissingSkillsPrep(
  id: string
): MissingSkillsInterviewPrepResult | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to get saved missing skills prep:', e);
    return null;
  }
}

export function saveMissingSkillsPrep(
  id: string,
  result: MissingSkillsInterviewPrepResult
): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(result));
  } catch (e) {
    console.warn('Failed to save missing skills prep:', e);
  }
}

export function formatMissingSkillsPrepAsMarkdown(
  result: MissingSkillsInterviewPrepResult
): string {
  let md = `# AI Missing-Skill Interview Preparation Dossier
**Role**: ${result.targetRole} at ${result.targetCompany}
**Generated**: ${new Date(result.generatedAt).toLocaleDateString()}
**Skills Targeted**: ${result.skillsCovered.join(', ')}

---

## 🎯 Executive Defense Strategy
${result.generalDefenseStrategy}

---

## 📚 Tailored Questions & Bridge Tactics by Missing Skill
`;

  result.prepGroups.forEach((group, idx) => {
    md += `\n### ${idx + 1}. Missing Skill: ${group.skillName} [${group.priority} Priority]
- **Gap Category**: ${group.gapType}
- **Rapid-Ramp Proof Angle**: ${group.fastLearnerProofAngle}

`;
    group.questions.forEach((q, qIdx) => {
      md += `#### Q${idx + 1}.${qIdx + 1}: ${q.question}
- **Difficulty**: ${q.difficulty} | **Category**: ${q.category}
- **Interviewer's Underlying Mindset**: ${q.interviewerIntent}
- **Authentic Bridge Strategy**: ${q.bridgeStrategy}
- **Key Terminology to Drop**: \`${q.keywordsToDrop.join('`, `')}\`
- **Pitfalls to Avoid**: ⚠️ ${q.pitfallsToAvoid}
- **Model Star Answer**:
> "${q.sampleModelAnswer}"

---
`;
    });
  });

  return md;
}

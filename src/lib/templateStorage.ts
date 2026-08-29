import { OutreachTemplate, TemplatePlaceholder, PreviewVariableState } from '@/types/template';

export const TEMPLATE_STORAGE_KEY = 'signalhire_outreach_templates';
export const TEMPLATES_UPDATED_EVENT = 'signalhire:templates_updated';

export const AVAILABLE_PLACEHOLDERS: TemplatePlaceholder[] = [
  // Job specific
  {
    key: 'job_title',
    label: 'Job Title',
    syntax: '{{job_title}}',
    category: 'job',
    description: 'Exact role title (e.g. Senior Frontend Engineer)',
    sampleValue: 'Senior Frontend Engineer',
    isRequired: true
  },
  {
    key: 'seniority_level',
    label: 'Seniority Level',
    syntax: '{{seniority_level}}',
    category: 'job',
    description: 'Seniority level (e.g. Senior, Staff, Lead)',
    sampleValue: 'Senior'
  },
  {
    key: 'workplace_type',
    label: 'Workplace Type',
    syntax: '{{workplace_type}}',
    category: 'job',
    description: 'Remote, Hybrid, or On-site',
    sampleValue: 'Remote'
  },
  {
    key: 'key_requirement_1',
    label: 'Key Requirement 1',
    syntax: '{{key_requirement_1}}',
    category: 'job',
    description: 'Primary core technical skill requested',
    sampleValue: 'React & TypeScript Architecture'
  },
  {
    key: 'key_requirement_2',
    label: 'Key Requirement 2',
    syntax: '{{key_requirement_2}}',
    category: 'job',
    description: 'Secondary technical requirement',
    sampleValue: 'Distributed High-Scale Systems'
  },

  // Company specific
  {
    key: 'company_name',
    label: 'Company Name',
    syntax: '{{company_name}}',
    category: 'company',
    description: 'Target hiring organization name',
    sampleValue: 'Stripe',
    isRequired: true
  },
  {
    key: 'company_product',
    label: 'Company Product / Mission',
    syntax: '{{company_product}}',
    category: 'company',
    description: 'Specific product, mission or service',
    sampleValue: 'developer-first payments infrastructure'
  },
  {
    key: 'recent_company_news',
    label: 'Company News / Milestone',
    syntax: '{{recent_company_news}}',
    category: 'company',
    description: 'Recent launch, funding, or engineering article',
    sampleValue: 'recent expansion into global agentic commerce APIs'
  },

  // Recruiter / Contact specific
  {
    key: 'recruiter_name',
    label: 'Full Contact Name',
    syntax: '{{recruiter_name}}',
    category: 'recruiter',
    description: 'Recruiter or Hiring Manager full name',
    sampleValue: 'Alex Morgan'
  },
  {
    key: 'recruiter_first_name',
    label: 'First Name',
    syntax: '{{recruiter_first_name}}',
    category: 'recruiter',
    description: 'Contact first name only for greeting',
    sampleValue: 'Alex',
    isRequired: true
  },
  {
    key: 'recruiter_title',
    label: 'Contact Title',
    syntax: '{{recruiter_title}}',
    category: 'recruiter',
    description: 'Job title of the person you are contacting',
    sampleValue: 'Technical Talent Partner'
  },

  // Candidate specific
  {
    key: 'candidate_name',
    label: 'Your Name',
    syntax: '{{candidate_name}}',
    category: 'candidate',
    description: 'Your full name from profile',
    sampleValue: 'Sarah Chen',
    isRequired: true
  },
  {
    key: 'candidate_headline',
    label: 'Your Headline',
    syntax: '{{candidate_headline}}',
    category: 'candidate',
    description: 'Your professional title / headline',
    sampleValue: 'Staff Frontend Engineer & React Specialist'
  },
  {
    key: 'years_experience',
    label: 'Years of Experience',
    syntax: '{{years_experience}}',
    category: 'candidate',
    description: 'Total professional experience count',
    sampleValue: '6+'
  },
  {
    key: 'current_company',
    label: 'Current / Past Company',
    syntax: '{{current_company}}',
    category: 'candidate',
    description: 'Where you currently or recently worked',
    sampleValue: 'Datadog'
  },
  {
    key: 'top_matching_skill',
    label: 'Top Matching Skill',
    syntax: '{{top_matching_skill}}',
    category: 'candidate',
    description: 'Your strongest technical overlap with the role',
    sampleValue: 'high-performance TypeScript design systems'
  },
  {
    key: 'key_achievement',
    label: 'Key Metric / Achievement',
    syntax: '{{key_achievement}}',
    category: 'candidate',
    description: 'Quantifiable achievement or speedup metric',
    sampleValue: 'reduced web app bundle latency by 42% across 2M daily active users'
  },
  {
    key: 'relevant_project',
    label: 'Relevant Project Name',
    syntax: '{{relevant_project}}',
    category: 'candidate',
    description: 'Name of a relevant open source repo or system',
    sampleValue: 'Nexus Design Engine'
  },
  {
    key: 'call_to_action',
    label: 'Call to Action',
    syntax: '{{call_to_action}}',
    category: 'candidate',
    description: 'Closing call to action sentence',
    sampleValue: 'Open to a brief 10-minute sync this Tuesday or Thursday afternoon?'
  },

  // Links
  {
    key: 'portfolio_url',
    label: 'Portfolio URL',
    syntax: '{{portfolio_url}}',
    category: 'links',
    description: 'Personal website or case study link',
    sampleValue: 'https://sarahchen.dev'
  },
  {
    key: 'github_url',
    label: 'GitHub URL',
    syntax: '{{github_url}}',
    category: 'links',
    description: 'GitHub profile or code repository',
    sampleValue: 'https://github.com/sarahchen'
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn URL',
    syntax: '{{linkedin_url}}',
    category: 'links',
    description: 'Your LinkedIn public profile',
    sampleValue: 'https://linkedin.com/in/sarahchen-dev'
  }
];

export const DEFAULT_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'tmpl_proof_of_work',
    title: 'The Proof-of-Work Metric Hook',
    description: 'Targeted directly at Hiring Managers & Engineering Directors focusing on measurable technical impact and architecture alignment.',
    category: 'hiring_manager',
    targetAudience: 'Hiring Managers',
    tone: 'Value & Metric Heavy',
    subject: '{{candidate_headline}} interested in {{company_name}}\'s {{job_title}} role',
    body: `Hi {{recruiter_first_name}},

I noticed {{company_name}} is scaling the {{job_title}} team to support {{company_product}}. 

Over the last {{years_experience}} years at {{current_company}}, I specialized in {{top_matching_skill}}. In my most recent initiative, I {{key_achievement}}, which directly addressed challenges similar to {{company_name}}'s focus on {{key_requirement_1}}.

I've followed {{company_name}}'s engineering work closely, especially {{recent_company_news}}. I built a quick prototype demonstrating how I approach {{key_requirement_2}} here: {{portfolio_url}}.

{{call_to_action}}

Best regards,
{{candidate_name}}
{{candidate_headline}}
{{github_url}} | {{linkedin_url}}`,
    tags: ['Hiring Manager', 'High Impact', 'Metrics', 'Proof of Work'],
    isFavorite: true,
    isDefault: true,
    useCount: 18,
    lastUsedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'tmpl_recruiter_fast_scan',
    title: 'The 30-Second Recruiter Fast-Scan',
    description: 'Ultra-clean, skimmable bullet points designed specifically for busy talent recruiters to verify qualifications instantly.',
    category: 'recruiter_cold',
    targetAudience: 'Recruiters',
    tone: 'Direct & Punchy',
    subject: 'Quick application note: {{candidate_name}} for {{job_title}} ({{top_matching_skill}})',
    body: `Hi {{recruiter_first_name}},

I saw you're leading talent search for the {{job_title}} opening at {{company_name}}. I've submitted my formal application through the portal and wanted to share a concise snapshot of why I'm an exact fit:

• Background: {{years_experience}} years building with {{key_requirement_1}} & {{key_requirement_2}}
• Core Alignment: Proven track record with {{top_matching_skill}} at {{current_company}}
• Impact: {{key_achievement}}
• Location/Availability: Ready for {{workplace_type}} collaboration

You can review my code and full project breakdowns here:
{{portfolio_url}} | {{github_url}}

I know your inbox is full—would love 5 minutes if my profile matches what the team needs.

Thanks for your time,
{{candidate_name}}
{{linkedin_url}}`,
    tags: ['Recruiters', 'Skimmable', 'Bullets', 'Direct'],
    isFavorite: true,
    isDefault: true,
    useCount: 24,
    lastUsedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'tmpl_founder_problem_solver',
    title: 'The Founder & Early-Stage Problem Solver',
    description: 'Written for founders, CTOs, and early-stage startup executives who value speed of execution, ownership, and direct communication.',
    category: 'executive_hook',
    targetAudience: 'Founders / Executives',
    tone: 'Direct & Punchy',
    subject: 'Ideas on {{company_product}} + {{candidate_name}} for {{company_name}}',
    body: `Hi {{recruiter_first_name}},

Huge congratulations on {{recent_company_news}}! I've been actively exploring {{company_product}} and love the clarity of the product direction.

I'm reaching out because you're hiring for a {{job_title}}. At {{current_company}}, I operated as an end-to-end owner where I {{key_achievement}}. My core strength is shipping resilient systems using {{key_requirement_1}} without unnecessary overhead.

I wrote up a couple of technical observations regarding how {{company_name}} could optimize {{key_requirement_2}}: {{portfolio_url}}

{{call_to_action}}

Cheers,
{{candidate_name}}
{{github_url}}`,
    tags: ['Founders', 'Startups', 'Executive', 'Fast Shipping'],
    isFavorite: false,
    isDefault: true,
    useCount: 12,
    lastUsedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'tmpl_peer_engineering_chat',
    title: 'The Peer Engineer Coffee Chat & Referral',
    description: 'Casual, humble, engineer-to-engineer outreach asking about team culture, technical architecture, and potential internal referral.',
    category: 'peer_referral',
    targetAudience: 'Engineers / Peers',
    tone: 'Warm & Conversational',
    subject: 'Fellow {{top_matching_skill}} dev — curious about engineering at {{company_name}}',
    body: `Hey {{recruiter_first_name}},

I came across your profile while researching {{company_name}}'s engineering team and noticed you also work extensively with {{key_requirement_1}}.

I'm currently preparing to apply for the {{job_title}} opening. As someone who has spent {{years_experience}} years tackling {{top_matching_skill}} at {{current_company}}, I'm really curious about how your team approaches {{key_requirement_2}} in production.

If you have 10 minutes sometime this week, I'd love to buy you a virtual coffee and hear about your experience on the team. No pressure at all either way!

Either way, love the work you and the team are doing with {{company_product}}.

Best,
{{candidate_name}}
{{linkedin_url}}`,
    tags: ['Referral', 'Peer-to-Peer', 'Networking', 'Coffee Chat'],
    isFavorite: true,
    isDefault: true,
    useCount: 15,
    lastUsedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'tmpl_post_application_standout',
    title: 'The Post-Application Standout Follow-Up',
    description: 'Sent 3-5 days after submitting an application to reaffirm enthusiasm, highlight new context, and cut through ATS pile-ups.',
    category: 'post_application',
    targetAudience: 'Recruiters',
    tone: 'Warm & Conversational',
    subject: 'Following up: {{candidate_name}} application for {{job_title}} at {{company_name}}',
    body: `Hi {{recruiter_first_name}},

I hope you're having a productive week!

I submitted my application for the {{job_title}} position a few days ago (Requisition: {{job_title}} - {{workplace_type}}). 

I wanted to quickly follow up with an additional project I recently open-sourced ({{relevant_project}}) that directly showcases my work with {{key_requirement_1}} and {{top_matching_skill}}:
{{portfolio_url}}

Given my background at {{current_company}} where I {{key_achievement}}, I'm confident I can make an immediate contribution to {{company_name}}'s roadmap for {{company_product}}.

Please let me know if there are any additional materials or code samples I can provide to support my application.

Warmly,
{{candidate_name}}
{{linkedin_url}}`,
    tags: ['Follow Up', 'Post Apply', 'ATS Standout'],
    isFavorite: false,
    isDefault: true,
    useCount: 9,
    lastUsedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'tmpl_gap_growth_angle',
    title: 'The Fast-Learner & Domain Pivot Angle',
    description: 'Frames non-traditional experience as an unfair advantage and highlights rapid ramp-up speed and deep fundamentals.',
    category: 'gap_growth',
    targetAudience: 'Hiring Managers',
    tone: 'Technical & Deep',
    subject: '{{job_title}} at {{company_name}} — Bringing high-velocity {{top_matching_skill}} execution',
    body: `Hi {{recruiter_first_name}},

When reviewing the {{job_title}} role at {{company_name}}, I was energized by the team's high bar for {{key_requirement_1}}.

While my core background has been centered on {{current_company}}, I specialize in rapid technical ramp-up and domain synthesis. At {{current_company}}, I {{key_achievement}} by applying deep fundamentals in {{top_matching_skill}}.

I noticed {{company_name}}'s recent momentum in {{company_product}}. I've already begun deep-diving into {{key_requirement_2}} and would welcome the opportunity to discuss how my cross-disciplinary engineering perspective can unlock new momentum for your team.

{{call_to_action}}

Best regards,
{{candidate_name}}
{{portfolio_url}} | {{github_url}}`,
    tags: ['Growth Mindset', 'Domain Pivot', 'Deep Fundamentals'],
    isFavorite: false,
    isDefault: true,
    useCount: 7,
    lastUsedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 86400000).toISOString()
  }
];

export function getSavedTemplates(): OutreachTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TEMPLATES;
  } catch (err) {
    console.error('Error reading templates from localStorage', err);
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplate(template: OutreachTemplate): OutreachTemplate {
  const current = getSavedTemplates();
  const existingIdx = current.findIndex(t => t.id === template.id);
  const now = new Date().toISOString();
  
  let updatedList: OutreachTemplate[];
  const templateToSave = {
    ...template,
    updatedAt: now
  };

  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = templateToSave;
  } else {
    updatedList = [templateToSave, ...current];
  }

  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: updatedList }));
  return templateToSave;
}

export function deleteTemplate(id: string): void {
  const current = getSavedTemplates();
  const filtered = current.filter(t => t.id !== id);
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: filtered }));
}

export function duplicateTemplate(id: string): OutreachTemplate | null {
  const current = getSavedTemplates();
  const found = current.find(t => t.id === id);
  if (!found) return null;

  const now = new Date().toISOString();
  const duplicate: OutreachTemplate = {
    ...found,
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `${found.title} (Copy)`,
    isDefault: false,
    useCount: 0,
    createdAt: now,
    updatedAt: now
  };

  saveTemplate(duplicate);
  return duplicate;
}

export function toggleFavoriteTemplate(id: string): void {
  const current = getSavedTemplates();
  const updated = current.map(t => {
    if (t.id === id) {
      return { ...t, isFavorite: !t.isFavorite, updatedAt: new Date().toISOString() };
    }
    return t;
  });
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: updated }));
}

export function incrementTemplateUseCount(id: string): void {
  const current = getSavedTemplates();
  const updated = current.map(t => {
    if (t.id === id) {
      return { 
        ...t, 
        useCount: (t.useCount || 0) + 1, 
        lastUsedAt: new Date().toISOString() 
      };
    }
    return t;
  });
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: updated }));
}

export function resetTemplatesToDefault(): OutreachTemplate[] {
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
  window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: DEFAULT_TEMPLATES }));
  return DEFAULT_TEMPLATES;
}

export function exportTemplatesJSON(): string {
  const templates = getSavedTemplates();
  return JSON.stringify(templates, null, 2);
}

export function importTemplatesJSON(jsonStr: string): { imported: number; errors?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { imported: 0, errors: 'Invalid JSON format. Expected an array of templates.' };
    }

    const current = getSavedTemplates();
    const currentMap = new Map(current.map(t => [t.id, t]));

    let count = 0;
    for (const item of parsed) {
      if (item && item.title && item.body) {
        const id = item.id || `tmpl_imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        currentMap.set(id, {
          ...item,
          id,
          updatedAt: new Date().toISOString()
        });
        count++;
      }
    }

    const merged = Array.from(currentMap.values());
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: merged }));
    return { imported: count };
  } catch (err: any) {
    return { imported: 0, errors: err.message || 'Failed to parse JSON file' };
  }
}

/**
 * Replaces placeholders in subject and body with provided variables.
 * Returns rendered strings, extracted detected keys, and missing keys.
 */
export function renderTemplate(
  template: { subject: string; body: string },
  variables: PreviewVariableState
): {
  subject: string;
  body: string;
  detectedKeys: string[];
  missingKeys: string[];
} {
  const detectedKeysSet = new Set<string>();
  const missingKeysSet = new Set<string>();

  const replaceFn = (rawText: string) => {
    return rawText.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, key) => {
      detectedKeysSet.add(key);
      const val = variables[key];
      if (val !== undefined && val !== '') {
        return val;
      }
      missingKeysSet.add(key);
      return match; // keep placeholder as {{key}} if unprovided
    });
  };

  const subject = replaceFn(template.subject || '');
  const body = replaceFn(template.body || '');

  return {
    subject,
    body,
    detectedKeys: Array.from(detectedKeysSet),
    missingKeys: Array.from(missingKeysSet)
  };
}

/**
 * Extracts all placeholder keys present in text
 */
export function extractPlaceholdersFromText(text: string): string[] {
  const matches = text.match(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g) || [];
  return Array.from(new Set(matches.map(m => m.replace(/[\{\}\s]/g, ''))));
}

import { UserProfile, ResumeParseResult, WorkExperience, EducationItem } from '@/types/profile';

const STORAGE_KEY = 'signalhire_user_profile';
const EVENT_NAME = 'user_profile_updated';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'default-profile-1',
  name: 'Sarah Chen',
  headline: 'Senior Full-Stack & Systems Engineer',
  email: 'sarah.chen@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA (Open to Remote)',
  bio: 'Product-minded Senior Software Engineer with 7+ years of experience building high-scale distributed systems, AI workflows, and modern web applications with React, TypeScript, Node.js, and Cloud Infrastructure.',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'Next.js',
    'PostgreSQL',
    'Python',
    'GraphQL',
    'Docker',
    'Kubernetes',
    'AWS',
    'System Design',
    'Tailwind CSS',
    'Gemini AI API'
  ],
  skillCategories: [
    {
      category: 'Languages & Core',
      skills: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Go']
    },
    {
      category: 'Frontend & UI',
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Vite', 'Redux / Zustand']
    },
    {
      category: 'Backend & Cloud',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'GraphQL']
    },
    {
      category: 'AI & Systems',
      skills: ['Gemini AI API', 'System Architecture', 'CI/CD Pipelines', 'Distributed Systems']
    }
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Full-Stack Engineer',
      company: 'Vanguard Cloud Technologies',
      duration: '2022 - Present',
      location: 'San Francisco, CA',
      description: 'Led architecture and development of enterprise SaaS platform servicing 150k+ daily active users.',
      highlights: [
        'Architected real-time event streaming pipeline processing 10M+ events daily with 99.99% uptime.',
        'Migrated monolithic frontend to modular Next.js application, reducing page load latency by 45%.',
        'Mentored 6 junior/mid engineers and established company-wide TypeScript quality standards.'
      ]
    },
    {
      id: 'exp-2',
      role: 'Full-Stack Software Engineer',
      company: 'Apex Data Labs',
      duration: '2019 - 2022',
      location: 'New York, NY',
      description: 'Developed core analytics microservices and interactive customer dashboards.',
      highlights: [
        'Built automated reporting engine with Node.js and PostgreSQL reducing query times by 60%.',
        'Engineered responsive analytics visualizations using D3.js and React.',
        'Implemented zero-downtime CI/CD workflows on AWS with Docker and GitHub Actions.'
      ]
    },
    {
      id: 'exp-3',
      role: 'Software Engineering Intern',
      company: 'Horizon Interactive',
      duration: '2018 - 2019',
      location: 'Boston, MA',
      description: 'Contributed to client web applications and REST API integrations.',
      highlights: [
        'Developed reusable UI components with React and CSS modules.',
        'Integrated third-party payment and CRM webhooks with automated error handling.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      year: '2015 - 2019'
    }
  ],
  links: {
    linkedin: 'https://linkedin.com/in/sarahchen-dev',
    github: 'https://github.com/sarahchen-codes',
    portfolio: 'https://sarahchen.dev'
  },
  targetPreferences: {
    desiredRoles: ['Staff Software Engineer', 'Senior Full-Stack Lead', 'AI Solutions Architect'],
    targetSalary: '$180,000 - $220,000',
    workPreference: 'remote'
  },
  updatedAt: new Date().toISOString()
};

export const SAMPLE_RESUMES = [
  {
    title: 'Senior Full-Stack Engineer',
    subtitle: '7+ Years • React, Node, Python, Cloud',
    text: `Alex Morgan
Email: alex.morgan@techmail.io | Phone: (415) 890-1234 | Location: Austin, TX | LinkedIn: linkedin.com/in/alexmorgan-dev | GitHub: github.com/alexm-dev

PROFESSIONAL SUMMARY
Dynamic Senior Full-Stack Engineer with 8 years of experience building resilient cloud applications, high-throughput APIs, and modern web user interfaces. Passionate about AI integrations, developer experience, and distributed database architecture.

CORE SKILLS
- Languages: TypeScript, JavaScript, Python, Go, SQL, Bash
- Frameworks & Web: React, Next.js, Node.js, Express, Fastify, FastAPI, Tailwind CSS, GraphQL, REST
- Cloud & Infrastructure: AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes, Terraform, CI/CD (GitHub Actions), Redis, PostgreSQL, Kafka
- Practices: System Design, Agile/Scrum, Test-Driven Development, Microservices Architecture, Observability (Datadog, Prometheus)

PROFESSIONAL EXPERIENCE

Senior Software Engineer | CloudScale Systems | Austin, TX
March 2022 - Present
- Architected and scaled a multi-tenant cloud telemetry dashboard in React, TypeScript, and Node.js serving 500,000+ monthly active users.
- Redesigned core query processing service in Go and PostgreSQL, reducing p99 API latency from 450ms to 65ms.
- Built automated AI-powered error diagnostics feature using Gemini API, decreasing mean-time-to-resolution (MTTR) by 35%.
- Led sprint planning and code review standards across a distributed engineering squad of 8 engineers.

Full-Stack Developer | Nexus Labs Inc. | San Francisco, CA
June 2019 - February 2022
- Developed enterprise billing and subscription management platform handling $25M+ in annual recurring revenue.
- Implemented real-time collaborative workspace canvas using WebSockets and Redis Pub/Sub.
- Engineered reusable Design System component library adopted across 4 major customer-facing web applications.
- Authored 200+ unit and end-to-end integration tests using Jest and Playwright, elevating test coverage to 92%.

Junior Software Engineer | Beacon Software | Seattle, WA
July 2017 - May 2019
- Built RESTful backend microservices for high-volume e-commerce clients using Node.js and MongoDB.
- Optimized frontend bundle sizes by 40% through code-splitting and dynamic imports.
- Participated in 24/7 on-call rotations and resolved production incidents with minimal customer downtime.

EDUCATION
B.S. in Computer Science & Engineering
University of Washington, Seattle | 2013 - 2017`
  },
  {
    title: 'AI Product Designer & UX Lead',
    subtitle: '6+ Years • Figma, Design Systems, User Research',
    text: `Elena Rostova
Email: elena.design@creativestudio.com | Phone: (650) 456-7890 | Location: San Francisco, CA | Portfolio: elenarostova.design | LinkedIn: linkedin.com/in/elenarostova-ux

PROFESSIONAL SUMMARY
Lead Product Designer specializing in generative AI workflows, complex enterprise tooling, and design systems. Deep expertise in human-computer interaction (HCI), rapid prototyping, design tokens, and user research.

SKILLS & TOOLING
- Product Design: Figma, FigJam, Principle, Framer, Adobe Creative Suite, Protopie
- Methodologies: User Journey Mapping, Information Architecture, Usability Testing, Quantitative Analytics, Design Sprints
- Technical & Design Systems: HTML, CSS, Tailwind tokens, React component specs, Accessibility (WCAG 2.1 AA), Storybook
- Domains: AI Copilots, Enterprise SaaS, Developer Platforms, Data Visualization

WORK EXPERIENCE

Lead Product Designer | SynthAI Studio | San Francisco, CA
2022 - Present
- Spearheaded end-to-end UX for AI-assisted workflow engine, driving a 60% boost in daily user retention.
- Created and maintained unified Design System across web, desktop, and mobile products, reducing engineering handoff time by 50%.
- Conducted 40+ user research sessions and synthesized usability telemetry into quarterly product roadmap priorities.

Senior UX/UI Designer | Hyperion Cloud | Sunnyvale, CA
2019 - 2022
- Led product redesign for cloud security management console, improving task completion rate from 68% to 94%.
- Designed interactive interactive dashboards and data visualizations for large-scale enterprise monitoring.
- Collaborated closely with front-end engineers to implement pixel-perfect micro-interactions and animations.

Product Designer | Orbit Interactive | Seattle, WA
2017 - 2019
- Designed wireframes, high-fidelity mockups, and interactive prototypes for fintech mobile applications.
- Facilitated weekly design critique sessions and established cross-functional user interview cadences.

EDUCATION
B.F.A. in Interaction Design
California College of the Arts (CCA) | 2013 - 2017`
  },
  {
    title: 'Staff Machine Learning & AI Architect',
    subtitle: '9+ Years • LLMs, PyTorch, Distributed Training',
    text: `Marcus Sterling, Ph.D.
Email: marcus.sterling@ai-frontier.org | Phone: (408) 555-0199 | Location: Palo Alto, CA | GitHub: github.com/msterling-ai | LinkedIn: linkedin.com/in/marcussterling-phd

SUMMARY
Distinguished Machine Learning Engineer and Systems Architect with 9+ years advancing large language models, retrieval-augmented generation (RAG), and high-performance inference pipelines on GPU clusters.

CORE COMPETENCIES
- AI & ML: LLMs, Transformer architectures, Fine-tuning (LoRA/QLoRA), RAG, Vector Databases (Pinecone, Milvus, Qdrant), LangChain, vLLM
- Frameworks: PyTorch, JAX, Hugging Face, Ray, Triton Inference Server, CUDA, TensorRT
- Infrastructure: Kubernetes, Slurm, AWS SageMaker, GCP Vertex AI, Docker, Prometheus, Grafana
- Core Languages: Python, C++, CUDA, SQL

PROFESSIONAL EXPERIENCE

Principal AI Architect | NeuroScale Technologies | Palo Alto, CA
2021 - Present
- Architected enterprise RAG and agent orchestration platform processing 25M+ inferences daily with <120ms latency.
- Spearheaded quantization and kernel optimization efforts (FP8/AWQ), cutting model inference infrastructure cost by 54%.
- Designed automated hallucination evaluation pipeline and continuous benchmark harness.

Senior Machine Learning Engineer | DeepMatrix AI | Mountain View, CA
2018 - 2021
- Led development of multimodal embedding search engine indexing 500M+ documents for global enterprise search.
- Scaled distributed multi-node PyTorch training across 128 NVIDIA A100 GPUs with DeepSpeed.
- Published 3 conference papers on efficient attention mechanisms and memory-constrained inference.

EDUCATION
Ph.D. in Computer Science (Artificial Intelligence)
Stanford University | 2014 - 2018

B.S. in Applied Mathematics & Computer Science
MIT | 2010 - 2014`
  }
];

export function getSavedUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) {
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          skills: Array.isArray(parsed.skills) ? parsed.skills : DEFAULT_PROFILE.skills,
          experience: Array.isArray(parsed.experience) ? parsed.experience : DEFAULT_PROFILE.experience,
          education: Array.isArray(parsed.education) ? parsed.education : DEFAULT_PROFILE.education,
          links: { ...DEFAULT_PROFILE.links, ...(parsed.links || {}) }
        };
      }
    }
  } catch (err) {
    console.error('Error loading saved profile from localStorage', err);
  }
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    const updated: UserProfile = {
      ...profile,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Also save under secondary key for backward compatibility
    localStorage.setItem('user_profile_data', JSON.stringify(updated));
    
    // Dispatch event so any reactive listener updates without page refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    }
  } catch (err) {
    console.error('Error saving profile to localStorage', err);
    throw new Error('Failed to save profile locally');
  }
}

export function mergeParsedResumeIntoProfile(
  parsed: ResumeParseResult,
  currentProfile: UserProfile,
  rawText?: string
): UserProfile {
  const experiences: WorkExperience[] = (parsed.experience || []).map((exp, idx) => ({
    id: `exp-${Date.now()}-${idx}`,
    role: exp.role || 'Software Engineer',
    company: exp.company || 'Company',
    duration: exp.duration || 'Past Experience',
    location: exp.location || '',
    description: exp.description || '',
    highlights: Array.isArray(exp.highlights) && exp.highlights.length > 0 
      ? exp.highlights 
      : (exp.description ? [exp.description] : [])
  }));

  const education: EducationItem[] = (parsed.education || []).map((edu, idx) => ({
    id: `edu-${Date.now()}-${idx}`,
    degree: edu.degree || 'Degree',
    school: edu.school || 'University',
    year: edu.year || ''
  }));

  const extractedSkills = Array.isArray(parsed.skills) ? parsed.skills.filter(s => typeof s === 'string' && s.trim().length > 0) : [];
  
  // Combine extracted skills with current, deduplicating while preserving order
  const combinedSkills = Array.from(new Set([
    ...extractedSkills,
    ...(extractedSkills.length < 5 ? currentProfile.skills : [])
  ]));

  return {
    ...currentProfile,
    name: parsed.name && parsed.name.trim().length > 0 ? parsed.name.trim() : currentProfile.name,
    headline: parsed.headline && parsed.headline.trim().length > 0 ? parsed.headline.trim() : currentProfile.headline,
    email: parsed.email && parsed.email.trim().length > 0 ? parsed.email.trim() : currentProfile.email,
    phone: parsed.phone && parsed.phone.trim().length > 0 ? parsed.phone.trim() : currentProfile.phone,
    location: parsed.location && parsed.location.trim().length > 0 ? parsed.location.trim() : currentProfile.location,
    bio: parsed.bio && parsed.bio.trim().length > 0 ? parsed.bio.trim() : currentProfile.bio,
    skills: combinedSkills.length > 0 ? combinedSkills : currentProfile.skills,
    skillCategories: parsed.skillCategories && parsed.skillCategories.length > 0 
      ? parsed.skillCategories 
      : currentProfile.skillCategories,
    experience: experiences.length > 0 ? experiences : currentProfile.experience,
    education: education.length > 0 ? education : currentProfile.education,
    links: {
      ...currentProfile.links,
      ...(parsed.links || {})
    },
    rawResumeText: rawText || currentProfile.rawResumeText,
    lastParsedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function subscribeToProfileChanges(callback: (profile: UserProfile) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<UserProfile>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getSavedUserProfile());
    }
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getSavedUserProfile());
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

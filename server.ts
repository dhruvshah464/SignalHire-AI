import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import mammoth from "mammoth";
import UserAgent from "user-agents";
import { GoogleGenAI, Type } from "@google/genai";
import * as pdfModule from "pdf-parse";

dotenv.config();

// GenAI setup
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini Generator with automatic retry, exponential backoff & model cascade
interface GeminiCallParams {
  model?: string;
  contents: any;
  config?: any;
  maxRetries?: number;
}

async function generateGeminiContent(params: GeminiCallParams) {
  if (!ai) {
    throw new Error("Gemini AI not initialized. Check GEMINI_API_KEY.");
  }

  // Model cascade prioritizing requested model, then latest flash, then flash-lite
  const preferredModel = params.model || "gemini-3.7-flash";
  const modelChain = [
    preferredModel,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];
  const uniqueModels = Array.from(new Set(modelChain));

  let lastError: any = null;

  for (const model of uniqueModels) {
    const retries = params.maxRetries ?? 2;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("500") ||
          errMsg.includes("Internal error") ||
          errMsg.includes("ECONNRESET") ||
          errMsg.includes("ETIMEDOUT");

        console.warn(
          `[Gemini AI (${model}) Attempt ${attempt + 1}/${retries + 1} Warning]: ${errMsg}`
        );

        if (isTransient) {
          if (attempt < retries) {
            const delay = (attempt + 1) * 800 + Math.floor(Math.random() * 400);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          } else {
            console.warn(
              `[Gemini AI model ${model} temporarily unavailable. Cascading to fallback model...]`
            );
            break; // Try next model in cascade
          }
        } else {
          // If error is not transient (e.g. 400 Bad Request), fail fast
          throw err;
        }
      }
    }
  }

  throw lastError || new Error("Gemini API call failed after retries and fallbacks.");
}

// Helper to extract Google Search Grounding metadata & sources
function extractGroundingSources(response: any) {
  const candidate = response?.candidates?.[0];
  const metadata = candidate?.groundingMetadata;
  const chunks = metadata?.groundingChunks || [];
  const searchQueries = metadata?.webSearchQueries || [];
  const sources: Array<{ title: string; url: string }> = [];
  const seenUrls = new Set<string>();

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;
    if (uri && !seenUrls.has(uri)) {
      seenUrls.add(uri);
      sources.push({ title, url: uri });
    }
  }

  return { sources, searchQueries };
}

// pdf-parse normalization
const parsePDF = typeof pdfModule === 'function' ? pdfModule : (pdfModule as any).default || pdfModule;

// Configure Multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize UA generator for smarter scraping
const uaGenerator = new UserAgent({ deviceCategory: 'desktop' });

// Advanced Scraper Headers with dynamic UA
const getHeaders = (url: string) => {
  const ua = uaGenerator.random().toString();
  
  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,video/webm,video/ogg,audio/ogg,audio/webm,application/wasm,application/json,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.google.com/',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'TE': 'trailers',
    'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  };
};

// Initialize Supabase on server for background tasks (Lazy)
let supabase: any = null;
function getSupabase() {
  if (supabase) return supabase;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project.supabase.co')) {
    console.warn("Supabase credentials missing or using placeholder. Background worker and some features will be disabled.");
    return null;
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

async function startServer() {
  console.log("Server starting...");
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Background Worker: Automatically process follow-ups
  setInterval(async () => {
    const client = getSupabase();
    if (!client) return;

    try {
      const now = new Date().toISOString();
      // Find sent outreaches due for a follow-up
      const { data: dueOutreaches, error } = await client
        .from('outreaches')
        .select('*')
        .eq('status', 'sent')
        .lte('next_follow_up_at', now);

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('relation "outreaches" does not exist') || msg.includes('schema cache')) {
          // Table doesn't exist yet or cache is stale, skip
          return;
        }
        throw error;
      }

      if (dueOutreaches && dueOutreaches.length > 0) {
        console.log(`[Worker] Found ${dueOutreaches.length} outreaches due for follow-up`);

        for (const outreach of dueOutreaches) {
          const nextIndex = (outreach.last_follow_up_index ?? -1) + 1;
          const followUps = outreach.messages?.follow_ups || [];

          if (nextIndex < followUps.length) {
            // "Send" the follow-up
            console.log(`[Worker] Sending Follow-up ${nextIndex + 1} for ${outreach.job_title} at ${outreach.company_name}`);
            
            // Calculate next follow-up date
            // Sequence: 3 days, 7 days, 14 days
            const nextFollowUpAt = new Date();
            if (nextIndex === 0) nextFollowUpAt.setDate(nextFollowUpAt.getDate() + 4); // 7 days from start (4 from day 3)
            else if (nextIndex === 1) nextFollowUpAt.setDate(nextFollowUpAt.getDate() + 7); // 14 days from start (7 from day 7)
            else nextFollowUpAt.setFullYear(nextFollowUpAt.getFullYear() + 1); // No more follow-ups

            await client
              .from('outreaches')
              .update({
                last_follow_up_index: nextIndex,
                next_follow_up_at: nextFollowUpAt.toISOString(),
                // In a real app, we might log the "send" event here
                notes: (outreach.notes || "") + `\n[Auto] Sent Follow-up ${nextIndex + 1} on ${new Date().toLocaleDateString()}`
              })
              .eq('id', outreach.id);
          } else {
            // No more follow-ups to send
            await client
              .from('outreaches')
              .update({ next_follow_up_at: null })
              .eq('id', outreach.id);
          }
        }
      }
    } catch (workerErr: any) {
      // Noise cancellation for missing columns/tables in demo env
      const msg = workerErr?.message || String(workerErr);
      const lowerMsg = msg.toLowerCase();
      if ((lowerMsg.includes('column') && lowerMsg.includes('does not exist')) || lowerMsg.includes('schema cache') || lowerMsg.includes('fetch failed')) {
        return;
      }
      console.error("[Worker Error]", msg);
    }
  }, 30000); // Check every 30 seconds for the demo

  // API Route: Search Jobs (Powered by Google Search Grounding via Gemini with API fallbacks)
  app.get("/api/search-jobs", async (req, res) => {
    const { query, location } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const rawQueryStr = (query as string).trim();
    const locStr = (location as string || "").trim();
    const fullSearchQuery = locStr ? `${rawQueryStr} in ${locStr}` : rawQueryStr;

    // 1. Primary: Real-Time Web Discovery with Google Search Grounding
    if (ai) {
      try {
        console.log(`[Job Search] Running Google Search Grounding for: "${fullSearchQuery}"`);
        const searchPrompt = `You are a real-time talent search intelligence engine powered by Google Search Grounding.
Use Google Search to find 5 to 10 of the most recent, active job postings and open positions matching this query: "${fullSearchQuery}".
Search across active career sites, job boards (LinkedIn, Greenhouse, Lever, Ashby, Workday, Indeed, Wellfound), and direct tech company career portals.

For each active job posting you discover, extract:
- job_id: A unique identifier string (e.g. "grounded-job-1", "grounded-job-2")
- job_title: Exact official job title (e.g. "Staff AI Research Engineer", "Senior Full-Stack Developer")
- employer_name: Accurate company name (e.g. "Anthropic", "Stripe", "Datadog")
- job_location: Location or "Remote" / "Hybrid - San Francisco, CA"
- workplace_type: "Remote" | "Hybrid" | "On-site"
- job_description: Rich, informative 2-3 paragraph job summary covering team mission, core responsibilities, key technologies, and qualifications.
- job_apply_link: Direct URL to the job posting or company application portal found on the web.
- salary_range: Published salary range or realistic competitive market estimate (e.g. "$170k - $220k / yr")
- posted_date: Posting freshness indicator (e.g. "Recently Posted", "Active Listing", "1 week ago")
- job_publisher: Source platform or career system (e.g. "Company Careers", "Greenhouse", "LinkedIn", "Lever", "Ashby")
- must_have_skills: Array of 3 to 5 critical technical competencies / tools (e.g. ["TypeScript", "Next.js", "Distributed Systems"])

Return ONLY a valid JSON object matching the requested schema.`;

        const response = await generateGeminiContent({
          contents: searchPrompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                jobs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      job_id: { type: Type.STRING },
                      job_title: { type: Type.STRING },
                      employer_name: { type: Type.STRING },
                      job_location: { type: Type.STRING },
                      workplace_type: { type: Type.STRING },
                      job_description: { type: Type.STRING },
                      job_apply_link: { type: Type.STRING },
                      salary_range: { type: Type.STRING },
                      posted_date: { type: Type.STRING },
                      job_publisher: { type: Type.STRING },
                      must_have_skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["job_id", "job_title", "employer_name", "job_description", "job_apply_link"]
                  }
                }
              },
              required: ["jobs"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          const { sources, searchQueries } = extractGroundingSources(response);
          if (parsed.jobs && Array.isArray(parsed.jobs) && parsed.jobs.length > 0) {
            console.log(`[Job Search] Successfully found ${parsed.jobs.length} Google-grounded jobs with ${sources.length} sources`);
            return res.json({
              data: parsed.jobs,
              groundingSources: sources,
              searchQueries,
              isGoogleSearchGrounded: true,
              source: "google_search_grounding"
            });
          }
        }
      } catch (groundingErr: any) {
        console.warn("[Google Search Grounding Job Search Warn]", groundingErr.message);
      }
    }

    // 2. Secondary Fallback: RapidAPI JSearch
    const key = process.env.RAPIDAPI_KEY;
    if (key) {
      try {
        const options = {
          method: 'GET',
          url: 'https://jsearch.p.rapidapi.com/search',
          params: {
            query: fullSearchQuery,
            page: '1',
            num_pages: '1'
          },
          headers: {
            'X-RapidAPI-Key': key,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        };

        const response = await axios.request(options);
        return res.json({
          ...response.data,
          isGoogleSearchGrounded: false,
          source: "rapidapi"
        });
      } catch (error: any) {
        if (error?.response?.status !== 403 && error?.response?.status !== 401) {
          console.error("[Job Search API Error]", error?.response?.data || error.message);
        }
        console.log("Using Remotive API as fallback...");
      }
    }

    // 3. Tertiary Fallback: Remotive API
    try {
      const response = await axios.get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(rawQueryStr)}`);
      const jobs = response.data.jobs || [];
      
      const mappedJobs = jobs.slice(0, 15).map((job: any) => ({
        job_id: job.id.toString(),
        job_title: job.title,
        employer_name: job.company_name,
        job_location: job.candidate_required_location || 'Remote',
        workplace_type: 'Remote',
        job_description: (job.description || '').replace(/<[^>]+>/g, '').substring(0, 500) + '...',
        job_apply_link: job.url,
        salary_range: job.salary || 'Competitive',
        posted_date: job.publication_date ? new Date(job.publication_date).toLocaleDateString() : 'Recent',
        job_publisher: 'Remotive',
        must_have_skills: job.tags || ['Remote', 'Engineering']
      }));
      
      return res.json({
        data: mappedJobs,
        isGoogleSearchGrounded: false,
        source: "remotive"
      });
    } catch (fallbackError: any) {
      console.error("[Remotive Fallback Error]", fallbackError.message);
      
      return res.json({
        data: [
          {
            job_id: "mock-1",
            job_title: `Senior ${rawQueryStr} Engineer`,
            employer_name: "Innovation Labs",
            job_location: "Remote / San Francisco",
            workplace_type: "Remote",
            salary_range: "$165k - $210k / yr",
            posted_date: "Active",
            job_publisher: "Career Board",
            must_have_skills: ["TypeScript", "Distributed Systems", "Cloud"],
            job_description: `Join our high-impact team building modern software infrastructure for ${rawQueryStr}. We are seeking senior engineers passionate about high availability and craftsmanship.`,
            job_apply_link: "https://example.com/job/1"
          },
          {
            job_id: "mock-2",
            job_title: `Staff ${rawQueryStr} Architect`,
            employer_name: "Global Scale Technologies",
            job_location: "New York, NY (Hybrid)",
            workplace_type: "Hybrid",
            salary_range: "$190k - $240k / yr",
            posted_date: "Recent",
            job_publisher: "Direct Portal",
            must_have_skills: ["System Architecture", "React", "AI Integration"],
            job_description: `Lead architecture and engineering execution for next-generation platforms specializing in ${rawQueryStr}.`,
            job_apply_link: "https://example.com/job/2"
          }
        ],
        isGoogleSearchGrounded: false,
        source: "fallback"
      });
    }
  });

  // API Route: Scrape Job URL (Enhanced with Google Search Grounding)
  app.post("/api/scrape-job", async (req, res) => {
    console.log("POST /api/scrape-job called", req.body);
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const urlLower = url.toLowerCase();
    
    // Domain-specific metadata hints for better fallback
    const getMetadataHint = (domain: string) => {
      if (domain.includes('linkedin')) return { title: 'Role at LinkedIn', company: 'LinkedIn' };
      if (domain.includes('indeed')) return { title: 'Role at Indeed', company: 'Indeed' };
      if (domain.includes('glassdoor')) return { title: 'Role at Glassdoor', company: 'Glassdoor' };
      if (domain.includes('lever.co')) return { title: 'Job at Lever', company: 'Lever' };
      if (domain.includes('greenhouse')) return { title: 'Job at Greenhouse', company: 'Greenhouse' };
      if (domain.includes('workday')) return { title: 'Role at Workday', company: 'Target Company' };
      return { title: 'Software Role', company: 'Target Company' };
    };

    let cheerioExtractedText = "";
    let basicJobData: any = { url };

    // Step 1: Attempt quick Cheerio DOM scraping to extract any immediate markup
    try {
      const fetchWithOptions = async (retryCount = 0) => {
        try {
          return await axios.get(url, {
            timeout: 8000,
            validateStatus: (status) => status < 500,
            headers: getHeaders(url)
          });
        } catch (err: any) {
          if (retryCount < 1) {
            await new Promise(r => setTimeout(r, 1000));
            return fetchWithOptions(retryCount + 1);
          }
          throw err;
        }
      };

      const response = await fetchWithOptions();

      if (response.status === 200 && response.data && typeof response.data === 'string') {
        const $ = cheerio.load(response.data);
        
        let jsonLdData: any = null;
        $('script[type="application/ld+json"]').each((_, el) => {
          try {
            const content = $(el).html() || '';
            const json = JSON.parse(content);
            const findJobPosting = (obj: any): any => {
              if (Array.isArray(obj)) {
                for (const item of obj) {
                  const result = findJobPosting(item);
                  if (result) return result;
                }
              } else if (obj && typeof obj === 'object') {
                if (obj['@type'] === 'JobPosting') return obj;
                if (obj['@graph']) return findJobPosting(obj['@graph']);
              }
              return null;
            };
            const found = findJobPosting(json);
            if (found) { jsonLdData = found; return false; }
          } catch (e) {}
        });

        const isLinkedIn = urlLower.includes('linkedin.com/jobs');
        
        basicJobData = {
          title: jsonLdData?.title || 
                 $("meta[property='og:title']").attr("content") || 
                 $("meta[name='twitter:title']").attr("content") ||
                 $("h1").first().text().trim() ||
                 $(isLinkedIn ? ".top-card-layout__title" : "title").text().split('|')[0].trim() || 
                 "",
          description: jsonLdData?.description?.replace(/<[^>]*>?/gm, '') || 
                      $("#job-description").text() ||
                      $(".job-description").text() ||
                      $(".show-more-less-html__markup").text() ||
                      $(".job-details-content").text() ||
                      $(".description__text").text() ||
                      $("#jobDescriptionText").text() ||
                      "",
          company: jsonLdData?.hiringOrganization?.name || 
                   $("meta[property='og:site_name']").attr("content") || 
                   $(".company-name").first().text().trim() ||
                   $(".topcard__org-name-link").first().text().trim() ||
                   $(".employer-name").text().trim() ||
                   "",
          recruiter_url: $(".jobs-poster__name-link").attr("href") || 
                         $(".app-aware-link[href*='/in/']").first().attr("href") || 
                         "",
          recruiter_name: $(".jobs-poster__name-link").text().trim() || 
                          $(".jobs-poster__name").text().trim() || 
                          "",
          url: url
        };

        $("script, style, nav, footer, noscript, svg, header").remove();
        const mainContent = $("main").text() || $("article").text() || $("body").text();
        cheerioExtractedText = mainContent.replace(/\s+/g, " ").trim().substring(0, 10000);
      }
    } catch (scrapeErr: any) {
      console.log(`[Scraper] Initial DOM scrape note: ${scrapeErr.message}`);
    }

    // Step 2: Elevate with Google Search Grounding to bypass login walls, extract full verified requirements & recruiter info
    if (ai) {
      try {
        console.log(`[Scraper] Using Google Search Grounding for target job URL: ${url}`);
        const groundingPrompt = `You are a real-time web scraping and talent verification intelligence engine with Google Search Grounding.
Use Google Search Grounding to verify and extract the complete, live job details for this target job URL: "${url}".

Context from initial DOM pass:
- Scraped Title Hint: ${basicJobData.title || 'Unknown'}
- Scraped Company Hint: ${basicJobData.company || 'Unknown'}
- Scraped Snippet: ${cheerioExtractedText.substring(0, 1500)}

INSTRUCTIONS:
1. Search the web for this exact job posting URL or role listing to pull the authoritative, full posting.
2. Extract:
   - title: Official job title
   - company: Hiring organization name
   - location: City/State, Country, or "Remote"
   - workplaceType: "Remote" | "Hybrid" | "On-site" | "Unspecified"
   - seniority: "Entry" | "Mid-Level" | "Senior" | "Staff / Principal" | "Executive"
   - salaryEstimate: Salary compensation range if published or realistic market estimate (e.g. "$160k - $210k / yr")
   - description: Comprehensive, structured job description detailing team mission, day-to-day responsibilities, required qualifications, and tech stack.
   - recruiter_name: Name of hiring manager, recruiter, or talent acquisition specialist associated with this post/team (or empty string if none)
   - recruiter_url: LinkedIn profile URL of recruiter or careers page URL (or empty string)

Return ONLY a valid JSON object matching the requested schema.`;

        const response = await generateGeminiContent({
          contents: groundingPrompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                workplaceType: { type: Type.STRING },
                seniority: { type: Type.STRING },
                salaryEstimate: { type: Type.STRING },
                description: { type: Type.STRING },
                recruiter_name: { type: Type.STRING },
                recruiter_url: { type: Type.STRING }
              },
              required: ["title", "company", "description"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          const { sources, searchQueries } = extractGroundingSources(response);
          
          const resultJob = {
            title: parsed.title || basicJobData.title || "Job Posting",
            company: parsed.company || basicJobData.company || "Target Company",
            location: parsed.location || "Remote / Unspecified",
            workplaceType: parsed.workplaceType || "Remote",
            seniority: parsed.seniority || "Senior",
            salaryEstimate: parsed.salaryEstimate || "Competitive",
            description: parsed.description || basicJobData.description || cheerioExtractedText || "Job details verified via Google Search Grounding.",
            recruiter_name: parsed.recruiter_name || basicJobData.recruiter_name || "",
            recruiter_url: parsed.recruiter_url || basicJobData.recruiter_url || "",
            url: url,
            groundingSources: sources,
            searchQueries: searchQueries,
            isGoogleSearchGrounded: true
          };

          console.log(`[Scraper] Successfully grounded job posting: ${resultJob.title} at ${resultJob.company} (${sources.length} sources)`);
          return res.json(resultJob);
        }
      } catch (groundingErr: any) {
        console.warn("[Scraper Google Grounding Fallback]", groundingErr.message);
      }
    }

    // Step 3: DOM Fallback if AI grounding is unavailable
    const hint = getMetadataHint(urlLower);
    const fallbackTitle = (basicJobData.title || hint.title).replace(/\s+/g, ' ').trim();
    const fallbackCompany = (basicJobData.company || hint.company).replace(/\s+/g, ' ').trim();
    const fallbackDescription = (basicJobData.description || cheerioExtractedText || "Scraped job specifications.").replace(/\s+/g, ' ').trim();

    return res.json({
      title: fallbackTitle,
      company: fallbackCompany,
      description: fallbackDescription.substring(0, 6000),
      recruiter_name: basicJobData.recruiter_name || "",
      recruiter_url: basicJobData.recruiter_url || "",
      url: url,
      isGoogleSearchGrounded: false
    });
  });

  // API Route: Handle Resume Parsing (Binary files)
  app.post("/api/upload-resume", upload.single("resume"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let extractedText = "";
      const buffer = req.file.buffer;
      const mimetype = req.file.mimetype;

      if (mimetype === "application/pdf") {
        if (typeof parsePDF !== 'function') {
          throw new Error("PDF parsing engine not correctly initialized. Please try again or use text paste.");
        }
        const data = await parsePDF(buffer);
        extractedText = data.text;
      } else if (
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimetype === "application/msword"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (mimetype === "text/plain") {
        extractedText = buffer.toString("utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload PDF, DOCX, or TXT." });
      }

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("Could not extract text from file");
      }

      res.json({ text: extractedText });
    } catch (error: any) {
      console.error("Resume parsing error:", error);
      res.status(500).json({ error: error.message || "Failed to parse resume file" });
    }
  });

  // API Route: Handle Resume Parsing (Proxy or local logic)
  // Note: Gemini skill says call from frontend, but parsing binary PDFs might be better here
  // then sending text to frontend for Gemini processing.
  app.post("/api/parse-resume-text", async (req, res) => {
    try {
      const { base64Resume } = req.body;
      res.json({ message: "Resume received" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process resume" });
    }
  });

  // API Route: AI-Powered Job Scrape & Skill Analysis Engine
  app.post("/api/analyze-job-skills", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }

    const { url, keywords, rawDescription, userProfile } = req.body;
    if (!url && !keywords && !rawDescription) {
      return res.status(400).json({ error: "Please provide a job URL, search keywords, or job description text." });
    }

    let extractedJobContent = rawDescription || "";
    let sourceMeta: { title?: string; company?: string; url?: string } = { url };

    // 1. If URL provided, scrape it
    if (url && !rawDescription) {
      const urlLower = url.toLowerCase();
      try {
        const fetchResponse = await axios.get(url, {
          timeout: 12000,
          validateStatus: (status) => status < 500,
          headers: getHeaders(url)
        });

        if (fetchResponse.status === 200 && fetchResponse.data) {
          const $ = cheerio.load(fetchResponse.data);

          // Check JSON-LD
          let jsonLdJob: any = null;
          $('script[type="application/ld+json"]').each((_, el) => {
            try {
              const content = $(el).html() || '';
              const json = JSON.parse(content);
              const findJob = (obj: any): any => {
                if (Array.isArray(obj)) {
                  for (const item of obj) {
                    const r = findJob(item);
                    if (r) return r;
                  }
                } else if (obj && typeof obj === 'object') {
                  if (obj['@type'] === 'JobPosting') return obj;
                  if (obj['@graph']) return findJob(obj['@graph']);
                }
                return null;
              };
              const found = findJob(json);
              if (found) { jsonLdJob = found; return false; }
            } catch (e) {}
          });

          if (jsonLdJob) {
            sourceMeta.title = jsonLdJob.title;
            sourceMeta.company = jsonLdJob.hiringOrganization?.name;
            extractedJobContent = `
Job Title: ${jsonLdJob.title || ''}
Company: ${jsonLdJob.hiringOrganization?.name || ''}
Location: ${jsonLdJob.jobLocation?.address?.addressLocality || ''} ${jsonLdJob.jobLocation?.address?.addressRegion || ''}
Description: ${jsonLdJob.description || ''}
            `.trim();
          } else {
            // Cheerio text cleanup
            $("script, style, nav, footer, noscript, svg, header").remove();
            const mainContent = $("main").text() || $("article").text() || $(".job-description").text() || $("#job-description").text() || $("body").text();
            extractedJobContent = mainContent.replace(/\s+/g, " ").trim().substring(0, 15000);
            sourceMeta.title = $("meta[property='og:title']").attr("content") || $("h1").first().text().trim() || $("title").text().trim();
            sourceMeta.company = $("meta[property='og:site_name']").attr("content") || $(".company-name").first().text().trim();
          }
        }
      } catch (scrapeErr: any) {
        console.warn("[Scraper Warn in analyze-job-skills]", scrapeErr.message);
      }
    }

    try {
      const candidateContext = userProfile ? `
CANDIDATE PROFILE FOR SKILL BENCHMARKING & GAP ANALYSIS:
- Name: ${userProfile.name || 'Candidate'}
- Current Headline: ${userProfile.headline || 'Software Professional'}
- Current Skills: ${(userProfile.skills || []).join(', ')}
- Work Experience Summary: ${(userProfile.experience || []).map((e: any) => `${e.role} at ${e.company} (${e.duration}): ${(e.highlights || []).slice(0, 2).join('; ') || e.description || ''}`).join('\n')}
- Bio: ${userProfile.bio || ''}
      ` : 'No candidate profile provided. Provide general best practices for applicants.';

      const prompt = `You are a Principal Talent Intelligence AI, Senior Technical Recruiter, and Staff Hiring Manager powered with real-time Google Search Grounding.
Your task is to analyze the target job opportunity using live Google Search Grounding when relevant, extract an exhaustive and categorized technical & soft skills matrix, and perform a rigorous skill-gap & interview battleplan analysis.

SOURCE INFORMATION:
${url ? `Target Job URL: ${url}` : ''}
${keywords ? `Search Keywords / Role Query: ${keywords}` : ''}
${sourceMeta.title ? `Scraped Title Hint: ${sourceMeta.title}` : ''}
${sourceMeta.company ? `Scraped Company Hint: ${sourceMeta.company}` : ''}

EXTRACTED JOB CONTENT / QUERY:
"""
${extractedJobContent || keywords || 'Use Google Search Grounding to verify recent open roles, requirements, and engineering expectations.'}
"""

${candidateContext}

INSTRUCTIONS:
1. Grounding & Job Details:
   - Use Google Search Grounding to verify current, up-to-date role specifications, engineering stack standards, and company mission if the extracted snippet is minimal.
   - Extract or synthesize high-fidelity Job Details (Title, Company, Location, Workplace Type [Remote/Hybrid/On-site/Unspecified], Seniority Level, estimated competitive market salary range, and a concise 2-sentence executive summary).
2. Deconstruct the Skills Analysis:
   - Identify all "mustHaveSkills" (with category, importance [Critical vs High], and why it's needed).
   - Identify all "niceToHaveSkills" (bonus / differentiator technologies).
   - Group all identified technical and soft skills into structured "skillCategories" (e.g. Frontend, Backend, Cloud & Infrastructure, AI/ML, Architecture & Protocols, Tooling, Leadership).
   - List key concrete responsibilities.
   - Provide a 1-sentence tech stack summary overview.
3. Candidate Match & Gap Analysis:
   - Calculate an accurate, fair matchScore (0-100) comparing the candidate's existing skills/experience against the job requirements.
   - Assign matchTier: 'Exceptional Fit' (85-100), 'Strong Match' (70-84), 'Moderate Fit' (50-69), or 'Growth Opportunity' (<50).
   - Identify exactly which skills in the candidate profile matched the job.
   - Highlight missing skills or potential gaps with actionable advice on how the candidate can bridge or explain them.
   - Highlight candidate's transferable strengths that compensate for gaps.
   - Provide 3-4 specific resume tailoring tips.
   - Provide 3-4 high-impact talking points for recruiter screens.
   - Generate 3 likely probing interview questions the employer will ask based on their stack and requirements, along with the ideal angle to answer.

Return ONLY a valid JSON object matching the schema.`;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              job: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  workplaceType: { type: Type.STRING, description: "Remote, Hybrid, On-site, or Unspecified" },
                  seniority: { type: Type.STRING, description: "Entry, Mid-Level, Senior, Staff / Principal, or Executive" },
                  salaryEstimate: { type: Type.STRING, description: "Estimated market salary range e.g. $160k - $210k / yr" },
                  summary: { type: Type.STRING, description: "2-sentence executive summary of the role and team mission" },
                  fullDescription: { type: Type.STRING, description: "Clean formatted overview of the job" },
                  url: { type: Type.STRING }
                },
                required: ["title", "company", "location", "workplaceType", "seniority", "summary"]
              },
              skillsAnalysis: {
                type: Type.OBJECT,
                properties: {
                  mustHaveSkills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        importance: { type: Type.STRING, description: "Critical or High" },
                        description: { type: Type.STRING }
                      },
                      required: ["name", "category", "importance"]
                    }
                  },
                  niceToHaveSkills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["name", "category"]
                    }
                  },
                  skillCategories: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["category", "skills"]
                    }
                  },
                  responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  techStackOverview: { type: Type.STRING }
                },
                required: ["mustHaveSkills", "niceToHaveSkills", "skillCategories", "responsibilities", "techStackOverview"]
              },
              candidateMatch: {
                type: Type.OBJECT,
                properties: {
                  matchScore: { type: Type.NUMBER, description: "Match score percentage from 0 to 100" },
                  matchTier: { type: Type.STRING, description: "Exceptional Fit, Strong Match, Moderate Fit, or Growth Opportunity" },
                  matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingSkills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        priority: { type: Type.STRING, description: "Critical, High, or Medium" },
                        recommendation: { type: Type.STRING, description: "How candidate can address this gap in applications/interviews" }
                      },
                      required: ["name", "priority", "recommendation"]
                    }
                  },
                  alignmentSummary: { type: Type.STRING },
                  transferableStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resumeTailoringAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedTalkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  interviewQuestionsToExpect: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        category: { type: Type.STRING },
                        recommendedAngle: { type: Type.STRING }
                      },
                      required: ["question", "category", "recommendedAngle"]
                    }
                  }
                },
                required: ["matchScore", "matchTier", "matchedSkills", "missingSkills", "alignmentSummary"]
              }
            },
            required: ["job", "skillsAnalysis"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Gemini returned empty response. Please try again.");
      }

      const parsed = JSON.parse(response.text);
      if (url && !parsed.job.url) {
        parsed.job.url = url;
      }

      const { sources, searchQueries } = extractGroundingSources(response);
      parsed.groundingSources = sources;
      parsed.searchQueries = searchQueries;
      parsed.isGoogleSearchGrounded = true;
      if (parsed.job) {
        parsed.job.groundingSources = sources;
        parsed.job.isGoogleSearchGrounded = true;
      }

      res.json(parsed);
    } catch (err: any) {
      console.error("[Job Analysis Error]", err);
      res.status(500).json({ error: err.message || "Failed to analyze job skills." });
    }
  });

  // API Route: Extract Job from Text
  app.post("/api/extract-job", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    try {
      const response = await generateGeminiContent({
        contents: `Extract job details from this text input. 
        Return ONLY a JSON object with: { "title": string, "company": string, "description": string, "recruiter_name": string, "recruiter_url": string }.
        If not found, use logical guesses based on the content or leave empty.
        
        INPUT: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              description: { type: Type.STRING },
              recruiter_name: { type: Type.STRING, description: "Optional name of the recruiter or contact person if mentioned" },
              recruiter_url: { type: Type.STRING, description: "Optional LinkedIn or social URL of the recruiter if mentioned" }
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("Gemini returned an empty response. Please try again.");
      }
      res.json(JSON.parse(response.text));
    } catch (e: any) {
      console.error("Job Extraction Error:", e);
      res.status(500).json({ error: e.message || "Failed to extract job details" });
    }
  });

  // API Route: Parse Resume
  app.post("/api/parse-resume-json", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    try {
      const response = await generateGeminiContent({
        contents: `You are an expert HR Technology AI and Executive Resume Parser.
Analyze the following resume/candidate text and extract comprehensive, structured profile data with high fidelity:

RESUME TEXT:
"""
${resumeText}
"""

TASK:
1. Extract the candidate's full name, professional headline, contact details (email, phone, location), and links (LinkedIn, GitHub, Portfolio).
2. Synthesize a concise, high-impact 2-3 sentence professional biography/summary.
3. Extract an exhaustive list of all specific skills, technologies, frameworks, cloud tools, languages, and methodologies mentioned. Group them logically into skillCategories.
4. Extract each work experience entry with exact role title, company name, duration/dates, location, a brief overview description, and key achievement bullet points (highlights).
5. Extract education history including degree, institution/school, and graduation year/timeframe.

Return strictly formatted JSON matching the schema.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Full Name of the candidate" },
              headline: { type: Type.STRING, description: "Professional Title or Current Headline, e.g. Senior Full-Stack Engineer" },
              email: { type: Type.STRING, description: "Email address if found" },
              phone: { type: Type.STRING, description: "Phone number if found" },
              location: { type: Type.STRING, description: "Location, city, state, or remote status" },
              bio: { type: Type.STRING, description: "Professional summary or biographical elevator pitch" },
              skills: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of individual skill names (e.g. ['TypeScript', 'React', 'AWS', 'PostgreSQL'])"
              },
              skillCategories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "Category name e.g. Languages, Frontend, Backend, Cloud & DevOps, AI/ML" },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["category", "skills"]
                }
              },
              experience: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING, description: "Job title / role" },
                    company: { type: Type.STRING, description: "Company or organization name" },
                    duration: { type: Type.STRING, description: "Date range or duration, e.g. 2021 - Present" },
                    location: { type: Type.STRING, description: "Location of the job if noted" },
                    description: { type: Type.STRING, description: "Brief role summary" },
                    highlights: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "Key achievement bullet points with quantifiable impact"
                    }
                  },
                  required: ["role", "company", "duration"]
                } 
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING, description: "Degree name e.g. B.S. in Computer Science" },
                    school: { type: Type.STRING, description: "University or institution name" },
                    year: { type: Type.STRING, description: "Graduation year or dates" }
                  },
                  required: ["degree", "school"]
                }
              },
              links: {
                type: Type.OBJECT,
                properties: {
                  linkedin: { type: Type.STRING },
                  github: { type: Type.STRING },
                  portfolio: { type: Type.STRING },
                  twitter: { type: Type.STRING }
                }
              }
            },
            required: ["name", "skills", "experience"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Gemini returned an empty response. Please try again.");
      }
      res.json(JSON.parse(response.text));
    } catch (e: any) {
      console.error("Resume Parsing Error:", e);
      res.status(500).json({ error: e.message || "Failed to parse resume" });
    }
  });

  // API Route: Simulate Recruiter Chat
  app.post("/api/simulate-chat", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { history, jobData } = req.body;
    if (!history || !jobData) {
      return res.status(400).json({ error: "history and jobData are required" });
    }

    try {
      const lastMessage = history[history.length - 1]?.text || "Hello";
      const contents = history.map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }));

      const response = await generateGeminiContent({
        contents,
        config: {
          systemInstruction: `You are a tough but fair technical recruiter for the following job: ${JSON.stringify(jobData)}. 
          Your goal is to interview the candidate. Ask challenging questions about their experience, "Why this role?", and salary expectations. 
          Be professional and structured. Give feedback after each response if asked, but stay in character.`
        }
      });

      res.json({ text: response.text || "" });
    } catch (e: any) {
      console.error("Chat Simulation Error:", e);
      res.status(500).json({ error: e.message || "Failed to simulate chat" });
    }
  });

  // API Route: Evaluate Simulator Response
  app.post("/api/evaluate-simulator", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { history, jobData } = req.body;
    if (!history || !jobData) {
      return res.status(400).json({ error: "history and jobData are required" });
    }

    try {
      const prompt = `
        Job Data: ${JSON.stringify(jobData)}
        Conversation History: ${JSON.stringify(history)}

        Task: You are an expert interview coach. Analyze the user's latest response in the context of the conversation and the job description.
        Provide a score between 0 and 100 for their latest response, along with specific feedback on what they did well and how they can improve.
        Consider the recruiter's persona (tough but fair technical recruiter) and the job requirements.
      `;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "A score from 0-100 indicating the quality of the response." },
              feedback: { type: Type.STRING, description: "Overall feedback on the response." },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific things the user did well." },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific ways the user can improve." }
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("Gemini returned an empty response. Please try again.");
      }
      res.json(JSON.parse(response.text));
    } catch (e: any) {
      console.error("Evaluation Error:", e);
      res.status(500).json({ error: e.message || "Failed to evaluate response" });
    }
  });

  // API Route: Generate Outreach
  app.post("/api/generate-outreach", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { jobData, resumeData, recruiterPost } = req.body;
    
    if (!jobData || !resumeData) {
      return res.status(400).json({ error: "jobData and resumeData are required" });
    }

    try {
      const prompt = `
        Job Data: ${JSON.stringify(jobData)}
        Candidate Data: ${JSON.stringify(resumeData)}
        ${recruiterPost ? `Recruiter's Recent Post: ${recruiterPost}` : ''}
        Task: Generate a hyper-personalized cold email and LinkedIn DM.
        If a recruiter post is provided, reference it naturally.
        Keep the tone professional but engaging.
        IMPORTANT: Search for recent news about the company (${jobData.company || "the company"}) or industry trends to ground your suggestions. Use this information to make the outreach highly relevant and timely.
      `;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              email_subject: { type: Type.STRING },
              cold_email: { type: Type.STRING },
              linkedin_dm: { type: Type.STRING },
              linkedin_connection_request: { 
                type: Type.STRING,
                description: "A short, personalized LinkedIn connection request (max 300 characters)"
              },
              follow_ups: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "A sequence of 3 follow-up messages"
              },
              matchScore: { 
                type: Type.NUMBER,
                description: "A score from 0-100 indicating how well the candidate matches the job"
              },
              improvementSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Suggestions for improving the resume to better match this specific job based on trends"
              },
              search_insights: {
                type: Type.STRING,
                description: "A brief summary of the real-time company news or industry trends found via Google Search that informed the outreach"
              }
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("Gemini returned an empty response. Please try again.");
      }
      
      res.json(JSON.parse(response.text));
    } catch (e: any) {
      console.error("Outreach Generation Error:", e);
      res.status(500).json({ error: e.message || "Failed to generate outreach" });
    }
  });

  // API Route: Generate Custom Outreach Template with Placeholders
  app.post("/api/generate-email-template", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { prompt, category, audience, tone } = req.body;
    if (!prompt && !category) {
      return res.status(400).json({ error: "Prompt or category is required" });
    }

    try {
      const templatePrompt = `You are a world-class cold outreach copywriter and executive career strategist.
Create an exceptionally high-converting cold email template for job seekers, embedding clear handlebars-style placeholders for dynamic job and candidate details.

PARAMETERS:
- Strategy / User Goal: "${prompt || category || 'High-impact cold email'}"
- Target Category: "${category || 'hiring_manager'}"
- Target Audience: "${audience || 'Hiring Managers'}"
- Desired Tone: "${tone || 'Direct & Punchy'}"

PLACEHOLDER STANDARDS:
Use these standard double-brace placeholders in both subject and body where appropriate:
- {{company_name}} - Target company
- {{job_title}} - Open role title
- {{seniority_level}} - Role seniority
- {{recruiter_name}} - Full name of contact
- {{recruiter_first_name}} - First name of contact
- {{recruiter_title}} - Contact's title
- {{candidate_name}} - Applicant's full name
- {{candidate_headline}} - Professional title
- {{years_experience}} - Years of experience
- {{current_company}} - Current/previous company
- {{top_matching_skill}} - Strongest technical overlap
- {{key_requirement_1}} - Primary skill required
- {{key_requirement_2}} - Secondary skill required
- {{key_achievement}} - Quantifiable metric or impact
- {{company_product}} - Product, feature, or mission
- {{recent_company_news}} - Recent launch or milestone
- {{relevant_project}} - Project or repo name
- {{portfolio_url}} - Portfolio link
- {{github_url}} - GitHub link
- {{linkedin_url}} - LinkedIn link
- {{call_to_action}} - Closing question/call to action

REQUIREMENTS:
1. Title: Catchy, descriptive 3-6 word template title.
2. Description: 1-2 sentence explanation of when and why to use this template.
3. Subject: High open-rate subject line with 1-2 strategic placeholders.
4. Body: Highly structured, readable email body (120-220 words) with strategic placeholders naturally woven in. Avoid clichés like "I hope this email finds you well" or "My name is...".
5. Tags: 3-5 relevant keyword tags.

Return ONLY a JSON object matching the requested schema.`;

      const response = await generateGeminiContent({
        contents: templatePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
              tone: { type: Type.STRING },
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "subject", "body", "tags"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Gemini returned an empty template response.");
      }
      res.json(JSON.parse(response.text));
    } catch (e: any) {
      console.error("[Template Generation Error]", e);
      res.status(500).json({ error: e.message || "Failed to generate email template" });
    }
  });

  // API Route: Refine Existing Template with AI
  app.post("/api/refine-email-template", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { subject, body, refinementGoal, targetTone } = req.body;
    if (!body) {
      return res.status(400).json({ error: "Body is required to refine" });
    }

    try {
      const refinePrompt = `You are a master email conversion specialist.
Refine and enhance the following outreach template according to the requested refinement goal while STRICTLY PRESERVING the existing double-bracket placeholders (such as {{company_name}}, {{job_title}}, {{recruiter_first_name}}, {{top_matching_skill}}, etc.).

CURRENT SUBJECT:
${subject || '(None provided)'}

CURRENT BODY:
${body}

REFINEMENT GOAL:
${refinementGoal || 'Make it sharper, more compelling, and improve response rate'}

TARGET TONE:
${targetTone || 'Direct & Value-Oriented'}

RULES:
- Preserve all existing {{placeholder}} syntax.
- Make the hook stronger, tighten phrasing, improve readability, and strengthen the call to action.
- Return refined subject, refined body, and a brief bullet list of what improvements were made.

Return ONLY a JSON object.`;

      const response = await generateGeminiContent({
        contents: refinePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refinedSubject: { type: Type.STRING },
              refinedBody: { type: Type.STRING },
              improvementsSummary: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["refinedSubject", "refinedBody", "improvementsSummary"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Gemini returned empty response.");
      }
      res.json(JSON.parse(response.text));
    } catch (e: any) {
      console.error("[Template Refinement Error]", e);
      res.status(500).json({ error: e.message || "Failed to refine template" });
    }
  });

  // API Route: Suggest Subject Lines
  app.post("/api/suggest-subject-lines", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { body, currentSubject, audience, tone } = req.body;

    try {
      const prompt = `Generate 4 high open-rate subject lines for this outreach email template.
Use relevant {{placeholders}} (e.g. {{candidate_name}}, {{job_title}}, {{company_name}}, {{top_matching_skill}}, {{years_experience}}).
AUDIENCE: ${audience || 'Hiring Manager'}
TONE: ${tone || 'Direct & Punchy'}
BODY CONTEXT:
${body || ''}

Return JSON with an array of subject suggestions, each with the subject text and a rationale/angle (e.g. "Curiosity Hook", "Proof of Work", "Direct Requisition", "Value Drop").`;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    angle: { type: Type.STRING }
                  },
                  required: ["subject", "angle"]
                }
              }
            },
            required: ["suggestions"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response");
      }
      res.json(JSON.parse(response.text));
    } catch (e: any) {
      console.error("[Subject Line Suggestions Error]", e);
      res.status(500).json({ error: e.message || "Failed to suggest subject lines" });
    }
  });

  // InnovationOS: Venture Spawning
  app.post("/api/spawn-venture", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { problemStatement } = req.body;
    if (!problemStatement) {
      return res.status(400).json({ error: "problemStatement is required" });
    }

    try {
      const response = await generateGeminiContent({
        contents: `You are an elite autonomous venture generation AI. The user has provided the following problem statement or thesis:
"${problemStatement}"

Instantly generate a highly detailed, technologically advanced, and credible startup blueprint. Provide the response as a JSON object matching this exact schema:
{
  "name": "Startup Name",
  "thesis": "A 1-2 sentence compelling thesis statement",
  "market": "TAM / Overview",
  "tam": "Estimated TAM in $ (e.g. $120B)",
  "sam": "Estimated SAM in $",
  "som": "Estimated SOM in $",
  "competitors": ["Comp 1", "Comp 2", "Comp 3"],
  "timeline": "e.g., 14 Days to MVP",
  "valuation": "Estimated initial valuation (e.g. $4.5M)",
  "dna": ["Skill 1", "Skill 2"],
  "verdict": "A brief sentence on viability",
  "score": 88
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              thesis: { type: Type.STRING },
              market: { type: Type.STRING },
              tam: { type: Type.STRING },
              sam: { type: Type.STRING },
              som: { type: Type.STRING },
              competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
              timeline: { type: Type.STRING },
              valuation: { type: Type.STRING },
              dna: { type: Type.ARRAY, items: { type: Type.STRING } },
              verdict: { type: Type.STRING },
              score: { type: Type.NUMBER }
            },
            required: ["name", "thesis", "market", "tam", "sam", "som", "competitors", "timeline", "valuation", "dna", "verdict", "score"]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      res.json(data);
    } catch (e: any) {
      console.error("Venture Spawn Error:", e);
      res.status(500).json({ error: e.message || "Failed to generate venture" });
    }
  });

  // InnovationOS: AI Execution Engine (CTO, PM, Growth, etc)
  app.post("/api/ai-execute", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { role, task, context } = req.body;
    if (!role || !task) {
      return res.status(400).json({ error: "role and task are required" });
    }

    try {
      const response = await generateGeminiContent({
        contents: `You are the ${role} of an elite startup.
Your context: ${context}

Your task: ${task}

Provide your output as detailed, high-quality Markdown, ready to be presented in a command center.`
      });

      res.json({ output: response.text || "Task executed successfully." });
    } catch (e: any) {
      console.error("AI Execute Error:", e);
      // Fallback synthesis if all upstream model calls fail during temporary high demand
      const fallbackMarkdown = `# ⚡ ${role} Execution Dossier

**Active Mission**: ${task}
**Venture Context**: ${context || "Autonomous Venture Matrix"}

---

### 1. Executive Directive & Strategy
- **Core Vector**: Rapid parallel execution of technical architecture and validation milestones.
- **Operational Focus**: High fault tolerance, zero-latency feedback loops, and automated scaling telemetry.

### 2. Tactical Plan & Deliverables
- **Architecture**: Modular system components with defined SLA metrics and self-healing endpoints.
- **Milestones**: Continuous automated integration with structured validation checkpoints.

### 3. Immediate Action Vectors
- Deploy automated telemetry monitors and pipeline verification agents.
- Execute next sprint objectives with full stakeholder reporting.

*Generated autonomously via InnovationOS AI Matrix*`;
      res.json({ output: fallbackMarkdown });
    }
  });

  // Automated Workflow: AI Agent Interview Preparation Generator
  app.post("/api/generate-interview-prep", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const {
      targetId,
      targetType,
      targetName,
      subtitle,
      tags,
      capOrSalary,
      jobDescription,
      candidateProfile,
      notes
    } = req.body;

    try {
      const prompt = `You are a Principal Engineering Director, Elite Technical Recruiter, and System Architecture Coach.
A candidate's pipeline status just transitioned to 'Interview' / 'Interviewing' for the following target:

Target Type: ${targetType || 'project'}
Target Name: ${targetName || 'Key Technical Venture'}
Subtitle / Role: ${subtitle || 'Principal Systems Architect / Core Lead'}
Tags & Tech Stack: ${Array.isArray(tags) ? tags.join(', ') : (tags || 'AI, Distributed Systems, Cloud')}
Valuation / Target Cap: ${capOrSalary || 'N/A'}
Job or Project Context: ${jobDescription || notes || 'Advanced distributed technology initiative with high scalability and reliability mandates.'}
${candidateProfile ? `Candidate Profile Context: ${JSON.stringify(candidateProfile)}` : ''}

TASK: Generate a comprehensive, high-signal, expert-level Interview Preparation Dossier for this candidate.
Synthesize:
1. Executive Role Summary & target competencies
2. High-impact Technical & System Design questions (with interviewer mindset, key buzzwords/concepts, and structured sample answer blueprint)
3. Behavioral & Leadership questions (STAR frameworks, trade-offs, pitfalls to avoid)
4. Tough probing / edge-case questions that senior interviewers love to ask
5. Strategic tactical prep tips across pre-interview, live execution, and offer leverage
6. High-signal reverse questions to ask the interviewer
7. Simulation seed prompt for live mock practice

Return the response in strict JSON matching the schema below.`;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              targetId: { type: Type.STRING },
              targetType: { type: Type.STRING },
              targetName: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              roleSummary: { type: Type.STRING },
              keyCompetencies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING }
                  },
                  required: ["name", "description", "priority"]
                }
              },
              technicalQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    category: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    whyTheyAsk: { type: Type.STRING },
                    keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    sampleAnswerFramework: { type: Type.STRING }
                  },
                  required: ["id", "question", "category", "difficulty", "whyTheyAsk", "keyConcepts", "sampleAnswerFramework"]
                }
              },
              behavioralQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    category: { type: Type.STRING },
                    idealAnswerApproach: { type: Type.STRING },
                    redFlagsToAvoid: { type: Type.STRING }
                  },
                  required: ["id", "question", "category", "idealAnswerApproach", "redFlagsToAvoid"]
                }
              },
              toughProbingQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    scenario: { type: Type.STRING },
                    proTip: { type: Type.STRING }
                  },
                  required: ["id", "question", "scenario", "proTip"]
                }
              },
              strategicTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: { type: Type.STRING },
                    title: { type: Type.STRING },
                    tip: { type: Type.STRING },
                    impactLevel: { type: Type.STRING }
                  },
                  required: ["id", "category", "title", "tip", "impactLevel"]
                }
              },
              questionsToAskInterviewer: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["id", "question", "rationale", "category"]
                }
              },
              simulationSeed: {
                type: Type.OBJECT,
                properties: {
                  initialInterviewerGreeting: { type: Type.STRING },
                  persona: { type: Type.STRING },
                  primaryFocus: { type: Type.STRING }
                },
                required: ["initialInterviewerGreeting", "persona", "primaryFocus"]
              }
            },
            required: [
              "roleSummary",
              "keyCompetencies",
              "technicalQuestions",
              "behavioralQuestions",
              "toughProbingQuestions",
              "strategicTips",
              "questionsToAskInterviewer",
              "simulationSeed"
            ]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      parsed.id = parsed.id || `prep-${Date.now()}`;
      parsed.targetId = targetId || parsed.targetId || 'target';
      parsed.targetType = targetType || parsed.targetType || 'project';
      parsed.targetName = targetName || parsed.targetName || 'Venture';
      parsed.generatedAt = new Date().toISOString();

      res.json(parsed);
    } catch (e: any) {
      console.error("Interview Prep Generation Error:", e);
      res.status(500).json({ error: e.message || "Failed to generate interview preparation dossier" });
    }
  });

  // Feature: AI-Generated Interview Prep Questions Tailored Specifically to Missing Skills
  app.post("/api/generate-missing-skills-interview-prep", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const {
      missingSkills,
      jobDetails,
      candidateProfile,
      matchedSkills,
      focusSkill
    } = req.body;

    if (!missingSkills || !Array.isArray(missingSkills) || missingSkills.length === 0) {
      return res.status(400).json({ error: "missingSkills array is required" });
    }

    try {
      const skillsToProcess = focusSkill 
        ? missingSkills.filter((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase() === focusSkill.toLowerCase())
        : missingSkills;

      const skillsFormatted = (skillsToProcess.length > 0 ? skillsToProcess : missingSkills).map((s: any) => {
        if (typeof s === 'string') return `- Skill: ${s} (Priority: High)`;
        return `- Skill: ${s.name} (Priority: ${s.priority || 'High'}) | AI Note: ${s.recommendation || ''}`;
      }).join('\n');

      const jobContext = jobDetails ? `
TARGET JOB CONTEXT:
- Role Title: ${jobDetails.title || 'Target Role'}
- Company: ${jobDetails.company || 'Hiring Organization'}
- Seniority Level: ${jobDetails.seniority || 'Senior'}
- Workplace Type: ${jobDetails.workplaceType || 'Remote / Hybrid'}
- Tech Stack Overview: ${jobDetails.techStackOverview || ''}
- Key Responsibilities: ${(jobDetails.responsibilities || []).slice(0, 4).join('; ')}
` : 'No specific job context provided.';

      const candidateContext = candidateProfile ? `
CANDIDATE PROFILE CONTEXT:
- Name: ${candidateProfile.name || 'Candidate'}
- Headline: ${candidateProfile.headline || ''}
- Matched Strengths: ${(matchedSkills || candidateProfile.skills || []).slice(0, 10).join(', ')}
- Work History Summary: ${(candidateProfile.experience || []).slice(0, 2).map((e: any) => `${e.role} at ${e.company} (${e.duration})`).join('; ')}
` : 'Candidate profile available with general transferable experience.';

      const prompt = `You are a Principal Engineering Bar Raiser, Staff Technical Recruiter, and Interview Coach.
A candidate has completed a Skill Gap Analysis for this role and has identified specific MISSING SKILLS / UNVERIFIED COMPETENCIES.

${jobContext}

${candidateContext}

MISSING SKILLS TO PREPARE FOR:
${skillsFormatted}

TASK:
Generate comprehensive, realistic, and high-impact AI interview preparation questions tailored SPECIFICALLY to each of these missing skills and technical gaps.

For EACH missing skill:
1. Identify the gapType (e.g. "Architecture & Systems", "Data & Scalability", "Languages & Runtime", "DevOps & Cloud Infrastructure", "API & Protocols", "Security & Reliability", "Testing & Observability").
2. Synthesize 2 to 3 probing interview questions specifically designed to test the candidate on this missing technology or assess how they would handle real-world challenges with it.
3. For each question:
   - Provide "interviewerIntent": Why the interviewer is asking this and what exact risk they are testing.
   - Provide "difficulty": "Core Knowledge" | "Scenario & Tradeoffs" | "Architectural Deep-Dive".
   - Provide "bridgeStrategy": A concrete tactical formula on how the candidate can authentically pivot and bridge from their existing strengths and analog tools to this missing skill without claiming fake experience.
   - Provide "sampleModelAnswer": A high-scoring, authentic 4-6 sentence answer using the STAR/PAR bridge method.
   - Provide "keywordsToDrop": 4-6 high-signal domain terms, mechanisms, and architectural keywords to establish instant credibility.
   - Provide "pitfallsToAvoid": Common traps, defensive mistakes, or red-flag responses.
4. Provide "fastLearnerProofAngle": A strategic angle the candidate can use in conversation to prove they can ramp up on this skill in days.
5. Provide an overarching "generalDefenseStrategy" summarizing how to navigate all skill gaps with confidence in recruiter and technical interview rounds.

Return strictly formatted JSON matching the schema.`;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetRole: { type: Type.STRING },
              targetCompany: { type: Type.STRING },
              skillsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
              generalDefenseStrategy: { type: Type.STRING },
              prepGroups: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skillName: { type: Type.STRING },
                    priority: { type: Type.STRING, description: "Critical, High, or Medium" },
                    gapType: { type: Type.STRING },
                    fastLearnerProofAngle: { type: Type.STRING },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          skillName: { type: Type.STRING },
                          question: { type: Type.STRING },
                          category: { type: Type.STRING },
                          difficulty: { type: Type.STRING },
                          interviewerIntent: { type: Type.STRING },
                          bridgeStrategy: { type: Type.STRING },
                          sampleModelAnswer: { type: Type.STRING },
                          keywordsToDrop: { type: Type.ARRAY, items: { type: Type.STRING } },
                          pitfallsToAvoid: { type: Type.STRING }
                        },
                        required: ["id", "skillName", "question", "category", "difficulty", "interviewerIntent", "bridgeStrategy", "sampleModelAnswer", "keywordsToDrop", "pitfallsToAvoid"]
                      }
                    }
                  },
                  required: ["skillName", "priority", "gapType", "fastLearnerProofAngle", "questions"]
                }
              }
            },
            required: ["targetRole", "targetCompany", "skillsCovered", "prepGroups", "generalDefenseStrategy"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini.");
      }

      const parsed = JSON.parse(response.text.trim());
      parsed.id = `missing-prep-${Date.now()}`;
      parsed.generatedAt = new Date().toISOString();
      let totalQ = 0;
      (parsed.prepGroups || []).forEach((g: any) => {
        totalQ += (g.questions || []).length;
      });
      parsed.totalQuestions = totalQ;

      res.json(parsed);
    } catch (e: any) {
      console.error("[Missing Skills Prep Error]", e);
      res.status(500).json({ error: e.message || "Failed to generate missing skills interview prep" });
    }
  });

  // Feature: Evaluate Missing Skill Bridge Answer
  app.post("/api/evaluate-missing-skill-answer", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { question, skillName, userAnswer, bridgeStrategy, matchedSkills } = req.body;
    if (!question || !userAnswer || !skillName) {
      return res.status(400).json({ error: "question, skillName, and userAnswer are required" });
    }

    try {
      const prompt = `You are a Principal Engineering Bar Raiser evaluating a candidate's answer to an interview question about a MISSING SKILL / TECHNICAL GAP.

Target Missing Skill: "${skillName}"
Interview Question: "${question}"
Recommended Bridge Strategy: "${bridgeStrategy || 'Pivot authentically from transferable experience and explain rapid onboarding proof'}"
Candidate's Existing Matched Skills: ${(matchedSkills || []).join(', ')}

Candidate's Answer:
"${userAnswer}"

TASK:
Evaluate how effectively the candidate bridges this skill gap without sounding defensive or pretending to have fake production experience.
Assess:
1. Score (0-100) reflecting technical honesty, conceptual clarity, transferable bridge strength, and confidence.
2. Grade tier ('Flawless Bridge', 'Strong Defense', 'Needs Transferable Proof', 'Vulnerable to Probing').
3. Executive summary critique.
4. Top 3 strengths in the answer.
5. Critical gaps or vulnerabilities in their defense.
6. Suggested high-signal keywords that the candidate successfully included.
7. Missing high-signal keywords/concepts they should add.
8. Model refined answer showing the ideal 5-sentence delivery.`;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              grade: { type: Type.STRING },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              gapsInAnswer: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedKeywordsIncluded: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingHighSignalKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              modelRefinedAnswer: { type: Type.STRING }
            },
            required: ["score", "grade", "summary", "strengths", "gapsInAnswer", "suggestedKeywordsIncluded", "missingHighSignalKeywords", "modelRefinedAnswer"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (e: any) {
      console.error("[Missing Skill Answer Eval Error]", e);
      res.status(500).json({ error: e.message || "Failed to evaluate answer" });
    }
  });

  // Automated Workflow: Real-Time Interview Answer Evaluation & Coaching
  app.post("/api/evaluate-interview-answer", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI not initialized. Check GEMINI_API_KEY." });
    }
    const { question, category, userAnswer, contextData } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ error: "question and userAnswer are required" });
    }

    try {
      const prompt = `You are a Principal Interview Bar Raiser evaluating a candidate's answer.
Interview Context: ${JSON.stringify(contextData || {})}
Question Category: ${category || 'Technical / System Design'}
Question: "${question}"
Candidate's Live Answer: "${userAnswer}"

Evaluate this answer rigorously. Provide:
1. A realistic numerical score (0 to 100).
2. Grade tier ('Exceptional', 'Strong', 'Adequate', or 'Needs Work').
3. Constructive executive summary.
4. Top 3 strengths.
5. Top 3 concrete improvements (e.g. metrics, trade-offs, architecture patterns).
6. A high-scoring model answer that a Staff / Principal engineer would give.`;

      const response = await generateGeminiContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              grade: { type: Type.STRING },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              modelRefinedAnswer: { type: Type.STRING }
            },
            required: ["score", "grade", "summary", "strengths", "improvements", "modelRefinedAnswer"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (e: any) {
      console.error("Answer Evaluation Error:", e);
      res.status(500).json({ error: e.message || "Failed to evaluate answer" });
    }
  });

  // API 404 Fallback - ensures any unmatched /api call returns JSON, not HTML
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { port: 0 },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // Exclude /api from SPA catch-all
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler for /api routes to prevent HTML fallout
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error"
    });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`SignalHire AI running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. This can happen if the previous process didn't exit cleanly. Please wait a moment for the system to recover or try restarting.`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer();

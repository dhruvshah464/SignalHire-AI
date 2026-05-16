import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import mammoth from "mammoth";
import { createRequire } from "module";
import UserAgent from "user-agents";

const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");

dotenv.config();

// pdf-parse normalization
const parsePDF = typeof pdfModule === 'function' ? pdfModule : pdfModule.default || pdfModule;

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
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing. Background worker and some features will be disabled.");
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
      if ((lowerMsg.includes('column') && lowerMsg.includes('does not exist')) || lowerMsg.includes('schema cache')) {
        return;
      }
      console.error("[Worker Error]", msg);
    }
  }, 30000); // Check every 30 seconds for the demo

  // API Route: Search Jobs (RapidAPI JSearch / Remotive fallback / mock fallback)
  app.get("/api/search-jobs", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const key = process.env.RAPIDAPI_KEY;
    
    if (key) {
      try {
        const options = {
          method: 'GET',
          url: 'https://jsearch.p.rapidapi.com/search',
          params: {
            query: query as string,
            page: '1',
            num_pages: '1'
          },
          headers: {
            'X-RapidAPI-Key': key,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          }
        };

        const response = await axios.request(options);
        return res.json(response.data);
      } catch (error: any) {
        // Suppress expected subscription errors to keep logs clean
        if (error?.response?.status !== 403 && error?.response?.status !== 401) {
          console.error("[Job Search API Error]", error?.response?.data || error.message);
        }
        console.log("Using Remotive API as fallback...");
      }
    } else {
        console.log("No valid RAPIDAPI_KEY provided. Using Remotive API instead.");
    }

    try {
        // Fallback to free Remotive API
        const response = await axios.get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query as string)}`);
        const jobs = response.data.jobs || [];
        
        // Map Remotive jobs to JSearch expected format
        const mappedJobs = jobs.slice(0, 15).map((job: any) => ({
            job_id: job.id.toString(),
            job_title: job.title,
            employer_name: job.company_name,
            job_description: (job.description || '').replace(/<[^>]+>/g, '').substring(0, 500) + '...', // Strip HTML tags
            job_apply_link: job.url,
            job_publisher: 'Remotive'
        }));
        
        return res.json({ data: mappedJobs });
    } catch (fallbackError: any) {
      console.error("[Remotive Fallback Error]", fallbackError.message);
      
      // Final fallback to mock data
      return res.json({
        data: [
          {
            job_id: "mock-1",
            job_title: `Mock: ${query} Developer`,
            employer_name: "Mock Inc.",
            job_description: "Both primary and fallback APIs failed. This is a mock job description. We are looking for an experienced developer...",
            job_apply_link: "https://example.com/job/1"
          },
          {
            job_id: "mock-2",
            job_title: `Mock Senior ${query}`,
            employer_name: "Tech Corp",
            job_description: "Another mock job description. Join our fast-paced team to build awesome mock products.",
            job_apply_link: "https://example.com/job/2"
          }
        ]
      });
    }
  });

  // API Route: Scrape Job URL
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

    try {
      // Step 1: Try aggressive scraping with dynamic headers and user agents
      const fetchWithOptions = async (retryCount = 0) => {
        try {
          return await axios.get(url, {
            timeout: 10000,
            validateStatus: (status) => status < 500,
            headers: getHeaders(url)
          });
        } catch (err: any) {
          if (retryCount < 1) {
            console.log(`[Scraper] Request failed (${err.message}), retrying...`);
            await new Promise(r => setTimeout(r, 1500 * (retryCount + 1)));
            return fetchWithOptions(retryCount + 1);
          }
          throw err;
        }
      };

      let response = await fetchWithOptions();

      // Simple retry if likely blocked or captcha
      if (response.status === 403 || response.status === 429 || (typeof response.data === 'string' && response.data.includes('captcha'))) {
        console.log(`[Scraper] Block/Captcha detected (${response.status}), retrying with delay...`);
        await new Promise(r => setTimeout(r, 3000));
        response = await fetchWithOptions(1);
      }

      if (response.status !== 200 || !response.data || typeof response.data !== 'string') {
        throw new Error(`Upstream returned ${response.status}`);
      }

      const $ = cheerio.load(response.data);
      
      // Advanced extraction looking for JSON-LD JobPosting
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
          if (found) {
            jsonLdData = found;
            return false;
          }
        } catch (e) {}
      });

      const isLinkedIn = urlLower.includes('linkedin.com/jobs');
      
      let jobData: any = {
        title: jsonLdData?.title || 
               $("meta[property='og:title']").attr("content") || 
               $("meta[name='twitter:title']").attr("content") ||
               $("h1").first().text().trim() ||
               $(isLinkedIn ? ".top-card-layout__title" : "title").text().split('|')[0].trim() || 
               "Untitled Job",
        description: jsonLdData?.description?.replace(/<[^>]*>?/gm, '') || 
                    $("#job-description").text() ||
                    $(".job-description").text() ||
                    $(".show-more-less-html__markup").text() ||
                    $(".job-details-content").text() ||
                    $(".description__text").text() ||
                    $("#jobDescriptionText").text() ||
                    $(".jobsearch-JobComponent-description").text() ||
                    $(".job-view-layout").text() ||
                    $(".jobs-description").text() ||
                    $("meta[name='description']").attr("content") || 
                    "",
        company: jsonLdData?.hiringOrganization?.name || 
                 $("meta[property='og:site_name']").attr("content") || 
                 $(".company-name").first().text().trim() ||
                 $(".topcard__org-name-link").first().text().trim() ||
                 $(".employer-name").text().trim() ||
                 $(".top-card-layout__company-name").text().trim() ||
                 getMetadataHint(urlLower).company,
        recruiter_url: $(".jobs-poster__name-link").attr("href") || 
                       $(".app-aware-link[href*='/in/']").first().attr("href") || 
                       $(".jobs-poster").find("a").first().attr("href") ||
                       "",
        recruiter_name: $(".jobs-poster__name-link").text().trim() || 
                        $(".jobs-poster__name").text().trim() ||
                        $(".jobs-poster").find(".artdeco-entity-lockup__title").text().trim() ||
                        "",
        url: url
      };

      // Step 2: If critical data is missing, we return the raw text for frontend AI extraction
      if (!jobData.description || jobData.description.length < 150 || jobData.title === "Untitled Job") {
        console.log("[Scraper] Selector-based extraction yielded poor results. Returning raw data for frontend AI extraction.");
        
        let mainContent = $("main").text() || $("article").text() || $(".content").text() || response.data;
        
        const cleanText = mainContent.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                                      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
                                      .replace(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gm, "")
                                      .replace(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gm, "")
                                      .replace(/\s+/g, " ")
                                      .substring(0, 25000);
        jobData.rawText = cleanText;
      }

      // Final clean up and trimming
      jobData.title = jobData.title.replace(/\s+/g, ' ').trim();
      jobData.company = jobData.company.replace(/\s+/g, ' ').trim();
      jobData.description = jobData.description.replace(/\s+/g, ' ').trim().substring(0, 6000) || "No description found.";

      res.json(jobData);
    } catch (error: any) {
      console.warn("[Scraper Fallback] Reason:", error.message);
      const hint = getMetadataHint(urlLower);
      res.json({
        title: hint.title,
        description: "Scraping was limited by site security or format. Please input details or proceed with this draft.",
        company: hint.company,
        url: url
      });
    }
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

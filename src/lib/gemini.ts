import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please check the "Settings > Secrets" panel in AI Studio and ensure your API key is correctly configured.');
  }
  return new GoogleGenAI({ apiKey });
};

export const extractJobFromText = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract job details from this text input. 
    Return ONLY a JSON object with: { "title": string, "company": string, "description": string }.
    If not found, use logical guesses based on the content.
    
    INPUT: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response. Please try again.");
  }
  return JSON.parse(response.text);
};

export const parseResume = async (resumeText: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following resume text into a structured JSON format:
    ${resumeText}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                company: { type: Type.STRING },
                duration: { type: Type.STRING }
              }
            } 
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response. Please try again.");
  }
  return JSON.parse(response.text);
};

export const generateOutreach = async (jobData: any, resumeData: any, recruiterPost?: string) => {
  const ai = getAI();
  const prompt = `
    Job Data: ${JSON.stringify(jobData)}
    Candidate Data: ${JSON.stringify(resumeData)}
    ${recruiterPost ? `Recruiter's Recent Post: ${recruiterPost}` : ''}

    Task: Generate a hyper-personalized cold email and LinkedIn DM.
    If a recruiter post is provided, reference it naturally.
    Keep the tone professional but engaging.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
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
            description: "Suggestions for improving the resume to better match this specific job"
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response. Please try again.");
  }
  return JSON.parse(response.text);
};

export const simulateRecruiterChat = async (history: { role: 'user' | 'model', text: string }[], jobData: any) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are a tough but fair technical recruiter for the following job: ${JSON.stringify(jobData)}. 
      Your goal is to interview the candidate. Ask challenging questions about their experience, "Why this role?", and salary expectations. 
      Be professional and structured. Give feedback after each response if asked, but stay in character.`
    }
  });

  // Sending the last message in the history
  const lastMessage = history[history.length - 1].text;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};

const fs = require('fs');
let content = fs.readFileSync('src/lib/gemini.ts', 'utf-8');
const startMatch = "export const generateOutreach = async (jobData: any, resumeData: any, recruiterPost?: string) => {";
const endMatch = "  return JSON.parse(response.text);\n};";

const startIndex = content.indexOf(startMatch);
const endIndex = content.indexOf(endMatch, startIndex) + endMatch.length;

if (startIndex > -1 && endIndex > startMatch.length) {
  const replacement = `export const generateOutreach = async (jobData: any, resumeData: any, recruiterPost?: string) => {
  const response = await fetch('/api/generate-outreach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobData, resumeData, recruiterPost })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate outreach");
  }
  return response.json();
};`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/lib/gemini.ts', content);
  console.log("Patched successfully");
} else {
  console.log("Could not find bounds");
}

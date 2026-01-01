import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// FORCE NODE.JS RUNTIME
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { resumeJson, jobDescription } = await req.json();
    
    // 1. Init Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 2. The Enhanced Prompt
    const prompt = `
      You are an expert Resume Strategist and ATS Specialist.
      
      TASK:
      Tailor the provided CANDIDATE RESUME to match the TARGET JOB DESCRIPTION.
      
      REQUIREMENTS:
      
      1. **Professional Summary**:
         - Rewrite the summary to be punchy, compelling, and directly relevant to the role.
         - Incorporate key job titles and "power keywords" from the JD.
         - Keep it under 4 lines.

      2. **Skills & Expertise**:
         - Reorder the skills so the most relevant categories and items appear first.
         - If the candidate has a skill listed that is crucial for the JD, ensure it is prominent.
         - Do NOT invent skills the candidate does not possess. Only rephrase or re-prioritize.

      3. **Work Experience**:
         - For each job, reorder bullet points to prioritize relevant achievements.
         - Rewrite bullets to use the same terminology/keywords as the JD where truthful.
         - Focus on impact (numbers, percentages) and problem-solving.

      INPUT DATA:
      - Resume JSON: ${JSON.stringify(resumeJson)}
      - Job Description: ${jobDescription}

      OUTPUT:
      - Return ONLY the full, valid JSON object with the updated fields. 
      - Do not include markdown formatting (like \`\`\`json).
      - Ensure the structure matches the input JSON exactly.
    `;

    // 3. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Clean and Parse
    // Strip markdown code blocks if present
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const tailoredJson = JSON.parse(cleanedText);
        return NextResponse.json(tailoredJson);
    } catch (parseError) {
        console.error("JSON Parse Error:", text);
        return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to tailor resume' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { resumeJson, jobDescription } = await req.json();
    
    // 1. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 2. The Prompt
    // We force Gemini to output ONLY valid JSON matching the exact structure we sent.
    const prompt = `
      You are an expert Resume Strategist. 
      
      TASK:
      Tailor the "experience" section of the provided Resume JSON to match the Job Description.
      1. Reorder bullet points to prioritize relevant skills.
      2. Rewrite bullet points to use keywords from the JD, but keep them truthful.
      3. Do NOT invent new jobs or dates. Only modify the "bullets" array for each job.
      4. Return ONLY the full valid JSON object. No markdown formatting, no comments.

      RESUME JSON:
      ${JSON.stringify(resumeJson)}

      JOB DESCRIPTION:
      ${jobDescription}
    `;

    // 3. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Clean and Parse
    // Sometimes Gemini adds markdown code blocks (```json ... ```). We strip them.
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const tailoredJson = JSON.parse(cleanedText);

    return NextResponse.json(tailoredJson);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to tailor resume' }, { status: 500 });
  }
}
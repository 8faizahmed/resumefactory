import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { resumeJson, jobDescription } = await req.json();
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are an expert Career Coach and Copywriter.
      
      TASK:
      Write a professional, engaging cover letter based on the candidate's resume and the target job description.
      
      GUIDELINES:
      1. Tone: Professional, confident, yet authentic. Avoid robotic clichés like "I am writing to apply for...".
      2. Structure:
         - Hook: Start with a strong opening connecting the candidate's passion/skill to the company's mission.
         - Body: Select 2-3 key achievements from the resume that directly prove the candidate can solve the problems listed in the JD.
         - Closing: A strong call to action.
      3. Formatting: Use standard business letter formatting (Subject line optional but helpful).
      4. Length: Concise (approx 300-400 words).
      
      CANDIDATE RESUME (JSON):
      ${JSON.stringify(resumeJson)}

      TARGET JOB DESCRIPTION:
      ${jobDescription}
      
      OUTPUT:
      Return ONLY the plain text of the cover letter. Do not include markdown code blocks.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ coverLetter: text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}
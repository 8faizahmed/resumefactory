import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { resumeJson, jobDescription } = await req.json();
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are an expert Technical Recruiter and Interview Coach.
      
      TASK:
      Generate 5 highly relevant interview questions based on the provided TARGET JOB DESCRIPTION and CANDIDATE RESUME.
      
      REQUIREMENTS:
      1. **Mix**: Include 2 Behavioral questions, 2 Technical/Role-Specific questions, and 1 "Curveball" or Cultural fit question.
      2. **Context**: Ensure questions specifically target gaps or strong points in the resume relative to the JD.
      3. **Output Format**: Return a JSON ARRAY of objects.
      
      JSON STRUCTURE:
      [
        {
          "question": "String",
          "type": "Behavioral" | "Technical" | "Cultural",
          "context": "Why this question matters for this role...",
          "sampleAnswer": "A suggested STAR method answer key points..."
        }
      ]

      INPUT DATA:
      - Resume: ${JSON.stringify(resumeJson).slice(0, 5000)}
      - JD: ${jobDescription.slice(0, 5000)}

      OUTPUT:
      Return ONLY the valid JSON array. No markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleanedText);

    return NextResponse.json({ questions });

  } catch (error) {
    console.error("Interview Gen Error:", error);
    return NextResponse.json({ error: 'Failed to generate interview questions' }, { status: 500 });
  }
}
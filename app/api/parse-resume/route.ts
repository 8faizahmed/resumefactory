import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();
    
    // 1. Init Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 2. The Strict Schema Prompt
    const prompt = `
      You are a Data Extraction Expert.
      
      TASK:
      Extract information from the provided RESUME TEXT and format it into the exact JSON structure below.
      
      RULES:
      1. Map fields as accurately as possible.
      2. If a field is missing (e.g., LinkedIn), leave it empty or null.
      3. RETURN ONLY VALID JSON. No markdown formatting.

      REQUIRED JSON STRUCTURE:
      {
        "personalInfo": {
          "name": "string",
          "location": "string",
          "phone": "string",
          "email": "string",
          "linkedin": "string (optional)",
          "portfolio": "string (optional)"
        },
        "summary": "string",
        "experience": [
          {
            "company": "string",
            "role": "string",
            "date": "string",
            "location": "string",
            "bullets": ["string", "string"]
          }
        ],
        "education": [
          {
            "school": "string",
            "degree": "string",
            "details": "string"
          }
        ],
        "skills": [
          {
            "category": "string (e.g. Technical, Leadership)",
            "items": "string (comma separated list)"
          }
        ]
      }

      RESUME TEXT TO PROCESS:
      ${resumeText}
    `;

    // 3. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Clean JSON (Strip Markdown if present)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Parse Error:", error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
import React, { useState } from 'react';

export interface Question {
  question: string;
  type: string;
  context: string;
  sampleAnswer: string;
}

interface Props {
  questions: Question[];
  onGenerate: () => void;
  isGenerating: boolean;
  jobDescriptionExists: boolean;
}

export const InterviewPrep = ({ questions, onGenerate, isGenerating, jobDescriptionExists }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!jobDescriptionExists) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="font-bold text-lg mb-2">No Job Description Found</h3>
        <p className="text-sm max-w-xs">
          Paste a Job Description in the "Job Context" box on the left to generate targeted interview questions.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 p-8 text-center">
        <div className="text-4xl mb-4">🧠</div>
        <h3 className="font-bold text-lg mb-2">Ace the Interview</h3>
        <p className="text-sm max-w-xs mb-6">
          Generate AI-powered questions specifically tailored to this role and your resume.
        </p>
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          {isGenerating ? "Analyzing..." : "Generate Interview Prep"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Interview Coach</h2>
        <button 
          onClick={onGenerate} 
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>↻</span> Regenerate
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
            
            {/* Question Header */}
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left p-5 flex gap-4 items-start"
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mt-0.5
                ${q.type === 'Behavioral' ? 'bg-blue-100 text-blue-700' : 
                  q.type === 'Technical' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                {q.type}
              </span>
              <span className="font-bold text-gray-800 flex-grow pt-0.5">{q.question}</span>
              <span className="text-gray-400 font-bold">{openIndex === idx ? '−' : '+'}</span>
            </button>

            {/* Answer Content */}
            {openIndex === idx && (
              <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100 animate-fade-in-up">
                <div className="mt-4">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">💡 Why they are asking</div>
                  <p className="text-sm text-gray-600 italic mb-4">{q.context}</p>
                  
                  <div className="text-xs font-bold text-green-700 uppercase mb-1">✅ Suggested Strategy</div>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{q.sampleAnswer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
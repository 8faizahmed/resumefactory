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
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 p-8 text-center bg-white rounded-xl border border-gray-200 shadow-sm border-dashed">
        <div className="text-4xl mb-4 grayscale opacity-50">🎯</div>
        <h3 className="font-bold text-lg mb-2 text-gray-900">No Job Description Found</h3>
        <p className="text-sm max-w-xs opacity-70 leading-relaxed">
          Paste a Job Description in the "Job Context" panel on the left to generate targeted interview questions.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 p-8 text-center">
        <div className="text-4xl mb-4 grayscale opacity-50">🧠</div>
        <h3 className="font-bold text-lg mb-2 text-gray-900">Ace the Interview</h3>
        <p className="text-sm max-w-xs mb-6 opacity-70 leading-relaxed">
          Generate AI-powered questions specifically tailored to this role and your resume skills.
        </p>
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2 text-sm"
        >
          {isGenerating ? "Analyzing..." : "Generate Interview Prep"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-0 h-full pb-24 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 z-10 py-4 border-b border-gray-200/50 backdrop-blur-xl bg-opacity-80">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Interview Coach</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">AI-Generated Strategy</p>
        </div>
        <button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>↻</span> {isGenerating ? "Thinking..." : "Regenerate Questions"}
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          // Dynamic accent colors based on type
          const accentColor = q.type === 'Behavioral' ? 'border-l-blue-500' : 
                              q.type === 'Technical' ? 'border-l-purple-500' : 'border-l-orange-500';
          
          const badgeColor = q.type === 'Behavioral' ? 'bg-blue-50 text-blue-700' : 
                             q.type === 'Technical' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700';

          return (
            <div key={idx} className={`border border-gray-200 border-l-4 ${accentColor} rounded-r-xl bg-white shadow-sm overflow-hidden transition-all hover:shadow-md group`}>
              
              {/* Question Header */}
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-5 flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${badgeColor}`}>
                    {q.type}
                  </span>
                </div>
                <span className="font-bold text-gray-900 flex-grow pt-0.5 leading-snug text-base group-hover:text-black transition-colors">{q.question}</span>
                <span className={`text-gray-400 font-bold ml-2 transition-transform duration-200 transform ${openIndex === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Answer Content */}
              {openIndex === idx && (
                <div className="px-6 pb-6 pt-0 animate-fade-in-up">
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="mb-5">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span>💡</span> The "Why"
                      </div>
                      <p className="text-sm text-gray-600 italic leading-relaxed">{q.context}</p>
                    </div>
                    
                    <div className="border-t border-gray-200/50 pt-4">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span>✅</span> Winning Strategy
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{q.sampleAnswer}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
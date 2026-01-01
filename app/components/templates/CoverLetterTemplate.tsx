import React from 'react';
import { ResumeData } from '@/types/resume';

interface Props {
  personalInfo: ResumeData['personalInfo'];
  content: string;
}

export const CoverLetterTemplate = ({ personalInfo, content }: Props) => (
  <div className="font-sans text-gray-900 text-sm leading-relaxed p-[0.5in]">
    {/* HEADER (Matches Modern Resume) */}
    <div className="border-b-2 border-gray-100 pb-6 mb-8">
      <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900 mb-2">
        {personalInfo.name}
      </h1>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 font-medium">
        {personalInfo.location && <span>{personalInfo.location}</span>}
        {personalInfo.phone && <span>{personalInfo.phone}</span>}
        {personalInfo.email && <span>{personalInfo.email}</span>}
        {personalInfo.linkedin && (
          <a href={personalInfo.linkedin} className="text-blue-600 underline decoration-dotted">
            LinkedIn
          </a>
        )}
        {personalInfo.portfolio && (
          <a href={personalInfo.portfolio} className="text-blue-600 underline decoration-dotted">
            Portfolio
          </a>
        )}
      </div>
    </div>

    {/* BODY CONTENT */}
    <div className="whitespace-pre-wrap font-serif text-[11pt] text-gray-800 leading-7">
      {content}
    </div>
  </div>
);
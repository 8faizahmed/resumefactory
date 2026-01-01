import React from 'react';
import { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData;
  educationFirst?: boolean;
  highlightedSection?: string | null;
}

export const ModernTemplate = ({ data, educationFirst, highlightedSection }: Props) => {
  const isHighlighted = highlightedSection === 'tailored';
  const highlightClass = isHighlighted ? "bg-yellow-50 ring-2 ring-yellow-300 rounded p-1 transition-all duration-500" : "";

  const Skills = () => (
    <div className={`mb-6 ${isHighlighted ? highlightClass : ''}`}>
       <h2 className="text-xs font-bold uppercase text-blue-800 tracking-wider mb-3">Skills & Expertise</h2>
       <div className="text-[13px] grid grid-cols-1 gap-1">
         {data.skills.map((skill, idx) => (
           <div key={idx} className="break-inside-avoid">
             <span className="font-bold text-gray-900">{skill.category}:</span> <span className="text-gray-700">{skill.items}</span>
           </div>
         ))}
       </div>
    </div>
  );

  const Education = () => (
    <div className="mb-6">
       <h2 className="text-xs font-bold uppercase text-blue-800 tracking-wider mb-3">Education</h2>
       {data.education.map((edu, idx) => (
          <div key={idx} className="mb-2 break-inside-avoid pt-1">
             <div className="flex justify-between font-bold text-[14px]">
                <span>{edu.school}</span>
             </div>
             <div className="text-sm text-gray-800">{edu.degree}</div>
             <div className="text-gray-500 italic text-xs mt-1">{edu.details}</div>
          </div>
       ))}
    </div>
  );

  return (
    <div className="font-sans text-gray-900 text-sm leading-snug">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-gray-100 pb-4">
        <div className="w-2/3">
          <h1 className="text-4xl font-bold uppercase tracking-wide leading-none">{data.personalInfo.name}</h1>
          <p className="text-gray-500 mt-1">{data.personalInfo.location}</p>
        </div>
        <div className="w-1/3 text-right text-xs text-gray-700 leading-relaxed">
          {data.personalInfo.phone}<br/>
          {data.personalInfo.email}<br/>
          <div className="mt-1 font-medium text-black">
            <a href={data.personalInfo.linkedin} className="underline decoration-dotted">LinkedIn</a> | 
            <a href={data.personalInfo.portfolio} className="underline decoration-dotted">Portfolio</a>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className={`mb-6 ${isHighlighted ? highlightClass : ''}`}>
        <h2 className="text-xs font-bold uppercase text-blue-800 tracking-wider mb-2">Professional Summary</h2>
        <p className="text-justify text-sm leading-relaxed text-gray-800">{data.summary}</p>
      </div>

      {/* EXPERIENCE */}
      <div className={`mb-6 ${isHighlighted ? highlightClass : ''}`}>
        <h2 className="text-xs font-bold uppercase text-blue-800 tracking-wider mb-4">Work Experience</h2>
        {data.experience.map((job, idx) => (
          <div key={idx} className="mb-5">
            <div className="break-inside-avoid mb-2 pt-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[15px] text-gray-900">{job.role}</span>
                <span className="font-bold text-sm text-gray-600">{job.date}</span>
              </div>
              <div className="text-gray-700 italic text-sm">
                {job.company} {job.location ? `| ${job.location}` : ''}
              </div>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[13px] text-gray-800">
              {job.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="pl-1">{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* DYNAMIC ORDERING */}
      {educationFirst ? (
        <>
          <Education />
          <Skills />
        </>
      ) : (
        <>
          <Skills />
          <Education />
        </>
      )}
    </div>
  );
};
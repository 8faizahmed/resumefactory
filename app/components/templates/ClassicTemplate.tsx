import React from 'react';
import { ResumeData } from '@/types/resume';

export const ClassicTemplate = ({ data, educationFirst }: { data: ResumeData, educationFirst?: boolean }) => {
  
  const Skills = () => (
    <div>
       <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-3">Skills</h2>
       <div className="space-y-1">
         {data.skills.map((skill, idx) => (
           <div key={idx} className="break-inside-avoid">
             <span className="font-bold">{skill.category}:</span> {skill.items}
           </div>
         ))}
       </div>
    </div>
  );

  const Education = () => (
    <div className="mb-5">
       <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-3">Education</h2>
       {data.education.map((edu, idx) => (
          <div key={idx} className="mb-2 break-inside-avoid">
             <div className="flex justify-between font-bold">
                <span>{edu.school}</span>
                <span className="font-normal italic text-[10pt]">{edu.details}</span>
             </div>
             <div>{edu.degree}</div>
          </div>
       ))}
    </div>
  );

  return (
    <div className="font-serif text-black text-[11pt] leading-normal">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{data.personalInfo.name}</h1>
        <div className="text-[10pt] space-x-2">
          <span>{data.personalInfo.location}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.email}</span>
        </div>
        <div className="text-[10pt] mt-1 space-x-2">
          <a href={data.personalInfo.linkedin} className="underline">LinkedIn</a>
          <span>•</span>
          <a href={data.personalInfo.portfolio} className="underline">Portfolio</a>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-2">Professional Summary</h2>
        <p className="text-justify">{data.summary}</p>
      </div>

      <div className="mb-5">
        <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-4">Experience</h2>
        {data.experience.map((job, idx) => (
          <div key={idx} className="mb-4">
            <div className="break-inside-avoid mb-1">
              <div className="flex justify-between items-baseline font-bold">
                <span className="text-[11pt]">{job.company}</span>
                <span className="text-[11pt]">{job.date}</span>
              </div>
              <div className="flex justify-between items-baseline italic">
                <span>{job.role}</span>
                <span>{job.location}</span>
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {job.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="pl-1">{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {educationFirst ? <><Education /><Skills /></> : <><Skills /><Education /></>}
    </div>
  );
};
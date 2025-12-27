import React from 'react';
import { ResumeData } from '@/types/resume';

export const CreativeTemplate = ({ data, educationFirst }: { data: ResumeData, educationFirst?: boolean }) => {
  
  const Skills = () => (
    <div className="mb-8">
      <h3 className="uppercase tracking-widest text-xs font-bold border-b border-gray-700 pb-2 mb-4 text-blue-400">Skills</h3>
      <div className="space-y-4">
        {data.skills.map((skill, idx) => (
          <div key={idx} className="break-inside-avoid">
            <div className="font-bold text-xs mb-1 text-gray-300">{skill.category}</div>
            <div className="text-[11px] leading-relaxed text-gray-400">{skill.items}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const Education = () => (
    <div>
      <h3 className="uppercase tracking-widest text-xs font-bold border-b border-gray-700 pb-2 mb-4 text-blue-400">Education</h3>
       {data.education.map((edu, idx) => (
          <div key={idx} className="mb-4 break-inside-avoid">
             <div className="font-bold text-sm">{edu.school}</div>
             <div className="text-xs text-blue-200 mb-0.5">{edu.degree}</div>
             <div className="text-[10px] text-gray-400 italic">{edu.details}</div>
          </div>
       ))}
    </div>
  );

  return (
    <div className="font-sans flex flex-row h-full">
      {/* LEFT COLUMN */}
      <div className="w-[32%] bg-slate-900 text-white p-6 pt-12 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-blue-400 break-words mb-6">
            {data.personalInfo.name}
          </h1>
          
          <div className="text-xs space-y-3 opacity-90">
            <div><span className="block font-bold text-gray-400 uppercase text-[10px] mb-0.5">Phone</span>{data.personalInfo.phone}</div>
            <div><span className="block font-bold text-gray-400 uppercase text-[10px] mb-0.5">Email</span><span className="break-all">{data.personalInfo.email}</span></div>
            <div><span className="block font-bold text-gray-400 uppercase text-[10px] mb-0.5">Location</span>{data.personalInfo.location}</div>
            <div>
              <span className="block font-bold text-gray-400 uppercase text-[10px] mb-0.5">Links</span>
              <div className="flex flex-col gap-1">
                {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin} className="hover:text-blue-300 truncate">LinkedIn</a>}
                {data.personalInfo.portfolio && <a href={data.personalInfo.portfolio} className="hover:text-blue-300 truncate">Portfolio</a>}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Order */}
        <div>
          {educationFirst ? <><Education /><div className="h-6"/> <Skills /></> : <><Skills /><div className="h-6"/> <Education /></>}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-[68%] p-8 pt-12 pb-12 bg-white text-gray-800">
        <div className="mb-8">
          <h2 className="uppercase tracking-widest text-sm font-bold border-b-2 border-slate-900 pb-2 mb-4">Profile</h2>
          <p className="text-sm leading-relaxed text-gray-600 text-justify">{data.summary}</p>
        </div>

        <div>
          <h2 className="uppercase tracking-widest text-sm font-bold border-b-2 border-slate-900 pb-2 mb-6">Experience</h2>
          {data.experience.map((job, idx) => (
            <div key={idx} className="pt-6 pb-2">
               <div className="break-inside-avoid mb-2">
                 <div className="flex justify-between items-baseline mb-1">
                   <h3 className="font-bold text-lg text-slate-900">{job.role}</h3>
                   <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">{job.date}</span>
                 </div>
                 <div className="text-sm text-blue-600 font-medium">{job.company} | {job.location}</div>
               </div>
               
               <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                 {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
               </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData['education'];
  onChange: (index: number, field: string, value: any) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}

export const EducationForm = ({ data, onChange, onMove, onDelete, onAdd }: Props) => (
  <>
    <button onClick={onAdd} className="mb-4 text-xs font-bold bg-green-100 text-green-700 px-3 py-2 rounded w-full hover:bg-green-200 transition-colors">+ Add Education</button>
    {data.map((edu, idx) => (
      <div key={idx} className="border border-gray-200 rounded p-3 bg-gray-50 mb-3 relative group">
        <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">School #{idx+1}</span>
            <div className="flex gap-1">
                <button onClick={() => onMove(idx, -1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
                <button onClick={() => onMove(idx, 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></button>
                <button onClick={() => onDelete(idx)} className="p-1 hover:bg-red-100 text-red-500 rounded"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
        </div>
        <input className="w-full p-2 mb-2 text-xs border rounded" value={edu.school} onChange={(e) => onChange(idx, 'school', e.target.value)} placeholder="School Name" />
        <input className="w-full p-2 mb-2 text-xs border rounded" value={edu.degree} onChange={(e) => onChange(idx, 'degree', e.target.value)} placeholder="Degree" />
        <textarea className="w-full h-16 p-2 text-xs border rounded" value={edu.details} onChange={(e) => onChange(idx, 'details', e.target.value)} placeholder="Details (Majors, etc.)" />
      </div>
    ))}
  </>
);
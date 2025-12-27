import React from 'react';
import { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData['skills'];
  onChange: (index: number, field: string, value: any) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}

export const SkillsForm = ({ data, onChange, onMove, onDelete, onAdd }: Props) => {
  return (
    <>
      <button onClick={onAdd} className="mb-4 text-xs font-bold bg-green-100 text-green-700 px-3 py-2 rounded w-full hover:bg-green-200 transition-colors">+ Add Skill Category</button>
      <div className="space-y-3">
        {data.map((skill, idx) => (
          <div key={idx} className="border border-gray-200 rounded p-3 bg-gray-50 relative group transition-all hover:border-blue-300">
            
            {/* Header with controls */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Category #{idx + 1}</span>
              <div className="flex gap-1">
                <button onClick={() => onMove(idx, -1)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Move Up">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
                <button onClick={() => onMove(idx, 1)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Move Down">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
                <button onClick={() => onDelete(idx)} className="p-1 hover:bg-red-100 text-red-500 rounded" title="Delete">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <input 
                className="input-field font-bold" 
                value={skill.category} 
                onChange={(e) => onChange(idx, 'category', e.target.value)} 
                placeholder="Category (e.g. Technical Skills)" 
              />
              <textarea 
                className="w-full h-16 p-2 text-xs border rounded font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                value={skill.items}
                onChange={(e) => onChange(idx, 'items', e.target.value)}
                placeholder="List skills here (comma separated or lines)..."
              />
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .input-field { width: 100%; padding: 6px 8px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 4px; outline: none; color: #111827; background-color: #ffffff; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
      `}</style>
    </>
  );
};
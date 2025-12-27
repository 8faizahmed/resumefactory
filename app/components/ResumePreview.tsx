import React from 'react';
import { ResumeData } from '@/types/resume';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';

interface Props {
  data: ResumeData;
  theme: 'modern' | 'classic' | 'creative';
  highlightedSection?: string | null;
  educationFirst?: boolean; // NEW PROP
}

export const ResumePreview: React.FC<Props> = ({ data, theme, educationFirst = true }) => {
  
  const getTemplate = () => {
    switch (theme) {
      case 'classic': return <ClassicTemplate data={data} educationFirst={educationFirst} />;
      case 'creative': return <CreativeTemplate data={data} educationFirst={educationFirst} />;
      case 'modern':
      default: return <ModernTemplate data={data} educationFirst={educationFirst} />;
    }
  };

  return (
    <div 
      id="resume-preview" 
      className="bg-white w-[8.5in] min-h-[11in] shadow-2xl relative"
    >
      {/* PAGE BREAK OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent calc(11in - 10px), rgba(148, 163, 184, 0.4) calc(11in - 10px), rgba(148, 163, 184, 0.4) calc(11in - 2px), transparent 11in)',
          backgroundSize: '100% 11in'
        }}
      />

      {/* TEMPLATE CONTENT */}
      <div className={theme === 'creative' ? 'h-full' : 'p-[0.5in] h-full'}>
        {getTemplate()}
      </div>
    </div>
  );
};
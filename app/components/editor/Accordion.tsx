import React from 'react';

interface Props {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const Accordion = ({ title, isOpen, onToggle, children }: Props) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mb-4">
    <button 
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="font-bold text-sm uppercase text-gray-700">{title}</span>
      <span className="text-gray-400">
        {isOpen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        )}
      </span>
    </button>
    {isOpen && <div className="p-4 border-t border-gray-100">{children}</div>}
  </div>
);
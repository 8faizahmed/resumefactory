import React, { useState, useEffect } from 'react';
import { ResumeStore, SavedResume } from '@/app/services/resumeStore';

interface Props {
  currentFileId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  refreshTrigger: number;
}

export const Sidebar = ({ currentFileId, onSelect, onNew, refreshTrigger }: Props) => {
  const [files, setFiles] = useState<SavedResume[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setFiles(ResumeStore.getAll());
  }, [refreshTrigger]);

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newId = ResumeStore.duplicate(id);
    if (newId) onSelect(newId);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Permanently delete this resume?")) {
      ResumeStore.delete(id);
      setFiles(ResumeStore.getAll());
      if (id === currentFileId) onNew();
    }
  };

  return (
    <div 
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-800 flex-shrink-0 transition-all duration-300 ease-in-out relative`}
    >
      
      {/* COLLAPSE TOGGLE */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-gray-800 text-white border border-gray-700 rounded-full p-1 shadow-md hover:bg-gray-700 z-50 w-6 h-6 flex items-center justify-center"
      >
        <span className="text-[10px]">{isCollapsed ? '▶' : '◀'}</span>
      </button>

      {/* APP TITLE */}
      <div className={`p-4 border-b border-gray-800 h-16 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
        <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="text-2xl">📄</span>
          {!isCollapsed && <span>ResumeFactory</span>}
        </h1>
      </div>

      {/* NEW RESUME BUTTON */}
      <div className="p-3">
        <button 
          onClick={onNew}
          title="New Resume"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 px-3'} py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors text-sm font-medium border border-gray-700`}
        >
          <span className="text-lg font-bold">+</span>
          {!isCollapsed && <span>New Resume</span>}
        </button>
      </div>

      {/* RESUME LIST */}
      <div className="flex-grow overflow-y-auto custom-scrollbar px-2 pb-4">
        {!isCollapsed && <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2 mt-2">Your Resumes</div>}
        
        <div className="space-y-1">
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => onSelect(file.id)}
              title={file.name}
              className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 rounded-md cursor-pointer text-sm transition-all
                ${currentFileId === file.id ? 'bg-gray-800 text-white ring-1 ring-gray-700' : 'hover:bg-gray-800/50 hover:text-white'}`}
            >
              {isCollapsed ? (
                // ICON VIEW
                <span className="text-lg">📝</span>
              ) : (
                // FULL VIEW
                <>
                  <div className="truncate pr-2">
                    <div className="truncate font-medium">{file.name}</div>
                    <div className="text-[10px] text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDuplicate(e, file.id)}
                      title="Duplicate"
                      className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, file.id)} 
                      title="Delete"
                      className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* USER / FOOTER */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          Local Storage • v1.1
        </div>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { ResumeStore, SavedResume } from '@/app/services/resumeStore';
import { ResumeData } from '@/types/resume';

interface Props {
  currentData: ResumeData;
  onLoad: (data: ResumeData, id: string) => void;
  currentFileId: string | null;
}

export const FileHandler = ({ currentData, onLoad, currentFileId }: Props) => {
  const [files, setFiles] = useState<SavedResume[]>([]);
  const [showList, setShowList] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Refresh list on mount
  useEffect(() => {
    setFiles(ResumeStore.getAll());
  }, []);

  const handleSave = () => {
    // If we have a name, save as new. If no name but existing ID, update.
    const nameToUse = saveName.trim() || (currentFileId ? files.find(f => f.id === currentFileId)?.name : "Untitled Resume");
    
    // Logic: If user typed a NEW name, force create new ID. Else update current.
    const idToUpdate = saveName.trim() ? undefined : (currentFileId || undefined);
    
    const newId = ResumeStore.save(currentData, nameToUse, idToUpdate);
    setFiles(ResumeStore.getAll());
    setSaveName(''); // Clear input
    alert("Saved successfully!");
    
    // Reload the just-saved file to set the ID in parent
    const saved = ResumeStore.getById(newId);
    if(saved) onLoad(saved.data, saved.id);
  };

  const handleLoad = (id: string) => {
    const file = ResumeStore.getById(id);
    if (file) {
      if(confirm(`Load "${file.name}"? Unsaved changes will be lost.`)) {
        onLoad(file.data, file.id);
        setShowList(false);
      }
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Delete this resume permanently?")) {
      ResumeStore.delete(id);
      setFiles(ResumeStore.getAll());
    }
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 mb-6 shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">File Manager</h2>
        <span className="text-xs text-gray-500">{files.length} Saved</span>
      </div>

      {/* SAVE CONTROLS */}
      <div className="flex gap-2 mb-4">
        <input 
          className="bg-gray-700 text-xs text-white p-2 rounded flex-grow outline-none focus:ring-1 focus:ring-blue-400"
          placeholder={currentFileId ? "Update current..." : "Name your resume..."}
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
        />
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 text-xs font-bold px-3 py-2 rounded transition-colors"
        >
          {saveName ? "Save New" : (currentFileId ? "Update" : "Save")}
        </button>
      </div>

      {/* FILE LIST TOGGLE */}
      <div className="border-t border-gray-700 pt-3">
        <button 
          onClick={() => setShowList(!showList)}
          className="w-full text-left text-xs font-bold text-gray-300 hover:text-white flex justify-between items-center"
        >
          <span>📂 Open Saved Resume</span>
          <span>{showList ? '▼' : '▶'}</span>
        </button>

        {showList && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {files.length === 0 && <p className="text-xs text-gray-500 italic">No saved files yet.</p>}
            {files.map(file => (
              <div 
                key={file.id}
                onClick={() => handleLoad(file.id)}
                className={`group flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${currentFileId === file.id ? 'bg-gray-700 border-l-2 border-green-400' : ''}`}
              >
                <div>
                  <div className="text-xs font-bold text-gray-200">{file.name}</div>
                  <div className="text-[10px] text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</div>
                </div>
                <button 
                  onClick={(e) => handleDelete(file.id, e)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
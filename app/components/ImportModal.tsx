import React, { useState } from 'react';
import { ResumeData } from '@/types/resume';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ResumeData) => void;
}

export const ImportModal = ({ isOpen, onClose, onImport }: Props) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });

      if (!res.ok) throw new Error("Failed to parse");

      const data = await res.json();
      onImport(data); // Pass data back to parent
      onClose();      // Close modal
    } catch (e) {
      alert("Could not parse resume text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import from Existing Resume</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">✕</button>
        </div>
        
        <p className="text-sm text-gray-500 mb-2">
          Open your PDF, press <strong className="text-black">Ctrl+A</strong> to select all text, <strong className="text-black">Ctrl+C</strong> to copy, and paste it below. Gemini will format it for you.
        </p>

        <textarea
          className="w-full flex-grow p-4 border border-gray-300 rounded mb-4 font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          placeholder="Paste raw resume text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ minHeight: '300px' }}
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleParse} 
            disabled={loading}
            className={`px-6 py-2 text-sm font-bold text-white rounded transition-all
              ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {loading ? "Analyzing with AI..." : "Import & Format"}
          </button>
        </div>
      </div>
    </div>
  );
};
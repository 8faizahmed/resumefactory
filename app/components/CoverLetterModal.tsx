import React, { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  personalInfo?: ResumeData['personalInfo']; // Needed for PDF Header
}

export const CoverLetterModal = ({ isOpen, onClose, initialContent, personalInfo }: Props) => {
  const [content, setContent] = useState(initialContent);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!personalInfo) return alert("Missing personal info for PDF header");
    setIsDownloading(true);
    try {
      const res = await fetch('/api/generate-cover-letter-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalInfo, content }),
      });
      
      if (!res.ok) throw new Error("Failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cover_Letter.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cover Letter Assistant</h2>
            <p className="text-sm text-gray-500">Edit content before exporting.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        
        {/* Editor */}
        <div className="flex-grow p-6 bg-gray-50">
          <textarea
            className="w-full h-full min-h-[400px] p-8 text-sm text-gray-800 leading-relaxed bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-serif whitespace-pre-wrap"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your cover letter will appear here..."
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-xl">
          <button onClick={onClose} className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4">Cancel</button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleCopy} 
              className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isCopied ? "Copied!" : "Copy Text"}
            </button>
            <button 
              onClick={handleDownloadPdf} 
              disabled={isDownloading}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2"
            >
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
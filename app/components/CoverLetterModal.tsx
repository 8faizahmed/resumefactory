import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
}

export const CoverLetterModal = ({ isOpen, onClose, initialContent }: Props) => {
  const [content, setContent] = useState(initialContent);
  const [isCopied, setIsCopied] = useState(false);

  // Reset content when modal opens with new data
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Generated Cover Letter</h2>
            <p className="text-sm text-gray-500">Review and edit before sending.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        {/* Editor */}
        <div className="flex-grow p-6 bg-gray-50">
          <textarea
            className="w-full h-full min-h-[400px] p-6 text-sm text-gray-800 leading-relaxed bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-serif"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={true}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-xl">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handleCopy} 
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow transition-all flex items-center gap-2
              ${isCopied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
          >
            {isCopied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Copied to Clipboard
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy Text
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
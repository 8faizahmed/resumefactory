'use client';
import { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';
import { ResumePreview } from './components/ResumePreview';

// Components
import { Accordion } from './components/editor/Accordion';
import { ExperienceForm } from './components/editor/ExperienceForm';
import { EducationForm } from './components/editor/EducationForm';
import { SkillsForm } from './components/editor/SkillsForm';
import { ImportModal } from './components/ImportModal';
import { CoverLetterModal } from './components/CoverLetterModal'; // NEW
import { Sidebar } from './components/Sidebar';
import { Toast, ToastMessage } from './components/Toast';

// Services
import { ResumeStore } from '@/app/services/resumeStore';

// --- DEFAULT DATA ---
const defaultResumeData: ResumeData = {
  personalInfo: {
    name: "New User",
    location: "City, Country",
    phone: "+1-000-000-0000",
    email: "email@example.com",
    linkedin: "",
    portfolio: ""
  },
  summary: "Professional summary goes here...",
  experience: [],
  education: [],
  skills: []
};

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'json'>('editor');
  
  // STATE
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("Untitled Resume"); 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // VIEW SETTINGS
  const [theme, setTheme] = useState<'modern' | 'classic' | 'creative'>('modern');
  const [educationFirst, setEducationFirst] = useState(true); 

  // COVER LETTER STATE (NEW)
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [isWritingLetter, setIsWritingLetter] = useState(false);

  // TOAST STATE
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };
  
  // Accordion
  const [openSections, setOpenSections] = useState({
    personal: true, summary: true, experience: true, education: false, skills: false
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (resumeData !== defaultResumeData && currentFileId) {
       // Optional: Auto-save logic could go here
    }
  }, [resumeData, currentFileId]);

  // --- GENERIC FIELD HANDLERS ---
  const handlePersonalChange = (field: string, value: string) => {
    setResumeData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const handleArrayFieldChange = (section: 'experience' | 'education' | 'skills', index: number, field: string, value: any) => {
    const newData = { ...resumeData };
    // @ts-ignore
    newData[section][index][field] = value;
    setResumeData(newData);
  };

  const moveItem = (section: 'experience' | 'education' | 'skills', index: number, direction: -1 | 1) => {
    const newData = { ...resumeData };
    const list = newData[section];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < list.length) {
      [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
      setResumeData(newData);
    }
  };

  const addItem = (section: 'experience' | 'education' | 'skills') => {
    const newData = { ...resumeData };
    // @ts-ignore
    const templates = {
      experience: { company: "New Company", role: "Role", date: "Date", location: "Location", bullets: ["New bullet"] },
      education: { school: "New School", degree: "Degree", details: "Details" },
      skills: { category: "Category", items: "Item 1, Item 2" }
    };
    // @ts-ignore
    newData[section].unshift(templates[section]);
    setResumeData(newData);
  };

  const removeItem = (section: 'experience' | 'education' | 'skills', index: number) => {
    if (!confirm("Delete this item?")) return;
    const newData = { ...resumeData };
    newData[section].splice(index, 1);
    setResumeData(newData);
  };

  // --- FILE ACTIONS ---
  const handleNewResume = () => {
    setResumeData(defaultResumeData);
    setCurrentFileId(null);
    setFileName("Untitled Resume");
    setJobDescription("");
    showToast("Started new resume", "info");
  };

  const handleSelectResume = (id: string) => {
    const saved = ResumeStore.getById(id);
    if (saved) {
      setResumeData(saved.data);
      setCurrentFileId(saved.id);
      setFileName(saved.name);
      setOpenSections({ personal: true, summary: true, experience: true, education: true, skills: true });
      showToast(`Loaded "${saved.name}"`, "success");
    }
  };

  const handleSave = () => {
    const id = ResumeStore.save(resumeData, fileName, currentFileId || undefined);
    setCurrentFileId(id);
    setRefreshTrigger(prev => prev + 1); 
    showToast("Resume saved successfully", "success");
  };

  const handleImportSuccess = (newData: ResumeData) => {
    setResumeData(newData);
    setOpenSections({ personal: true, summary: true, experience: true, education: true, skills: true });
    const name = `Imported - ${newData.personalInfo.name}`;
    setFileName(name);
    const newId = ResumeStore.save(newData, name);
    setCurrentFileId(newId);
    setRefreshTrigger(prev => prev + 1);
    showToast("Resume imported & saved!", "success");
  };

  // --- API HANDLERS ---
  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      showToast("Please paste a Job Description first!", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson: resumeData, jobDescription }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const tailoredData = await res.json();
      setResumeData(tailoredData);
      
      setOpenSections(prev => ({ ...prev, experience: true }));

      const newName = `Tailored for ${jobDescription.slice(0, 15)}...`;
      setFileName(newName);
      const newId = ResumeStore.save(tailoredData, newName);
      setCurrentFileId(newId);
      setRefreshTrigger(prev => prev + 1);
      showToast("Resume tailored to job!", "success");

    } catch (e) {
      showToast("Failed to tailor resume", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Handle Cover Letter Generation
  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      showToast("Paste a Job Description to generate a letter.", "error");
      return;
    }
    setIsWritingLetter(true);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson: resumeData, jobDescription }),
      });
      
      if (!res.ok) throw new Error('Failed');
      
      const data = await res.json();
      setCoverLetterContent(data.coverLetter);
      setIsCoverLetterOpen(true);
      showToast("Cover Letter Generated!", "success");
    } catch (e) {
      showToast("Could not generate cover letter.", "error");
    } finally {
      setIsWritingLetter(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: resumeData, theme, settings: { educationFirst } }), 
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${resumeData.personalInfo.name.replace(' ', '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("PDF downloaded!", "success");
    } catch (e) {
      showToast("Error generating PDF", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden text-gray-900">
      
      {/* TOAST CONTAINER */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar 
        currentFileId={currentFileId}
        onSelect={handleSelectResume}
        onNew={handleNewResume}
        refreshTrigger={refreshTrigger}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* MODALS */}
        <ImportModal 
          isOpen={isImportOpen} 
          onClose={() => setIsImportOpen(false)} 
          onImport={handleImportSuccess}
        />
        <CoverLetterModal 
          isOpen={isCoverLetterOpen}
          onClose={() => setIsCoverLetterOpen(false)}
          initialContent={coverLetterContent}
        />

        {/* TOP BAR (Header) */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
          
          <div className="flex items-center gap-4 w-1/3">
             <input 
               value={fileName}
               onChange={(e) => setFileName(e.target.value)}
               className="text-lg font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-colors w-full"
               placeholder="Resume Name..."
             />
             <span className="text-xs text-gray-400 whitespace-nowrap">
               {currentFileId ? "Saved" : "Unsaved"}
             </span>
          </div>

          <div className="flex gap-4">
            {/* THEME SELECTOR */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {['modern', 'classic', 'creative'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t as any)}
                  className={`px-3 py-1 text-xs font-bold rounded capitalize transition-all ${theme === t ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* STRUCTURE TOGGLE */}
            <button 
              onClick={() => setEducationFirst(!educationFirst)}
              className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 border border-gray-200"
              title="Toggle Order"
            >
              {educationFirst ? "Edu ↑ Skills ↓" : "Skills ↑ Edu ↓"}
            </button>
          </div>

          <div className="flex gap-3">
             <button onClick={() => setIsImportOpen(true)} className="text-sm font-bold text-gray-600 hover:text-black px-3 py-2 border rounded">
                Import Text
             </button>
             <button onClick={handleSave} className="text-sm font-bold bg-gray-800 text-white px-4 py-2 rounded hover:bg-black">
                Save
             </button>
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="flex-grow flex overflow-hidden">
          
          {/* LEFT: EDITOR */}
          <div className="w-5/12 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar p-6 pb-24">
            
            {/* AI TOOLBOX */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm mb-6">
              <label className="block text-xs font-bold uppercase text-purple-800 mb-2">Target Job Description</label>
              <textarea
                className="w-full h-24 p-3 text-xs text-gray-900 border border-purple-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Paste JD here to auto-tailor experience..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleTailor}
                  disabled={isGenerating || isWritingLetter}
                  className={`flex-1 py-2 rounded text-sm font-bold text-white shadow transition-all
                    ${isGenerating ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isGenerating ? "Optimizing..." : "✨ Auto-Tailor"}
                </button>
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={isGenerating || isWritingLetter}
                  className={`flex-1 py-2 rounded text-sm font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 shadow-sm transition-all border border-purple-200`}
                >
                  {isWritingLetter ? "Writing..." : "📝 Write Letter"}
                </button>
              </div>
            </div>

            {/* EDITOR TABS */}
            <div className="border-b border-gray-200 flex gap-4 mb-4">
              <button onClick={() => setActiveTab('editor')} className={`pb-2 text-sm font-bold ${activeTab === 'editor' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>Visual Editor</button>
              <button onClick={() => setActiveTab('json')} className={`pb-2 text-sm font-bold ${activeTab === 'json' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>Raw JSON</button>
            </div>

            {/* FORM CONTENT */}
            {activeTab === 'editor' ? (
              <div className="space-y-2">
                <Accordion title="Personal Info" isOpen={openSections.personal} onToggle={() => toggleSection('personal')}>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field" placeholder="Full Name" value={resumeData.personalInfo.name || ''} onChange={(e) => handlePersonalChange('name', e.target.value)} />
                    <input className="input-field" placeholder="Location" value={resumeData.personalInfo.location || ''} onChange={(e) => handlePersonalChange('location', e.target.value)} />
                    <input className="input-field" placeholder="Phone" value={resumeData.personalInfo.phone || ''} onChange={(e) => handlePersonalChange('phone', e.target.value)} />
                    <input className="input-field" placeholder="Email" value={resumeData.personalInfo.email || ''} onChange={(e) => handlePersonalChange('email', e.target.value)} />
                    <input className="input-field" placeholder="LinkedIn" value={resumeData.personalInfo.linkedin || ''} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} />
                    <input className="input-field" placeholder="Portfolio" value={resumeData.personalInfo.portfolio || ''} onChange={(e) => handlePersonalChange('portfolio', e.target.value)} />
                  </div>
                </Accordion>

                <Accordion title="Summary" isOpen={openSections.summary} onToggle={() => toggleSection('summary')}>
                  <textarea className="w-full h-32 p-3 text-xs text-gray-900 border rounded bg-gray-50" value={resumeData.summary || ''} onChange={(e) => setResumeData(prev => ({...prev, summary: e.target.value}))} />
                </Accordion>

                <Accordion title="Experience" isOpen={openSections.experience} onToggle={() => toggleSection('experience')}>
                  <ExperienceForm 
                    data={resumeData.experience} 
                    onChange={(idx, field, val) => handleArrayFieldChange('experience', idx, field, val)}
                    onMove={(idx, dir) => moveItem('experience', idx, dir)}
                    onDelete={(idx) => removeItem('experience', idx)}
                    onAdd={() => addItem('experience')}
                  />
                </Accordion>

                <Accordion title="Education" isOpen={openSections.education} onToggle={() => toggleSection('education')}>
                  <EducationForm
                     data={resumeData.education}
                     onChange={(idx, field, val) => handleArrayFieldChange('education', idx, field, val)}
                     onMove={(idx, dir) => moveItem('education', idx, dir)}
                     onDelete={(idx) => removeItem('education', idx)}
                     onAdd={() => addItem('education')}
                  />
                </Accordion>

                <Accordion title="Skills & Expertise" isOpen={openSections.skills} onToggle={() => toggleSection('skills')}>
                  <SkillsForm
                     data={resumeData.skills}
                     onChange={(idx, field, val) => handleArrayFieldChange('skills', idx, field, val)}
                     onMove={(idx, dir) => moveItem('skills', idx, dir)}
                     onDelete={(idx) => removeItem('skills', idx)}
                     onAdd={() => addItem('skills')}
                  />
                </Accordion>
              </div>
            ) : (
              <textarea
                className="w-full h-[600px] p-4 font-mono text-xs border rounded bg-gray-900 text-green-400 focus:outline-none"
                value={JSON.stringify(resumeData, null, 2)}
                onChange={(e) => { try { setResumeData(JSON.parse(e.target.value)) } catch(err) {} }}
              />
            )}
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="w-7/12 bg-gray-600 p-8 overflow-y-auto flex justify-center items-start custom-scrollbar relative">
            <div className="sticky top-0 scale-[0.8] 2xl:scale-90 origin-top shadow-2xl transition-transform duration-200">
               <ResumePreview data={resumeData} theme={theme} educationFirst={educationFirst} />
            </div>

            <div className="fixed bottom-6 right-8">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="shadow-lg py-3 px-6 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all flex items-center gap-2"
              >
                {isDownloading ? (
                   <span>Generating...</span>
                ) : (
                   <>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Download PDF
                   </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .input-field { 
          width: 100%; 
          padding: 6px 8px; 
          font-size: 12px; 
          border: 1px solid #e5e7eb; 
          border-radius: 4px; 
          outline: none; 
          transition: all 0.2s; 
          color: #111827; 
          background-color: #ffffff;
        }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
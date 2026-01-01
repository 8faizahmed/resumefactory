'use client';
import { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';
import { JobApplication } from '@/types/job';
import { ResumePreview } from '../ResumePreview';
import { CoverLetterTemplate } from '../templates/CoverLetterTemplate';

// Components
import { Accordion } from '../editor/Accordion';
import { ExperienceForm } from '../editor/ExperienceForm';
import { EducationForm } from '../editor/EducationForm';
import { SkillsForm } from '../editor/SkillsForm';
import { InterviewPrep, Question } from './InterviewPrep';
import { Toast, ToastMessage } from '../Toast';

// Services
import { ResumeStore } from '@/app/services/resumeStore';
import { JobStore } from '@/app/services/jobStore';

interface Props {
  jobId: string;
  onBack: () => void;
}

// UI Helper: Consistent Section Header
const SectionHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest">{title}</h3>
    {action}
  </div>
);

export const Workspace = ({ jobId, onBack }: Props) => {
  // DATA STATE
  const [job, setJob] = useState<JobApplication | undefined>(undefined);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  // UI STATE
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter' | 'interview'>('resume');
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [theme, setTheme] = useState<'modern' | 'classic' | 'creative'>('modern');
  const [educationFirst, setEducationFirst] = useState(true);
  
  // LOADING STATE
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrepGenerating, setIsPrepGenerating] = useState(false);
  
  // TOAST
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // INTERVIEW STATE
  const [interviewQuestions, setInterviewQuestions] = useState<Question[]>([]);

  // ACCORDION STATE
  const [openSections, setOpenSections] = useState({
    personal: true, summary: true, experience: true, education: false, skills: false
  });
  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    const jobData = JobStore.getById(jobId);
    if (jobData) {
      setJob(jobData);
      const resume = ResumeStore.getById(jobData.resumeId);
      if (resume) setResumeData(resume.data);
      if (jobData.interviewQuestions && Array.isArray(jobData.interviewQuestions)) {
         setInterviewQuestions(jobData.interviewQuestions as unknown as Question[]);
      }
    }
  }, [jobId]);

  // --- SAVE HANDLERS ---
  const handleResumeSave = (newData: ResumeData) => {
    if (!job) return;
    setResumeData(newData);
    ResumeStore.save(newData, `For ${job.company}`, job.resumeId);
  };

  const handleJobUpdate = (updates: Partial<JobApplication>) => {
    if (!job) return;
    JobStore.update(job.id, updates);
    setJob(prev => prev ? ({ ...prev, ...updates }) : undefined);
  };

  // --- API HANDLERS ---
  const handleTailor = async () => {
    if (!job?.jobDescription) return showToast("No Job Description found!", "error");
    if (!resumeData) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson: resumeData, jobDescription: job.jobDescription }),
      });
      if (!res.ok) throw new Error('Failed');
      const tailoredData = await res.json();
      
      handleResumeSave(tailoredData);
      showToast("Resume tailored successfully!", "success");
    } catch (e) {
      showToast("Failed to tailor resume", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!job?.jobDescription) return showToast("No Job Description found!", "error");
    if (!resumeData) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson: resumeData, jobDescription: job.jobDescription }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      
      handleJobUpdate({ coverLetter: data.coverLetter });
      showToast("Cover Letter Generated!", "success");
    } catch (e) {
      showToast("Could not generate cover letter.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeData || !job) return;
    setIsDownloading(true);
    
    try {
      let endpoint = '/api/generate-pdf';
      let payload = { data: resumeData, theme, settings: { educationFirst } };
      let filename = `Resume_${job.company}_${job.role}.pdf`;

      if (activeTab === 'cover-letter') {
        if (!job.coverLetter) return showToast("No cover letter content", "error");
        endpoint = '/api/generate-cover-letter-pdf';
        // @ts-ignore
        payload = { personalInfo: resumeData.personalInfo, content: job.coverLetter };
        filename = `CoverLetter_${job.company}_${job.role}.pdf`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Download started!", "success");
    } catch (e) {
      showToast("Download failed", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (!job?.jobDescription) return showToast("No Job Description found!", "error");
    if (!resumeData) return;

    setIsPrepGenerating(true);
    try {
      const res = await fetch('/api/generate-interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson: resumeData, jobDescription: job.jobDescription }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInterviewQuestions(data.questions);
      JobStore.update(job.id, { interviewQuestions: data.questions } as any);
      showToast("Interview Prep Ready!", "success");
    } catch (e) {
      showToast("Failed to generate prep", "error");
    } finally {
      setIsPrepGenerating(false);
    }
  };

  // Helpers
  const handlePersonalChange = (field: string, value: string) => {
    if(!resumeData) return;
    handleResumeSave({ ...resumeData, personalInfo: { ...resumeData.personalInfo, [field]: value } });
  };
  const updateArray = (section: 'experience' | 'education' | 'skills', idx: number, field: string, value: any) => {
    if(!resumeData) return;
    const newData = { ...resumeData };
    // @ts-ignore
    newData[section][idx][field] = value;
    handleResumeSave(newData);
  };

  if (!job || !resumeData) return <div className="p-10 text-center">Loading Workspace...</div>;

  const rightPanelBg = activeTab === 'interview' ? 'bg-gray-50' : 'bg-gray-700';

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden text-gray-900">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* === HEADER === */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-500 hover:text-black font-bold text-sm flex items-center gap-2 transition-colors px-2 py-1 rounded hover:bg-gray-100">
              <span>←</span> Back
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">{job.role}</h1>
              <div className="text-xs text-gray-500 font-medium">at {job.company}</div>
            </div>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${job.status === 'applied' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {job.status}
            </span>
          </div>

          {/* TAB SWITCHER */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex bg-gray-100 p-1 rounded-lg shadow-inner">
            {[
              { id: 'resume', label: 'Resume', icon: '📄' },
              { id: 'cover-letter', label: 'Cover Letter', icon: '✉️' },
              { id: 'interview', label: 'Interview Prep', icon: '🎤' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
             {/* Resume Settings */}
             {activeTab === 'resume' && (
               <div className="flex bg-gray-100 rounded-lg p-1 gap-1 border border-gray-200">
                  {['modern', 'classic', 'creative'].map((t) => (
                    <button key={t} onClick={() => setTheme(t as any)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${theme === t ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}>{t}</button>
                  ))}
               </div>
             )}
             
             {/* Export Button - Hidden on Interview Tab */}
             {activeTab !== 'interview' && (
               <button 
                 onClick={handleDownload} 
                 className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black flex items-center gap-2 shadow-md transition-all hover:translate-y-[-1px]"
               >
                 {isDownloading ? "..." : (
                   <>
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     {activeTab === 'cover-letter' ? 'Export Letter' : 'Export Resume'}
                   </>
                 )}
               </button>
             )}
          </div>
        </header>

        {/* === MAIN CONTENT === */}
        <div className="flex-grow flex overflow-hidden">
          
          {/* LEFT PANEL: Context & Tools */}
          <div className="w-5/12 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar p-0 flex flex-col">
            
            {/* === RESUME TAB === */}
            {activeTab === 'resume' && (
              <>
                {/* 1. Major View Tabs */}
                <div className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-gray-200 flex">
                  <button 
                    onClick={() => setIsEditingResume(false)} 
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${!isEditingResume ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    Job Context
                  </button>
                  <button 
                    onClick={() => setIsEditingResume(true)} 
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${isEditingResume ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    Editor
                  </button>
                </div>

                <div className="p-6 pb-24 space-y-8">
                  {!isEditingResume ? (
                    // CONTEXT MODE
                    <div className="space-y-8 animate-fade-in-up">
                      {/* Job Description Card */}
                      <div>
                        <SectionHeader title="Job Description" />
                        <div className="relative group">
                          <textarea
                            className="w-full h-64 p-4 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 resize-none leading-relaxed transition-all group-hover:bg-white group-hover:shadow-sm"
                            value={job.jobDescription}
                            onChange={(e) => handleJobUpdate({ jobDescription: e.target.value })}
                            placeholder="Paste the Job Description here..."
                          />
                          <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium bg-white/80 px-2 py-1 rounded backdrop-blur">
                            Autosaved
                          </div>
                        </div>
                      </div>

                      {/* AI Tools Card */}
                      <div>
                        <SectionHeader title="AI Assistant" />
                        <div className="p-1 bg-purple-50/50 rounded-xl border border-purple-100">
                          <div className="bg-white rounded-lg p-5 shadow-sm border border-purple-100/50">
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Tailor Resume content</h4>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                              Analyze the job description and rewrite your summary, skills, and experience bullets to match key requirements.
                            </p>
                            <button 
                              onClick={handleTailor} 
                              disabled={isGenerating}
                              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-200 transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                            >
                              {isGenerating ? "Optimizing..." : "✨ Auto-Tailor Resume"}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Structure Settings */}
                      <div>
                         <SectionHeader title="Layout Settings" />
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => setEducationFirst(true)}
                              className={`py-3 px-4 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-1 ${educationFirst ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                            >
                              <span>🎓 Education Top</span>
                            </button>
                            <button 
                              onClick={() => setEducationFirst(false)}
                              className={`py-3 px-4 text-xs font-bold rounded-xl border transition-all flex flex-col items-center gap-1 ${!educationFirst ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                            >
                              <span>🛠 Skills Top</span>
                            </button>
                         </div>
                      </div>
                    </div>
                  ) : (
                    // EDIT MODE
                    <div className="space-y-4 animate-fade-in-up">
                      <Accordion title="Personal Info" isOpen={openSections.personal} onToggle={() => toggleSection('personal')}>
                        <div className="grid grid-cols-2 gap-3">
                          {['name', 'location', 'phone', 'email', 'linkedin', 'portfolio'].map((field) => (
                            <div key={field}>
                              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block ml-1">{field}</label>
                              {/* @ts-ignore */}
                              <input className="input-field" value={resumeData.personalInfo[field]} onChange={(e) => handlePersonalChange(field, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      </Accordion>
                      <Accordion title="Summary" isOpen={openSections.summary} onToggle={() => toggleSection('summary')}>
                        <textarea className="w-full h-32 p-3 text-xs text-gray-900 border rounded bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-1 focus:ring-black/10" value={resumeData.summary} onChange={(e) => handleResumeSave({...resumeData, summary: e.target.value})} />
                      </Accordion>
                      <Accordion title="Experience" isOpen={openSections.experience} onToggle={() => toggleSection('experience')}>
                        <ExperienceForm data={resumeData.experience} onChange={(idx, f, v) => updateArray('experience', idx, f, v)} onMove={() => {}} onDelete={() => {}} onAdd={() => {}} />
                      </Accordion>
                      <Accordion title="Education" isOpen={openSections.education} onToggle={() => toggleSection('education')}>
                        <EducationForm data={resumeData.education} onChange={(idx, f, v) => updateArray('education', idx, f, v)} onMove={() => {}} onDelete={() => {}} onAdd={() => {}} />
                      </Accordion>
                      <Accordion title="Skills" isOpen={openSections.skills} onToggle={() => toggleSection('skills')}>
                        <SkillsForm data={resumeData.skills} onChange={(idx, f, v) => updateArray('skills', idx, f, v)} onMove={() => {}} onDelete={() => {}} onAdd={() => {}} />
                      </Accordion>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* === COVER LETTER TAB === */}
            {activeTab === 'cover-letter' && (
              <div className="p-6 pb-24 flex flex-col h-full gap-6 animate-fade-in-up">
                <div>
                  <SectionHeader 
                    title="Letter Content" 
                    action={
                      <button 
                        onClick={handleGenerateCoverLetter} 
                        disabled={isGenerating}
                        className="text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors flex items-center gap-1"
                      >
                        {isGenerating ? "Writing..." : "✨ AI Write"}
                      </button>
                    } 
                  />
                  <textarea
                    className="w-full h-[500px] p-6 text-sm text-gray-800 leading-relaxed bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 resize-none font-serif shadow-sm transition-all"
                    value={job.coverLetter || ''}
                    onChange={(e) => handleJobUpdate({ coverLetter: e.target.value })}
                    placeholder="Write your cover letter here or use AI to generate one..."
                  />
                </div>
              </div>
            )}

            {/* === INTERVIEW TAB === */}
            {activeTab === 'interview' && (
              <div className="p-6 pb-24 flex flex-col h-full gap-6 animate-fade-in-up">
                <div>
                  <SectionHeader title="Job Context" />
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <textarea
                      className="w-full h-48 text-xs text-gray-600 bg-transparent resize-none outline-none leading-relaxed"
                      value={job.jobDescription}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: PREVIEW / RESULTS */}
          <div className={`w-7/12 ${rightPanelBg} p-8 overflow-y-auto flex justify-center items-start custom-scrollbar relative transition-colors duration-300`}>
            
            {activeTab === 'resume' && (
              <div className="scale-[0.8] 2xl:scale-90 origin-top shadow-2xl transition-transform duration-300">
                 <ResumePreview data={resumeData} theme={theme} educationFirst={educationFirst} />
              </div>
            )}

            {activeTab === 'cover-letter' && (
              <div className="sticky top-0 scale-[0.8] 2xl:scale-90 origin-top shadow-2xl transition-transform duration-300 bg-white w-[8.5in] min-h-[11in]">
                 {job.coverLetter ? (
                   <CoverLetterTemplate personalInfo={resumeData.personalInfo} content={job.coverLetter} />
                 ) : (
                   <div className="flex flex-col items-center justify-center h-[11in] text-gray-300">
                     <div className="text-6xl mb-4 grayscale opacity-20">✉️</div>
                     <p className="font-bold text-gray-400">No Cover Letter Yet</p>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'interview' && (
              <div className="w-full max-w-3xl">
                <InterviewPrep 
                  questions={interviewQuestions} 
                  onGenerate={handleGenerateInterview} 
                  isGenerating={isPrepGenerating}
                  jobDescriptionExists={!!job.jobDescription}
                />
              </div>
            )}

          </div>

        </div>
      </div>
      <style jsx global>{`
        .input-field { width: 100%; padding: 8px 12px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 6px; outline: none; color: #111827; background-color: #ffffff; transition: all 0.2s; }
        .input-field:focus { border-color: #000; box-shadow: 0 0 0 1px #000; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
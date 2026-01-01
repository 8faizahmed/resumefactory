'use client';
import { useState, useEffect } from 'react';
import { ResumeData } from '@/types/resume';
import { JobApplication } from '@/types/job';
import { ResumePreview } from '../ResumePreview';

// Components
import { Accordion } from '../editor/Accordion';
import { ExperienceForm } from '../editor/ExperienceForm';
import { EducationForm } from '../editor/EducationForm';
import { SkillsForm } from '../editor/SkillsForm';
import { CoverLetterModal } from '../CoverLetterModal'; 
import { InterviewPrep, Question } from './InterviewPrep'; // NEW
import { Toast, ToastMessage } from '../Toast';

// Services
import { ResumeStore } from '@/app/services/resumeStore';
import { JobStore } from '@/app/services/jobStore';

interface Props {
  jobId: string;
  onBack: () => void;
}

export const Workspace = ({ jobId, onBack }: Props) => {
  const [job, setJob] = useState<JobApplication | undefined>(undefined);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  
  // Workspace State
  const [activeTab, setActiveTab] = useState<'resume' | 'interview'>('resume'); // Changed tabs logic
  const [editorTab, setEditorTab] = useState<'visual' | 'json'>('visual'); // Editor vs JSON sub-tab
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [theme, setTheme] = useState<'modern' | 'classic' | 'creative'>('modern');
  const [educationFirst, setEducationFirst] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Cover Letter
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState('');

  // Interview Prep (NEW)
  const [interviewQuestions, setInterviewQuestions] = useState<Question[]>([]);
  const [isPrepGenerating, setIsPrepGenerating] = useState(false);

  // Accordion State
  const [openSections, setOpenSections] = useState({
    personal: true, summary: true, experience: true, education: false, skills: false
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Load Data
  useEffect(() => {
    const jobData = JobStore.getById(jobId);
    if (jobData) {
      setJob(jobData);
      const resume = ResumeStore.getById(jobData.resumeId);
      if (resume) setResumeData(resume.data);
      if (jobData.coverLetter) setCoverLetterContent(jobData.coverLetter);
      if (jobData.interviewQuestions && Array.isArray(jobData.interviewQuestions)) {
         // Assuming we store them as strings in JobStore for now, or we can update JobStore type.
         // For now, let's just keep it in local state if we didn't update JobStore persistence deeply yet.
      }
    }
  }, [jobId]);

  // Save Resume Changes
  const handleResumeSave = (newData: ResumeData) => {
    if (!job) return;
    setResumeData(newData);
    ResumeStore.save(newData, `For ${job.company}`, job.resumeId);
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
      setOpenSections(prev => ({ ...prev, summary: true, experience: true, skills: true }));
      showToast("Resume tailored to this job!", "success");
    } catch (e) {
      showToast("Failed to tailor resume", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!job?.jobDescription) return showToast("No Job Description found!", "error");
    if (!resumeData) return;

    if (job.coverLetter && !confirm("Generate a NEW cover letter?")) {
        setIsCoverLetterOpen(true);
        return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson: resumeData, jobDescription: job.jobDescription }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCoverLetterContent(data.coverLetter);
      setIsCoverLetterOpen(true);
      
      JobStore.update(job.id, { coverLetter: data.coverLetter });
      setJob(prev => prev ? ({...prev, coverLetter: data.coverLetter}) : undefined);
      
      showToast("Cover Letter Generated!", "success");
    } catch (e) {
      showToast("Could not generate cover letter.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Generate Interview Questions
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
      showToast("Interview Prep Ready!", "success");
    } catch (e) {
      showToast("Failed to generate prep", "error");
    } finally {
      setIsPrepGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeData) return;
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
      a.download = `Resume_${job?.company}_${job?.role}.pdf`;
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

  // Helper Handlers...
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

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden text-gray-900">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      
      <CoverLetterModal 
        isOpen={isCoverLetterOpen} 
        onClose={() => setIsCoverLetterOpen(false)} 
        initialContent={coverLetterContent} 
        personalInfo={resumeData.personalInfo}
      />

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* WORKSPACE HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-500 hover:text-black font-bold text-sm flex items-center gap-1">← Back</button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{job.role}</h1>
              <div className="text-xs text-gray-500 font-medium">@ {job.company}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">{job.status}</span>
          </div>

          <div className="flex gap-4">
             {/* MAIN TABS */}
             <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('resume')}
                  className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'resume' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                >
                  Resume
                </button>
                <button 
                  onClick={() => setActiveTab('interview')}
                  className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'interview' ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}
                >
                  Interview Prep
                </button>
             </div>

             <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                {['modern', 'classic', 'creative'].map((t) => (
                  <button key={t} onClick={() => setTheme(t as any)} className={`px-3 py-1 text-xs font-bold rounded capitalize ${theme === t ? 'bg-white shadow text-black' : 'text-gray-500'}`}>{t}</button>
                ))}
             </div>
             <button onClick={handleDownload} className="text-sm font-bold bg-gray-900 text-white px-4 py-2 rounded hover:bg-black">Download PDF</button>
          </div>
        </header>

        {/* MAIN CONTENT SPLIT */}
        <div className="flex-grow flex overflow-hidden">
          
          {/* LEFT: EDITOR & CONTEXT (Hidden if Interview Mode) */}
          <div className={`${activeTab === 'interview' ? 'hidden' : 'w-5/12'} bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar p-6 pb-24`}>
            
            {/* JD CONTEXT */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase text-blue-800">Job Context</label>
              </div>
              <textarea
                className="w-full h-24 p-2 text-xs text-gray-700 border border-blue-200 rounded bg-white focus:outline-none resize-none"
                value={job.jobDescription}
                onChange={(e) => {
                  JobStore.update(job.id, { jobDescription: e.target.value });
                  setJob(prev => prev ? ({...prev, jobDescription: e.target.value}) : undefined);
                }}
                placeholder="Paste Job Description here..."
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={handleTailor} disabled={isGenerating} className="py-2 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {isGenerating ? "Optimizing..." : "✨ Auto-Tailor Resume"}
                </button>
                <button onClick={handleGenerateCoverLetter} className="py-2 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 rounded border border-blue-200">
                  📝 {coverLetterContent ? "View" : "Generate"} Cover Letter
                </button>
              </div>
            </div>

            {/* RESUME EDITOR */}
            <div className="border-b border-gray-200 flex gap-4 mb-4">
              <button onClick={() => setEditorTab('visual')} className={`pb-2 text-sm font-bold ${editorTab === 'visual' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>Visual Editor</button>
              <button onClick={() => setEditorTab('json')} className={`pb-2 text-sm font-bold ${editorTab === 'json' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}>Raw JSON</button>
            </div>

            {editorTab === 'visual' ? (
              <div className="space-y-2">
                <Accordion title="Personal Info" isOpen={openSections.personal} onToggle={() => toggleSection('personal')}>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field" placeholder="Full Name" value={resumeData.personalInfo.name} onChange={(e) => handlePersonalChange('name', e.target.value)} />
                    <input className="input-field" placeholder="Location" value={resumeData.personalInfo.location} onChange={(e) => handlePersonalChange('location', e.target.value)} />
                    <input className="input-field" placeholder="Phone" value={resumeData.personalInfo.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} />
                    <input className="input-field" placeholder="Email" value={resumeData.personalInfo.email} onChange={(e) => handlePersonalChange('email', e.target.value)} />
                    <input className="input-field" placeholder="LinkedIn" value={resumeData.personalInfo.linkedin} onChange={(e) => handlePersonalChange('linkedin', e.target.value)} />
                    <input className="input-field" placeholder="Portfolio" value={resumeData.personalInfo.portfolio} onChange={(e) => handlePersonalChange('portfolio', e.target.value)} />
                  </div>
                </Accordion>
                <Accordion title="Summary" isOpen={openSections.summary} onToggle={() => toggleSection('summary')}>
                  <textarea className="w-full h-32 p-3 text-xs text-gray-900 border rounded bg-gray-50" value={resumeData.summary} onChange={(e) => handleResumeSave({...resumeData, summary: e.target.value})} />
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
            ) : (
              <textarea className="w-full h-[600px] p-4 font-mono text-xs border rounded bg-gray-900 text-green-400 focus:outline-none" value={JSON.stringify(resumeData, null, 2)} onChange={(e) => { try { setResumeData(JSON.parse(e.target.value)) } catch(err) {} }} />
            )}
          </div>

          {/* RIGHT: PREVIEW or INTERVIEW */}
          <div className={`${activeTab === 'interview' ? 'w-full' : 'w-7/12'} bg-gray-100 flex flex-col`}>
            
            {activeTab === 'resume' ? (
              <div className="bg-gray-600 p-8 overflow-y-auto flex justify-center items-start custom-scrollbar flex-grow">
                <div className="sticky top-0 scale-[0.8] 2xl:scale-90 origin-top shadow-2xl">
                   <ResumePreview data={resumeData} theme={theme} educationFirst={educationFirst} />
                </div>
              </div>
            ) : (
              <div className="h-full bg-white">
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
        .input-field { width: 100%; padding: 6px 8px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 4px; outline: none; color: #111827; background-color: #ffffff; }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
      `}</style>
    </div>
  );
};
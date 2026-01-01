import React, { useState, useEffect } from 'react';
import { JobApplication, JobStatus } from '@/types/job';
import { JobStore } from '@/app/services/jobStore';
import { ResumeStore, SavedResume } from '@/app/services/resumeStore';
import { ResumeData } from '@/types/resume';
import { ImportModal } from '../ImportModal';

interface Props {
  onOpenJob: (id: string) => void;
}

export const JobTracker = ({ onOpenJob }: Props) => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering State
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  
  // New Job Form State
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Resume Selection State
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumeSearch, setResumeSearch] = useState('');
  const [resumeFilter, setResumeFilter] = useState<'all' | 'masters' | 'history'>('masters');
  const [isImportBaseOpen, setIsImportBaseOpen] = useState(false);

  useEffect(() => {
    const loadedJobs = JobStore.getAll();
    const loadedResumes = ResumeStore.getAll();
    setJobs(loadedJobs);
    setResumes(loadedResumes);
    
    // Auto-select logic
    const usedResumeIds = new Set(loadedJobs.map(j => j.resumeId));
    const masterResumes = loadedResumes.filter(r => !usedResumeIds.has(r.id));
    if (masterResumes.length > 0) {
      setSelectedResumeId(masterResumes[0].id);
    } else if (loadedResumes.length > 0) {
      setSelectedResumeId(loadedResumes[0].id);
    }
  }, []);

  const handleCreateJob = () => {
    if (!newCompany || !newRole) return alert("Company and Role are required");
    JobStore.create(newCompany, newRole, newDesc, selectedResumeId);
    setJobs(JobStore.getAll());
    setResumes(ResumeStore.getAll()); 
    setIsModalOpen(false);
    setNewCompany(''); setNewRole(''); setNewDesc('');
  };

  const handleStatusChange = (e: React.MouseEvent, id: string, status: JobStatus) => {
    e.stopPropagation();
    JobStore.update(id, { status });
    setJobs(JobStore.getAll());
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Delete this application?")) {
      JobStore.delete(id);
      setJobs(JobStore.getAll());
    }
  };

  const getFilteredJobs = () => {
    let filtered = jobs;
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(j => 
        j.company.toLowerCase().includes(lower) || 
        j.role.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(j => j.status === statusFilter);
    }

    return filtered;
  };

  // Resume Helpers
  const getFilteredResumes = () => {
    const usedResumeIds = new Set(jobs.map(j => j.resumeId));
    return resumes.filter(r => {
      if (resumeSearch && !r.name.toLowerCase().includes(resumeSearch.toLowerCase())) return false;
      if (resumeFilter === 'masters') return !usedResumeIds.has(r.id);
      if (resumeFilter === 'history') return usedResumeIds.has(r.id);
      return true;
    });
  };
  const getJobForResume = (resumeId: string) => jobs.find(j => j.resumeId === resumeId);

  const handleCreateBaseResume = () => {
    const defaultData: ResumeData = {
      personalInfo: { name: "New User", location: "", phone: "", email: "", linkedin: "", portfolio: "" },
      summary: "Professional summary...",
      experience: [], education: [], skills: []
    };
    const newId = ResumeStore.save(defaultData, "New Base Resume");
    setResumes(ResumeStore.getAll());
    setSelectedResumeId(newId);
    setResumeFilter('masters'); 
  };

  const handleImportBase = (data: ResumeData) => {
    const newId = ResumeStore.save(data, `Imported Base - ${data.personalInfo.name}`);
    setResumes(ResumeStore.getAll());
    setSelectedResumeId(newId);
    setResumeFilter('masters');
    setIsImportBaseOpen(false);
  };

  // --- VISUAL HELPERS ---
  const getCompanyColor = (company: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = company.length % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: JobStatus) => {
    switch(status) {
      case 'saved': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'applied': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interviewing': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'offer': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100';
    }
  };

  const COLUMNS: { id: JobStatus, label: string, color: string, border: string }[] = [
    { id: 'saved', label: 'Wishlist', color: 'bg-slate-50', border: 'border-slate-200' },
    { id: 'applied', label: 'Applied', color: 'bg-blue-50/50', border: 'border-blue-100' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-purple-50/50', border: 'border-purple-100' },
    { id: 'offer', label: 'Offer', color: 'bg-emerald-50/50', border: 'border-emerald-100' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-50/50', border: 'border-red-100' },
  ];

  const KanbanColumn = ({ col }: { col: typeof COLUMNS[0] }) => {
    const columnJobs = getFilteredJobs().filter(j => j.status === col.id);
    return (
      <div className={`flex-1 min-w-[280px] rounded-2xl flex flex-col h-full border ${col.border} ${col.color} backdrop-blur-sm`}>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${col.id === 'offer' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
            <h3 className="font-bold text-xs uppercase text-gray-600 tracking-wider">{col.label}</h3>
          </div>
          <span className="bg-white text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100">
            {columnJobs.length}
          </span>
        </div>
        <div className="p-2 px-3 space-y-3 overflow-y-auto custom-scrollbar flex-grow pb-20">
          {columnJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 opacity-40">
              <div className="text-xl mb-1">📭</div>
              <div className="text-[10px] uppercase font-bold text-gray-500">Empty</div>
            </div>
          )}
          {columnJobs.map(job => (
            <div 
              key={job.id}
              onClick={() => onOpenJob(job.id)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-center">
                  <div className={`w-8 h-8 rounded-lg ${getCompanyColor(job.company)} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                    {job.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm leading-tight">{job.role}</div>
                    <div className="text-xs text-gray-500 font-medium">{job.company}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="text-[10px] text-gray-400 font-medium">
                  {new Date(job.dateAdded).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 bottom-3 bg-white pl-2 shadow-sm rounded-lg border border-gray-100 p-0.5">
                   {col.id !== 'saved' && (
                     <button 
                       onClick={(e) => handleStatusChange(e, job.id, getPrevStatus(col.id))}
                       className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded transition-colors"
                       title="Move Back"
                     >
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                     </button>
                   )}
                   {col.id !== 'rejected' && col.id !== 'offer' && (
                     <button 
                       onClick={(e) => handleStatusChange(e, job.id, getNextStatus(col.id))}
                       className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors"
                       title="Move Next"
                     >
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                     </button>
                   )}
                   <button onClick={(e) => handleDelete(e, job.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getNextStatus = (current: JobStatus): JobStatus => {
    const flow: JobStatus[] = ['saved', 'applied', 'interviewing', 'offer'];
    const idx = flow.indexOf(current);
    return idx !== -1 && idx < flow.length - 1 ? flow[idx + 1] : current;
  };

  const getPrevStatus = (current: JobStatus): JobStatus => {
    const flow: JobStatus[] = ['saved', 'applied', 'interviewing', 'offer'];
    if (current === 'rejected') return 'interviewing';
    const idx = flow.indexOf(current);
    return idx > 0 ? flow[idx - 1] : current;
  };

  return (
    <div className="h-screen bg-white text-gray-900 font-sans flex flex-col overflow-hidden">
      
      <ImportModal isOpen={isImportBaseOpen} onClose={() => setIsImportBaseOpen(false)} onImport={handleImportBase} />

      {/* HEADER & BRANDING */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0 z-10">
        <div className="px-8 py-5 flex justify-between items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-lg shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">CareerFlow</h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Application Operating System</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all w-48 group-hover:w-64"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>List</button>
              <button onClick={() => setViewMode('board')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Board</button>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-all shadow-md flex items-center gap-2">
              <span>+</span> New App
            </button>
          </div>
        </div>

        {/* SUB-HEADER: Stats & Filters */}
        <div className="px-8 pb-4 flex justify-between items-center border-t border-gray-50 pt-4">
          <div className="flex gap-8">
            {['Applied', 'Interviewing', 'Offer'].map(status => {
              const count = jobs.filter(j => j.status === status.toLowerCase()).length;
              const color = status === 'Offer' ? 'text-emerald-600' : (status === 'Interviewing' ? 'text-purple-600' : 'text-blue-600');
              return (
                <div key={status} className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${color}`}>{count}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{status}</span>
                </div>
              );
            })}
          </div>

          {viewMode === 'list' && (
            <div className="flex gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Filter:</span>
              {(['all', 'saved', 'applied', 'interviewing', 'offer', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-bold rounded-full capitalize border transition-all ${
                    statusFilter === status 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-grow overflow-hidden p-6 bg-gray-50/50">
        {viewMode === 'board' ? (
          <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {COLUMNS.map(col => <KanbanColumn key={col.id} col={col} />)}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full overflow-y-auto shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th className="p-4 pl-6">Company</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applied</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredJobs().map(job => (
                  <tr key={job.id} onClick={() => onOpenJob(job.id)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer group transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${getCompanyColor(job.company)} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                          {job.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="font-bold text-gray-900 text-sm">{job.company}</div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-700 text-sm">{job.role}</td>
                    <td className="p-4">
                      <select
                        value={job.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(e as any, job.id, e.target.value as JobStatus)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 bg-white hover:bg-gray-50 ${getStatusColor(job.status)}`}
                      >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-mono">{new Date(job.dateAdded).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right">
                      <button onClick={(e) => handleDelete(e, job.id)} className="text-gray-300 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-3 px-8 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest z-10">
        <div>&copy; 2025 CareerFlow OS</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-600">Privacy</a>
          <a href="#" className="hover:text-gray-600">Terms</a>
          <a href="#" className="hover:text-gray-600">Help</a>
        </div>
      </footer>

      {/* NEW JOB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Track New Opportunity</h2>
              <p className="text-sm text-gray-500">Add details and select a base resume to tailor.</p>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow space-y-8">
              {/* 1. Job Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Company</label>
                  <input className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/30" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Role Title</label>
                  <input className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/30" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Senior Product Manager" />
                </div>
              </div>

              {/* 2. Job Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Job Description</label>
                <textarea className="w-full p-3 text-sm border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 resize-none bg-gray-50/30" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Paste JD here for auto-tailoring..." />
              </div>

              {/* 3. Base Resume Selection */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold uppercase text-gray-500">Start from Base Resume</label>
                  <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button onClick={() => setResumeFilter('masters')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${resumeFilter === 'masters' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}>Templates</button>
                    <button onClick={() => setResumeFilter('history')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${resumeFilter === 'history' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}>History</button>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-48 flex flex-col">
                  <div className="border-b border-gray-100 p-2">
                    <input 
                      className="w-full text-xs outline-none px-2 py-1"
                      placeholder="Filter resumes..."
                      value={resumeSearch}
                      onChange={(e) => setResumeSearch(e.target.value)}
                    />
                  </div>
                  <div className="overflow-y-auto custom-scrollbar flex-grow p-1">
                    {getFilteredResumes().length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className="text-xs text-gray-400 mb-3">No matching resumes found.</div>
                        <div className="flex gap-2">
                          <button onClick={() => setIsImportBaseOpen(true)} className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 text-gray-700">Import PDF Text</button>
                          <button onClick={handleCreateBaseResume} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Create Empty</button>
                        </div>
                      </div>
                    )}
                    {getFilteredResumes().map(resume => (
                      <div 
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer border transition-all ${selectedResumeId === resume.id ? 'bg-blue-50 border-blue-500 shadow-inner' : 'border-transparent hover:bg-gray-50'}`}
                      >
                        <div>
                          <div className="text-xs font-bold text-gray-800">{resume.name}</div>
                          <div className="text-[10px] text-gray-400">{new Date(resume.createdAt).toLocaleDateString()}</div>
                        </div>
                        {selectedResumeId === resume.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreateJob} className="px-6 py-2.5 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all transform hover:scale-[1.02]">
                Create Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
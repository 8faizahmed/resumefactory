import React, { useState, useEffect } from 'react';
import { JobApplication, JobStatus } from '@/types/job';
import { JobStore } from '@/app/services/jobStore';

interface Props {
  onOpenJob: (id: string) => void;
}

export const JobTracker = ({ onOpenJob }: Props) => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setJobs(JobStore.getAll());
  }, []);

  const handleCreateJob = () => {
    if (!newCompany || !newRole) return alert("Company and Role are required");
    JobStore.create(newCompany, newRole, newDesc);
    setJobs(JobStore.getAll());
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

  // STYLES & CONFIG
  const COLUMNS: { id: JobStatus, label: string, color: string }[] = [
    { id: 'saved', label: 'Wishlist', color: 'bg-gray-100 border-gray-200' },
    { id: 'applied', label: 'Applied', color: 'bg-blue-50 border-blue-200' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-purple-50 border-purple-200' },
    { id: 'offer', label: 'Offer', color: 'bg-green-50 border-green-200' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-50 border-red-200' },
  ];

  const KanbanColumn = ({ col }: { col: typeof COLUMNS[0] }) => {
    const columnJobs = jobs.filter(j => j.status === col.id);
    
    return (
      <div className={`flex-1 min-w-[260px] rounded-xl flex flex-col h-full border ${col.color}`}>
        {/* Column Header */}
        <div className="p-3 flex justify-between items-center border-b border-gray-200/50">
          <h3 className="font-bold text-xs uppercase text-gray-600 tracking-wider">{col.label}</h3>
          <span className="bg-white/50 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200/50">
            {columnJobs.length}
          </span>
        </div>

        {/* Droppable Area */}
        <div className="p-2 space-y-2 overflow-y-auto custom-scrollbar flex-grow">
          {columnJobs.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <div className="text-2xl mb-1">📭</div>
              <div className="text-[10px] uppercase font-bold">Empty</div>
            </div>
          )}
          
          {columnJobs.map(job => (
            <div 
              key={job.id}
              onClick={() => onOpenJob(job.id)}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group relative"
            >
              <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{job.role}</div>
              <div className="text-xs text-gray-500 font-medium mb-3">{job.company}</div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="text-[10px] text-gray-400 font-mono">
                  {new Date(job.dateAdded).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                </div>
                
                {/* Hover Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bottom-2 bg-white pl-2">
                   {col.id !== 'rejected' && col.id !== 'offer' && (
                     <button 
                       onClick={(e) => handleStatusChange(e, job.id, getNextStatus(col.id))}
                       className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 border border-gray-200"
                       title="Move Next"
                     >
                       →
                     </button>
                   )}
                   <button onClick={(e) => handleDelete(e, job.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded border border-transparent hover:border-red-100">✕</button>
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

  return (
    <div className="h-screen bg-white text-gray-900 font-sans flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0 bg-white z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your pipeline and tailor resumes for every role.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Board
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
          >
            <span>+</span> Track Job
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-grow overflow-hidden p-6 bg-white">
        
        {viewMode === 'board' ? (
          <div className="flex gap-4 h-full overflow-x-auto pb-2">
            {COLUMNS.map(col => <KanbanColumn key={col.id} col={col} />)}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                  <th className="p-4 pl-6">Role & Company</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applied</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} onClick={() => onOpenJob(job.id)} className="border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-gray-900">{job.role}</div>
                      <div className="text-xs text-gray-500">{job.company}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${COLUMNS.find(c => c.id === job.status)?.color.replace('bg-', 'text-').replace('border-', 'border-') || 'text-gray-500 border-gray-200'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{new Date(job.dateAdded).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right">
                      <button onClick={(e) => handleDelete(e, job.id)} className="text-gray-400 hover:text-red-500 px-2 font-bold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW JOB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Application</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Company</label>
                <input className="w-full p-2.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="e.g. Google" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Role Title</label>
                <input className="w-full p-2.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Senior Product Manager" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Job Description</label>
                <textarea className="w-full p-2.5 text-sm border border-gray-300 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Paste JD here..." />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleCreateJob} className="px-4 py-2 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 shadow-md">Start Tracking</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
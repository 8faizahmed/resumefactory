import { JobApplication, JobStatus } from '@/types/job';
import { ResumeStore } from './resumeStore';
import { ResumeData } from '@/types/resume';

const STORAGE_KEY = 'resume_builder_jobs';

// Default empty resume if absolutely nothing exists
const defaultResume: ResumeData = {
  personalInfo: { name: "Your Name", location: "", phone: "", email: "", linkedin: "", portfolio: "" },
  summary: "", experience: [], education: [], skills: []
};

export const JobStore = {
  getAll: (): JobApplication[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).sort((a: any, b: any) => b.dateUpdated - a.dateUpdated) : [];
  },

  getById: (id: string): JobApplication | undefined => {
    return JobStore.getAll().find(j => j.id === id);
  },

  // Create a new Job Application with a specific Base Resume
  create: (company: string, role: string, description: string = "", sourceResumeId?: string): string => {
    const jobs = JobStore.getAll();
    const id = crypto.randomUUID();
    
    // 1. Resolve Source Data (The "Base")
    const allResumes = ResumeStore.getAll();
    let sourceData: ResumeData = defaultResume;

    if (sourceResumeId) {
      const found = allResumes.find(r => r.id === sourceResumeId);
      if (found) sourceData = found.data;
    } else if (allResumes.length > 0) {
      // Fallback to most recent if user didn't pick one
      sourceData = allResumes[0].data;
    }
    
    // 2. Create a NEW Snapshot specifically for this job
    // We clone the data so editing this job's resume doesn't touch the original.
    const snapshotId = ResumeStore.save(
      sourceData, 
      `For ${company} - ${role}` 
    );

    // 3. Create the Job
    const newJob: JobApplication = {
      id,
      company,
      role,
      jobDescription: description,
      status: 'saved',
      dateAdded: Date.now(),
      dateUpdated: Date.now(),
      resumeId: snapshotId // Link to the new snapshot
    };

    jobs.unshift(newJob);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    return id;
  },

  update: (id: string, updates: Partial<JobApplication>) => {
    const jobs = JobStore.getAll();
    const index = jobs.findIndex(j => j.id === id);
    if (index >= 0) {
      jobs[index] = { ...jobs[index], ...updates, dateUpdated: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    }
  },

  delete: (id: string) => {
    const jobs = JobStore.getAll();
    const filtered = jobs.filter(j => j.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
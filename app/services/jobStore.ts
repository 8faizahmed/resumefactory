import { JobApplication, JobStatus } from '@/types/job';
import { ResumeStore } from './resumeStore';
import { ResumeData } from '@/types/resume';

const STORAGE_KEY = 'resume_builder_jobs';

// Default empty resume if none exists
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

  // Create a new Job Application AND a Resume Snapshot
  create: (company: string, role: string, description: string = ""): string => {
    const jobs = JobStore.getAll();
    const id = crypto.randomUUID();
    
    // 1. Create a Snapshot of the most recent resume (or default)
    const allResumes = ResumeStore.getAll();
    const masterResume = allResumes.length > 0 ? allResumes[0].data : defaultResume;
    
    // Save this new snapshot specifically for this job
    const snapshotId = ResumeStore.save(
      masterResume, 
      `For ${company} - ${role}` // Resume Name
    );

    // 2. Create the Job
    const newJob: JobApplication = {
      id,
      company,
      role,
      jobDescription: description,
      status: 'saved', // Default status
      dateAdded: Date.now(),
      dateUpdated: Date.now(),
      resumeId: snapshotId
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
    
    // Ideally, we should also delete the linked resume snapshot here to clean up, 
    // but we'll leave it for now in case of accidental deletion.
  }
};
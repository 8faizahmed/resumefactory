import { ResumeData } from '@/types/resume';

export interface SavedResume {
  id: string;
  name: string;
  createdAt: number;
  data: ResumeData;
}

const STORAGE_KEY = 'resume_builder_files';

export const ResumeStore = {
  save: (data: ResumeData, name?: string, existingId?: string): string => {
    if (typeof window === 'undefined') return '';
    const resumes = ResumeStore.getAll();
    const id = existingId || crypto.randomUUID();
    const timestamp = Date.now();
    
    // Default name logic if new
    const displayName = name || `Resume ${new Date().toLocaleDateString()}`;

    const newFile: SavedResume = {
      id,
      name: displayName,
      createdAt: timestamp,
      data
    };

    const index = resumes.findIndex(r => r.id === id);
    if (index >= 0) {
      resumes[index] = newFile;
    } else {
      resumes.unshift(newFile);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    return id;
  },

  getAll: (): SavedResume[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).sort((a: any, b: any) => b.createdAt - a.createdAt) : [];
  },

  getById: (id: string): SavedResume | undefined => {
    return ResumeStore.getAll().find(r => r.id === id);
  },

  delete: (id: string) => {
    const resumes = ResumeStore.getAll();
    const filtered = resumes.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // NEW: DUPLICATE FUNCTION
  duplicate: (id: string): string | null => {
    const original = ResumeStore.getById(id);
    if (!original) return null;

    const newId = crypto.randomUUID();
    const newFile: SavedResume = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      createdAt: Date.now()
    };

    const resumes = ResumeStore.getAll();
    resumes.unshift(newFile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    return newId;
  }
};
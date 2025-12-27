export interface ResumeData {
  personalInfo: {
    name: string;
    location: string;
    phone: string;
    email: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    date: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    details: string; // e.g., "Majors: Psychology..."
  }[];
  skills: {
    category: string;
    items: string; // e.g., "Python, Java, React"
  }[];
  notableAchievements?: {
    title: string;
    description: string;
  }[];
}
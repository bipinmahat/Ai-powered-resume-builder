'use client';

import { create } from 'zustand';

type Sections = {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
};

type ResumeState = {
  name: string;
  email: string;
  phone: string;
  role: string;       // title
  location: string;   // NEW
  sections: Sections;
  set: (p: Partial<ResumeState>) => void;
};

export const useResume = create<ResumeState>((set) => ({
  name: '',
  email: '',
  phone: '',
  role: '',
  location: '',
  sections: {
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
  },
  set: (p) => set(p),
}));

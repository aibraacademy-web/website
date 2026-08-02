import { JobOffer, JobFilterState, StatisticsData } from '../types';
import { INITIAL_JOBS } from '../data/initialJobs';

const STORAGE_KEY = 'aibra_academy_jobs';
const SAVED_JOBS_KEY = 'aibra_academy_saved_job_ids';

export const getStoredJobs = (): JobOffer[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading jobs from localStorage', error);
    return INITIAL_JOBS;
  }
};

export const saveJobs = (jobs: JobOffer[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.error('Error saving jobs to localStorage', error);
  }
};

export const addJobOffer = (newJob: Omit<JobOffer, 'id' | 'createdAtISO' | 'publishedAt' | 'viewsCount' | 'applicationsCount'>): JobOffer => {
  const currentJobs = getStoredJobs();
  
  const id = `job-${Date.now()}`;
  const now = new Date();
  
  const createdJob: JobOffer = {
    ...newJob,
    id,
    createdAtISO: now.toISOString(),
    publishedAt: 'Aujourd\'hui',
    viewsCount: 1,
    applicationsCount: 0,
  };

  const updatedJobs = [createdJob, ...currentJobs];
  saveJobs(updatedJobs);
  return createdJob;
};

export const getJobById = (id: string): JobOffer | undefined => {
  const jobs = getStoredJobs();
  return jobs.find(job => job.id === id);
};

export const incrementJobViews = (id: string): void => {
  const jobs = getStoredJobs();
  const updated = jobs.map(j => {
    if (j.id === id) {
      return { ...j, viewsCount: (j.viewsCount || 0) + 1 };
    }
    return j;
  });
  saveJobs(updated);
};

export const incrementJobApplications = (id: string): void => {
  const jobs = getStoredJobs();
  const updated = jobs.map(j => {
    if (j.id === id) {
      return { ...j, applicationsCount: (j.applicationsCount || 0) + 1 };
    }
    return j;
  });
  saveJobs(updated);
};

export const filterJobs = (jobs: JobOffer[], filters: JobFilterState): JobOffer[] => {
  return jobs.filter(job => {
    // Keyword search match title, company, city, description, or category
    if (filters.keyword.trim()) {
      const q = filters.keyword.toLowerCase().trim();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchCity = job.city.toLowerCase().includes(q);
      const matchCategory = job.category.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchCity && !matchCategory && !matchDesc) {
        return false;
      }
    }

    // Category filter
    if (filters.category && filters.category !== 'TOUS') {
      if (job.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // City filter
    if (filters.city && filters.city !== 'TOUTES') {
      if (job.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
    }

    // Contract type filter
    if (filters.contractType && filters.contractType !== 'TOUS') {
      if (job.contractType.toLowerCase() !== filters.contractType.toLowerCase()) {
        return false;
      }
    }

    // Experience filter
    if (filters.experienceLevel && filters.experienceLevel !== 'TOUS') {
      if (job.experienceLevel !== filters.experienceLevel) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'popular') {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    // Default latest
    return new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime();
  });
};

export const getSavedJobIds = (): string[] => {
  try {
    const saved = localStorage.getItem(SAVED_JOBS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
};

export const toggleSaveJob = (id: string): string[] => {
  const currentSaved = getSavedJobIds();
  let updated: string[];
  if (currentSaved.includes(id)) {
    updated = currentSaved.filter(item => item !== id);
  } else {
    updated = [...currentSaved, id];
  }
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating saved jobs', e);
  }
  return updated;
};

export const getPlatformStats = (jobs: JobOffer[]): StatisticsData => {
  const uniqueCompanies = new Set(jobs.map(j => j.company.trim().toLowerCase())).size;
  const totalApps = jobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 142);
  return {
    totalJobs: jobs.length,
    totalCompanies: Math.max(uniqueCompanies, 18),
    totalYouthRegistered: 1240 + totalApps * 3, // Realistic counter baseline + live activity
    totalApplicationsSent: totalApps + 850
  };
};

export const deleteJob = (id: string): void => {
  const jobs = getStoredJobs();
  const updated = jobs.filter(j => j.id !== id);
  saveJobs(updated);
};

export const updateJob = (id: string, updatedFields: Partial<JobOffer>): void => {
  const jobs = getStoredJobs();
  const updated = jobs.map(j => (j.id === id ? { ...j, ...updatedFields } : j));
  saveJobs(updated);
};

export const generateMailtoUrl = (
  jobTitle: string,
  contactEmail: string,
  candidateName?: string,
  candidateMessage?: string,
  subjectOverride?: string
): string => {
  const subject = encodeURIComponent(subjectOverride || `Candidature - ${jobTitle}`);
  let bodyText = `Bonjour, je me permets de vous soumettre ma candidature pour le poste de ${jobTitle}.\n\n`;
  if (candidateName) {
    bodyText += `Nom & Prénom : ${candidateName}\n`;
  }
  if (candidateMessage) {
    bodyText += `\nMessage :\n${candidateMessage}\n\n`;
  }
  bodyText += `Vous trouverez mon CV en pièce jointe.\n\nCordialement,`;

  const body = encodeURIComponent(bodyText);
  return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
};

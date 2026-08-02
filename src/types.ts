export type ContractType = 'CDI' | 'CDD' | 'Stage / PFE' | 'Alternance' | 'Intérim';

export type JobCategory = 
  | 'RH' 
  | 'Comptabilité' 
  | 'Mécanique' 
  | 'Administration' 
  | 'Informatique' 
  | 'Agriculture'
  | 'Marketing'
  | 'Autre';

export type MoroccanCity = 
  | 'Casablanca'
  | 'Rabat'
  | 'Tanger'
  | 'Marrakech'
  | 'Agadir'
  | 'Fès'
  | 'Oujda'
  | 'Meknès'
  | 'El Jadida'
  | 'Kénitra'
  | 'Tétouan'
  | 'Nador'
  | 'Autre ville';

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyInitials: string;
  city: MoroccanCity;
  contractType: ContractType;
  category: JobCategory;
  publishedAt: string; // Display date string (e.g. "Il y a 2 heures", "24/07/2026")
  createdAtISO: string; // ISO timestamp
  description: string;
  missions: string[];
  profile: string[];
  contactEmail: string;
  contactSubject?: string;
  originalLink?: string;
  salaryRange?: string;
  experienceLevel: 'Débutant (0-1 an)' | '1 à 3 ans' | '3 à 5 ans' | 'Stage PFE' | 'Tous niveaux';
  featured?: boolean;
  viewsCount?: number;
  applicationsCount?: number;
}

export interface JobFilterState {
  keyword: string;
  category: string;
  city: string;
  contractType: string;
  experienceLevel: string;
  sortBy: 'latest' | 'popular';
}

export interface StatisticsData {
  totalJobs: number;
  totalCompanies: number;
  totalYouthRegistered: number;
  totalApplicationsSent: number;
}

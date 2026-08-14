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

export type UserRole = 'candidat' | 'entreprise' | 'admin';
export type JobStatus = 'pending' | 'approved' | 'rejected';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Profile {
  id: string;
  role: UserRole;
  createdAt: string;
}

export interface Candidate extends Profile {
  fullName: string;
  phone?: string;
  domaineSouhaite?: string;
  niveauEtude?: string;
  ville?: string;
  skills?: string;
  cvUrl?: string;
}

export interface Company extends Profile {
  companyName: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  secteur?: string;
  ville?: string;
  contactPerson?: string;
  website?: string;
  workforceSize?: string;
  iceNumber?: string;
  linkedinUrl?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  email?: string;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyInitials: string;
  companyIsVerified?: boolean;
  city: MoroccanCity;
  contractType: ContractType;
  category: JobCategory;
  publishedAt: string; // Display date string (e.g. "Il y a 2 heures", "24/07/2026")
  createdAtISO: string; // ISO timestamp
  description: string;
  missions: string[];
  profile: string[];
  contactEmail: string;
  contactPhone?: string;
  contactSubject?: string;
  originalLink?: string;
  salaryRange?: string;
  experienceLevel: 'Débutant (0-1 an)' | '1 à 3 ans' | '3 à 5 ans' | 'Stage PFE' | 'Tous niveaux';
  featured?: boolean;
  isActive?: boolean;
  viewsCount?: number;
  applicationsCount?: number;
  companyId?: string;
  domaine?: string;
  status: JobStatus;
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

// ─── Supabase DB Row Type (snake_case) ────────────────────────────────────────

export interface DbProfile {
  id: string;
  role: string;
  created_at: string;
}

export interface DbCandidate {
  id: string;
  full_name: string;
  phone: string | null;
  domaine_souhaite: string | null;
  niveau_etude: string | null;
  ville: string | null;
  skills: string | null;
  cv_url: string | null;
  created_at: string;
}

export interface DbCompany {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  secteur: string | null;
  ville: string | null;
  contact_person: string | null;
  website: string | null;
  workforce_size: string | null;
  ice_number: string | null;
  linkedin_url: string | null;
  verification_status: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface DbJobOffer {
  id: string;
  created_at: string;
  title: string;
  company: string;
  description: string;
  location: string;
  contact_email: string;
  contact_phone: string | null;
  logo_url: string | null;
  is_active: boolean;
  category: string;
  contract_type: string;
  experience_level: string;
  salary_range: string | null;
  company_initials: string;
  missions: string[];
  profile_requirements: string[];
  contact_subject: string | null;
  original_link: string | null;
  featured: boolean;
  views_count: number;
  applications_count: number;
  company_id: string | null;
  domaine: string | null;
  status: string;
  companies?: {
    verification_status?: string;
  } | {
    verification_status?: string;
  }[];
}

// ─── Conversion helpers ────────────────────────────────────────────────────────

/** Formate une date ISO en affichage relatif ou absolu */
const formatPublishedAt = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** Convertit une ligne DB → JobOffer applicatif */
export const dbToJobOffer = (row: DbJobOffer): JobOffer => {
  const companyObj = Array.isArray(row.companies) ? row.companies[0] : row.companies;
  const isVerified = companyObj?.verification_status === 'verified';

  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companyLogo: row.logo_url ?? undefined,
    companyInitials: row.company_initials,
    companyIsVerified: isVerified,
    city: row.location as MoroccanCity,
    contractType: row.contract_type as ContractType,
    category: row.category as JobCategory,
    publishedAt: formatPublishedAt(row.created_at),
    createdAtISO: row.created_at,
    description: row.description,
    missions: Array.isArray(row.missions) ? row.missions : [],
    profile: Array.isArray(row.profile_requirements) ? row.profile_requirements : [],
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone ?? undefined,
    contactSubject: row.contact_subject ?? undefined,
    originalLink: row.original_link ?? undefined,
    salaryRange: row.salary_range ?? undefined,
    experienceLevel: row.experience_level as JobOffer['experienceLevel'],
    featured: row.featured,
    isActive: row.is_active,
    viewsCount: row.views_count,
    applicationsCount: row.applications_count,
    companyId: row.company_id ?? undefined,
    domaine: row.domaine ?? undefined,
    status: (row.status as JobStatus) || 'approved',
  };
};

/** Convertit un JobOffer applicatif → payload DB (INSERT/UPDATE) */
export const jobOfferToDb = (
  job: Omit<JobOffer, 'id' | 'createdAtISO' | 'publishedAt' | 'viewsCount' | 'applicationsCount'>
): Omit<DbJobOffer, 'id' | 'created_at' | 'views_count' | 'applications_count'> => ({
  title: job.title,
  company: job.company,
  description: job.description,
  location: job.city,
  contact_email: job.contactEmail,
  contact_phone: job.contactPhone ?? null,
  logo_url: job.companyLogo ?? null,
  is_active: job.isActive ?? true,
  category: job.category,
  contract_type: job.contractType,
  experience_level: job.experienceLevel,
  salary_range: job.salaryRange ?? null,
  company_initials: job.companyInitials,
  missions: job.missions,
  profile_requirements: job.profile,
  contact_subject: job.contactSubject ?? null,
  original_link: job.originalLink ?? null,
  featured: job.featured ?? false,
  company_id: job.companyId ?? null,
  domaine: job.domaine ?? null,
  status: job.status,
});

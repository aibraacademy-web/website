import { supabase } from '../lib/supabaseClient';
import { JobOffer, JobFilterState, StatisticsData, DbJobOffer, dbToJobOffer, jobOfferToDb } from '../types';

const SAVED_JOBS_KEY = 'aibra_academy_saved_job_ids';
const TABLE = 'job_offers';

// ─── Lecture ──────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les offres actives depuis Supabase,
 * triées par date de création décroissante.
 */
export const fetchJobs = async (): Promise<JobOffer[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[jobService] Erreur fetchJobs:', error.message);
    return [];
  }

  return (data as DbJobOffer[]).map(dbToJobOffer);
};

/**
 * Récupère TOUTES les offres (actives + inactives) pour le tableau admin.
 */
export const fetchAllJobs = async (): Promise<JobOffer[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[jobService] Erreur fetchAllJobs:', error.message);
    return [];
  }

  return (data as DbJobOffer[]).map(dbToJobOffer);
};

/**
 * Récupère une offre par son ID.
 */
export const getJobById = async (id: string): Promise<JobOffer | undefined> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;
  return dbToJobOffer(data as DbJobOffer);
};

// ─── Écriture ─────────────────────────────────────────────────────────────────

/**
 * Crée une nouvelle offre dans Supabase.
 * Le logo doit déjà avoir été uploadé et son URL passée dans companyLogo.
 */
export const createJobOffer = async (
  job: Omit<JobOffer, 'id' | 'createdAtISO' | 'publishedAt' | 'viewsCount' | 'applicationsCount'>
): Promise<JobOffer> => {
  const payload = jobOfferToDb(job);

  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error || !data) {
    throw new Error(`[jobService] Erreur createJobOffer: ${error?.message}`);
  }

  return dbToJobOffer(data as DbJobOffer);
};

/**
 * Met à jour les champs d'une offre existante.
 */
export const updateJobOffer = async (id: string, fields: Partial<JobOffer>): Promise<void> => {
  // Convertir uniquement les champs fournis
  const dbFields: Partial<DbJobOffer> = {};
  if (fields.title !== undefined)          dbFields.title = fields.title;
  if (fields.company !== undefined)        dbFields.company = fields.company;
  if (fields.description !== undefined)    dbFields.description = fields.description;
  if (fields.city !== undefined)           dbFields.location = fields.city;
  if (fields.contactEmail !== undefined)   dbFields.contact_email = fields.contactEmail;
  if (fields.contactPhone !== undefined)   dbFields.contact_phone = fields.contactPhone ?? null;
  if (fields.companyLogo !== undefined)    dbFields.logo_url = fields.companyLogo ?? null;
  if (fields.isActive !== undefined)       dbFields.is_active = fields.isActive;
  if (fields.category !== undefined)       dbFields.category = fields.category;
  if (fields.contractType !== undefined)   dbFields.contract_type = fields.contractType;
  if (fields.experienceLevel !== undefined) dbFields.experience_level = fields.experienceLevel;
  if (fields.salaryRange !== undefined)    dbFields.salary_range = fields.salaryRange ?? null;
  if (fields.companyInitials !== undefined) dbFields.company_initials = fields.companyInitials;
  if (fields.missions !== undefined)       dbFields.missions = fields.missions;
  if (fields.profile !== undefined)        dbFields.profile_requirements = fields.profile;
  if (fields.contactSubject !== undefined) dbFields.contact_subject = fields.contactSubject ?? null;
  if (fields.originalLink !== undefined)   dbFields.original_link = fields.originalLink ?? null;
  if (fields.featured !== undefined)       dbFields.featured = fields.featured;
  if (fields.viewsCount !== undefined)     dbFields.views_count = fields.viewsCount;
  if (fields.applicationsCount !== undefined) dbFields.applications_count = fields.applicationsCount;

  const { error } = await supabase.from(TABLE).update(dbFields).eq('id', id);

  if (error) {
    console.error('[jobService] Erreur updateJobOffer:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Supprime une offre de la DB.
 */
export const deleteJobOffer = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) {
    console.error('[jobService] Erreur deleteJobOffer:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Supprime TOUTES les offres (action admin critique).
 */
export const clearAllJobOffers = async (): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('[jobService] Erreur clearAllJobOffers:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Active ou désactive une offre.
 */
export const toggleJobActive = async (id: string, isActive: boolean): Promise<void> => {
  await updateJobOffer(id, { isActive });
};

/**
 * Incrémente le compteur de vues d'une offre.
 */
export const incrementJobViews = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_job_views', { job_id: id });
    if (error) {
      // Fallback : lecture puis écriture si la fonction RPC n'est pas disponible
      const { data } = await supabase.from(TABLE).select('views_count').eq('id', id).single();
      if (data) {
        await supabase.from(TABLE).update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);
      }
    }
  } catch {
    // Silencieux : ne pas bloquer l'UX pour un simple compteur de vues
  }
};

// ─── Filtrage (côté client, logique inchangée) ────────────────────────────────

export const filterJobs = (jobs: JobOffer[], filters: JobFilterState): JobOffer[] => {
  return jobs.filter(job => {
    // Keyword search: titre, entreprise, ville, description, catégorie
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

    if (filters.category && filters.category !== 'TOUS') {
      if (job.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    }

    if (filters.city && filters.city !== 'TOUTES') {
      if (job.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    }

    if (filters.contractType && filters.contractType !== 'TOUS') {
      if (job.contractType.toLowerCase() !== filters.contractType.toLowerCase()) return false;
    }

    if (filters.experienceLevel && filters.experienceLevel !== 'TOUS') {
      if (job.experienceLevel !== filters.experienceLevel) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'popular') {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    return new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime();
  });
};

// ─── Offres sauvegardées (localStorage, côté client) ─────────────────────────

export const getSavedJobIds = (): string[] => {
  try {
    const saved = localStorage.getItem(SAVED_JOBS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const toggleSaveJob = (id: string): string[] => {
  const currentSaved = getSavedJobIds();
  const updated = currentSaved.includes(id)
    ? currentSaved.filter(item => item !== id)
    : [...currentSaved, id];
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[jobService] Erreur sauvegarde locale:', e);
  }
  return updated;
};

// ─── Statistiques ─────────────────────────────────────────────────────────────

export const getPlatformStats = (jobs: JobOffer[]): StatisticsData => {
  const uniqueCompanies = new Set(jobs.map(j => j.company.trim().toLowerCase())).size;
  const totalApps = jobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 142);
  return {
    totalJobs: jobs.length,
    totalCompanies: Math.max(uniqueCompanies, 18),
    totalYouthRegistered: 1240 + totalApps * 3,
    totalApplicationsSent: totalApps + 850,
  };
};

// ─── Mailto helper ────────────────────────────────────────────────────────────

export const generateMailtoUrl = (
  jobTitle: string,
  contactEmail: string,
  candidateName?: string,
  candidateMessage?: string,
  subjectOverride?: string
): string => {
  const subject = encodeURIComponent(subjectOverride || `Candidature - ${jobTitle}`);
  let bodyText = `Bonjour, je me permets de vous soumettre ma candidature pour le poste de ${jobTitle}.\n\n`;
  if (candidateName) bodyText += `Nom & Prénom : ${candidateName}\n`;
  if (candidateMessage) bodyText += `\nMessage :\n${candidateMessage}\n\n`;
  bodyText += `Vous trouverez mon CV en pièce jointe.\n\nCordialement,`;
  return `mailto:${contactEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
};

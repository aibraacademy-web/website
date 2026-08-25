import { supabase } from '../lib/supabaseClient';
import { Company, JobOffer, dbToJobOffer, DbJobOffer, DbCompany, dbToCompany, CompanyCategory } from '../types';

export const getCompanyProfile = async (userId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      profiles ( role, created_at )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) {
    if (error?.code !== 'PGRST116') {
      console.error('[companyService] Error fetching company:', error?.message);
    }
    return null;
  }

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  return dbToCompany(data as DbCompany, profile);
};

/** Récupère une entreprise/institution publique par son slug */
export const getCompanyBySlug = async (slug: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[companyService] Erreur getCompanyBySlug:', error.message);
    return null;
  }

  return dbToCompany(data as DbCompany);
};

const DIACRITICS_REGEX = /[̀-ͯ]/g;

const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Crée une nouvelle institution (entreprise/école/état), action Admin uniquement */
export const createCompany = async (payload: {
  companyName: string;
  category: CompanyCategory;
  logoUrl?: string;
  ville?: string;
  secteur?: string;
  website?: string;
}): Promise<Company> => {
  const baseSlug = slugify(payload.companyName) || 'institution';
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 5) {
    const { data, error } = await supabase
      .from('companies')
      .insert([{
        company_name: payload.companyName,
        category: payload.category,
        slug,
        logo_url: payload.logoUrl ?? null,
        ville: payload.ville ?? null,
        secteur: payload.secteur ?? null,
        website: payload.website ?? null,
        verification_status: 'verified',
      }])
      .select()
      .single();

    if (!error && data) {
      return dbToCompany(data as DbCompany);
    }

    if (error?.code === '23505') {
      attempt += 1;
      slug = `${baseSlug}-${attempt + 1}`;
      continue;
    }

    throw new Error(`Erreur lors de la création de l'institution: ${error?.message}`);
  }

  throw new Error("Erreur lors de la création de l'institution: impossible de générer un identifiant unique.");
};

export const upsertCompanyProfile = async (
  userId: string,
  companyData: Partial<Omit<Company, 'id' | 'role' | 'createdAt'>>
): Promise<void> => {
  const payload: Record<string, any> = {
    id: userId,
  };

  if (companyData.companyName !== undefined) payload.company_name = companyData.companyName;
  if (companyData.description !== undefined) payload.description = companyData.description || null;
  if (companyData.logoUrl !== undefined) payload.logo_url = companyData.logoUrl || null;
  if (companyData.phone !== undefined) payload.phone = companyData.phone || null;
  if (companyData.secteur !== undefined) payload.secteur = companyData.secteur || null;
  if (companyData.ville !== undefined) payload.ville = companyData.ville || null;
  if (companyData.contactPerson !== undefined) payload.contact_person = companyData.contactPerson || null;
  if (companyData.website !== undefined) payload.website = companyData.website || null;
  if (companyData.workforceSize !== undefined) payload.workforce_size = companyData.workforceSize || null;
  if (companyData.iceNumber !== undefined) payload.ice_number = companyData.iceNumber || null;
  if (companyData.linkedinUrl !== undefined) payload.linkedin_url = companyData.linkedinUrl || null;

  const { error } = await supabase
    .from('companies')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('[companyService] Error upserting company:', error.message);
    throw new Error(`Erreur lors de l'enregistrement du profil: ${error.message}`);
  }
};

export const getCompanyJobs = async (companyId: string): Promise<JobOffer[]> => {
  const { data, error } = await supabase
    .from('job_offers')
    .select(`
      *,
      companies ( verification_status, category, slug )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[companyService] Error fetching company jobs:', error.message);
    return [];
  }

  return (data as DbJobOffer[]).map(dbToJobOffer);
};

/** Récupère toutes les entreprises enregistrées (pour l'Admin et les pages publiques) */
export const fetchAllCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      profiles ( role, created_at )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[companyService] Erreur fetchAllCompanies:', error.message);
    return [];
  }

  return (data || []).map(row => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return dbToCompany(row as DbCompany, profile);
  });
};

/** Valide ou rejette le statut d'une entreprise (Action Admin) */
export const updateCompanyVerificationStatus = async (
  companyId: string,
  status: 'verified' | 'rejected',
  rejectionReason?: string
): Promise<void> => {
  const payload: Record<string, any> = {
    verification_status: status,
    rejection_reason: status === 'rejected' ? (rejectionReason || null) : null
  };

  const { error } = await supabase
    .from('companies')
    .update(payload)
    .eq('id', companyId);

  if (error) {
    console.error('[companyService] Erreur updateCompanyVerificationStatus:', error.message);
    throw new Error(`Erreur lors de la mise à jour du statut de l'entreprise: ${error.message}`);
  }
};

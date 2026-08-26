import { supabase } from '../lib/supabaseClient';
import { Company, JobOffer, dbToJobOffer, DbJobOffer, DbCompany, dbToCompany, CompanyCategory } from '../types';

export const getCompanyProfile = async (userId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    if (error?.code !== 'PGRST116') {
      console.error('[companyService] Error fetching company:', error?.message);
    }
    return null;
  }

  return dbToCompany(data as DbCompany);
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

/** Normalise un nom d'institution pour la comparaison (accents, casse, espaces) */
export const normalizeCompanyName = (name: string): string =>
  name
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

/**
 * Crée une nouvelle institution (entreprise/école/état), action Admin uniquement.
 * Réutilise une institution existante de même catégorie/nom (normalisé) plutôt que
 * de créer un doublon — vérification faite ici, seul point d'entrée d'insertion,
 * pas seulement côté UI.
 */
export const createCompany = async (payload: {
  companyName: string;
  category: CompanyCategory;
  logoUrl?: string;
  ville?: string;
  secteur?: string;
  website?: string;
  description?: string;
}): Promise<{ company: Company; reused: boolean }> => {
  const normalizedTarget = normalizeCompanyName(payload.companyName);

  const { data: sameCategoryRows, error: lookupError } = await supabase
    .from('companies')
    .select('*')
    .eq('category', payload.category);

  if (lookupError) {
    throw new Error(`Erreur lors de la vérification des doublons: ${lookupError.message}`);
  }

  const existingRow = (sameCategoryRows || []).find(
    row => normalizeCompanyName((row as DbCompany).company_name) === normalizedTarget
  ) as DbCompany | undefined;

  if (existingRow) {
    // Réutilise l'institution existante ; complète son logo si elle n'en a pas encore.
    if (payload.logoUrl && !existingRow.logo_url) {
      const { data: updated, error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: payload.logoUrl })
        .eq('id', existingRow.id)
        .select()
        .single();

      if (!updateError && updated) {
        return { company: dbToCompany(updated as DbCompany), reused: true };
      }
    }
    return { company: dbToCompany(existingRow), reused: true };
  }

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
        description: payload.description ?? null,
        verification_status: 'verified',
      }])
      .select()
      .single();

    if (!error && data) {
      return { company: dbToCompany(data as DbCompany), reused: false };
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
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[companyService] Erreur fetchAllCompanies:', error.message);
    return [];
  }

  return (data || []).map(row => dbToCompany(row as DbCompany));
};

/** Met à jour les informations d'une institution existante (Action Admin) */
export const updateCompany = async (
  companyId: string,
  payload: {
    companyName?: string;
    category?: CompanyCategory;
    logoUrl?: string | null;
    ville?: string;
    secteur?: string;
    website?: string;
    description?: string;
  }
): Promise<Company> => {
  const dbPayload: Record<string, any> = {};
  if (payload.companyName !== undefined) dbPayload.company_name = payload.companyName;
  if (payload.category !== undefined) dbPayload.category = payload.category;
  if (payload.logoUrl !== undefined) dbPayload.logo_url = payload.logoUrl;
  if (payload.ville !== undefined) dbPayload.ville = payload.ville || null;
  if (payload.secteur !== undefined) dbPayload.secteur = payload.secteur || null;
  if (payload.website !== undefined) dbPayload.website = payload.website || null;
  if (payload.description !== undefined) dbPayload.description = payload.description || null;

  const { data, error } = await supabase
    .from('companies')
    .update(dbPayload)
    .eq('id', companyId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Erreur lors de la mise à jour de l'institution: ${error?.message}`);
  }

  return dbToCompany(data as DbCompany);
};

/** Supprime définitivement une institution (Action Admin) — les offres liées voient leur company_id passer à NULL */
export const deleteCompany = async (companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) {
    throw new Error(`Erreur lors de la suppression de l'institution: ${error.message}`);
  }
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

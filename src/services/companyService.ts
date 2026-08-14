import { supabase } from '../lib/supabaseClient';
import { Company, JobOffer, dbToJobOffer, DbJobOffer } from '../types';

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

  return {
    id: data.id,
    role: profile?.role || 'entreprise',
    createdAt: profile?.created_at || data.created_at,
    companyName: data.company_name,
    description: data.description || undefined,
    logoUrl: data.logo_url || undefined,
    phone: data.phone || undefined,
    secteur: data.secteur || undefined,
    ville: data.ville || undefined,
    contactPerson: data.contact_person || undefined,
    website: data.website || undefined,
    workforceSize: data.workforce_size || undefined,
    iceNumber: data.ice_number || undefined,
    linkedinUrl: data.linkedin_url || undefined,
    verificationStatus: (data.verification_status as any) || 'pending',
    rejectionReason: data.rejection_reason || undefined,
  };
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
      companies ( verification_status )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[companyService] Error fetching company jobs:', error.message);
    return [];
  }

  return (data as DbJobOffer[]).map(dbToJobOffer);
};

/** Récupère toutes les entreprises enregistrées (pour l'Admin) */
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
    return {
      id: row.id,
      role: profile?.role || 'entreprise',
      createdAt: profile?.created_at || row.created_at,
      companyName: row.company_name,
      description: row.description || undefined,
      logoUrl: row.logo_url || undefined,
      phone: row.phone || undefined,
      secteur: row.secteur || undefined,
      ville: row.ville || undefined,
      contactPerson: row.contact_person || undefined,
      website: row.website || undefined,
      workforceSize: row.workforce_size || undefined,
      iceNumber: row.ice_number || undefined,
      linkedinUrl: row.linkedin_url || undefined,
      verificationStatus: (row.verification_status as any) || 'pending',
      rejectionReason: row.rejection_reason || undefined,
    };
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

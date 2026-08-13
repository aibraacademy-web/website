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
  };
};

export const upsertCompanyProfile = async (
  userId: string,
  companyData: Omit<Company, 'id' | 'role' | 'createdAt'>
): Promise<void> => {
  const payload = {
    id: userId,
    company_name: companyData.companyName,
    description: companyData.description || null,
    logo_url: companyData.logoUrl || null,
    phone: companyData.phone || null,
  };

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
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[companyService] Error fetching company jobs:', error.message);
    return [];
  }

  return (data as DbJobOffer[]).map(dbToJobOffer);
};

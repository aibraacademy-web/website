import { supabase } from '../lib/supabaseClient';
import { Candidate } from '../types';

export const getCandidateProfile = async (userId: string): Promise<Candidate | null> => {
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      *,
      profiles ( role, created_at )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) {
    if (error?.code !== 'PGRST116') { // not found
      console.error('[candidateService] Error fetching candidate:', error?.message);
    }
    return null;
  }

  // Supabase returns related table as object or array depending on relation. 
  // It's 1-to-1 but might be an array or object. We'll type cast safely.
  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

  return {
    id: data.id,
    role: profile?.role || 'candidat',
    createdAt: profile?.created_at || data.created_at,
    fullName: data.full_name,
    phone: data.phone || undefined,
    domaineSouhaite: data.domaine_souhaite || undefined,
    niveauEtude: data.niveau_etude || undefined,
    ville: data.ville || undefined,
    skills: data.skills || undefined,
    cvUrl: data.cv_url || undefined,
  };
};

export const upsertCandidateProfile = async (
  userId: string,
  candidateData: Omit<Candidate, 'id' | 'role' | 'createdAt'>
): Promise<void> => {
  const payload = {
    id: userId,
    full_name: candidateData.fullName,
    phone: candidateData.phone || null,
    domaine_souhaite: candidateData.domaineSouhaite || null,
    niveau_etude: candidateData.niveauEtude || null,
    ville: candidateData.ville || null,
    skills: candidateData.skills || null,
    cv_url: candidateData.cvUrl || null,
  };

  const { error } = await supabase
    .from('candidates')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('[candidateService] Error upserting candidate:', error.message);
    throw new Error(`Erreur lors de l'enregistrement du profil: ${error.message}`);
  }
};

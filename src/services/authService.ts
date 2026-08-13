import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole } from '../types';

/**
 * Récupère le profil de l'utilisateur actuellement connecté
 */
export const getCurrentProfile = async (): Promise<Profile | null> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    return null;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profileData) {
    console.error('[authService] Error fetching profile:', profileError?.message);
    return null;
  }

  return {
    id: profileData.id,
    role: profileData.role as UserRole,
    createdAt: profileData.created_at,
  };
};

/**
 * Déconnecte l'utilisateur
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[authService] Error signing out:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Retourne le nom de l'onglet/route cible selon le rôle
 */
export const redirectByRole = (role: UserRole): string => {
  if (role === 'admin') return 'admin-dashboard';
  if (role === 'entreprise') return 'entreprise-dashboard';
  return 'candidat-dashboard';
};

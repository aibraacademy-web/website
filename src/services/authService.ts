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

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase();
  const userMetaRole = session.user.user_metadata?.role;

  // Utilise maybeSingle() au lieu de single() pour éviter l'erreur HTTP 406 (PGRST116) quand 0 ligne est retournée
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('[authService] Erreur récupération profil:', profileError.message);
  }

  if (profileData) {
    return {
      id: profileData.id,
      role: profileData.role as UserRole,
      createdAt: profileData.created_at,
    };
  }

  // Auto-réparation si la ligne dans public.profiles n'existe pas encore dans la base
  const fallbackRole: UserRole = (userEmail === 'aibraacademy@gmail.com' || userMetaRole === 'admin') 
    ? 'admin' 
    : (userMetaRole as UserRole) || 'candidat';

  try {
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({ id: userId, role: fallbackRole }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (newProfile) {
      return {
        id: newProfile.id,
        role: newProfile.role as UserRole,
        createdAt: newProfile.created_at,
      };
    }
  } catch (err) {
    console.error('[authService] Échec création auto-réparation profil:', err);
  }

  return {
    id: userId,
    role: fallbackRole,
    createdAt: new Date().toISOString(),
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

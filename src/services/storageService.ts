import { supabase } from '../lib/supabaseClient';

const LOGOS_BUCKET = 'logos';

/**
 * Upload une image logo vers Supabase Storage.
 * Retourne l'URL publique permanente du fichier uploadé.
 */
export const uploadLogo = async (file: File): Promise<string> => {
  // Génère un nom de fichier unique pour éviter les collisions
  const ext = file.name.split('.').pop() ?? 'png';
  const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(LOGOS_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Erreur upload logo : ${error.message}`);
  }

  const { data } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
};

/**
 * Supprime un logo depuis Supabase Storage à partir de son URL publique.
 * Ne lève pas d'erreur si le fichier n'existe pas.
 */
export const deleteLogo = async (logoUrl: string): Promise<void> => {
  try {
    // Extrait le nom du fichier depuis l'URL publique
    const urlParts = logoUrl.split(`/${LOGOS_BUCKET}/`);
    if (urlParts.length < 2) return;
    const fileName = urlParts[1];

    await supabase.storage.from(LOGOS_BUCKET).remove([fileName]);
  } catch {
    // Silencieux : la suppression du logo n'est pas bloquante
    console.warn('[storageService] Impossible de supprimer le logo:', logoUrl);
  }
};

import { supabase } from '../lib/supabaseClient';
import { LibraryFile, DbLibraryFile, dbToLibraryFile } from '../types';

const TABLE = 'library_files';
const BUCKET = 'library-files';

/**
 * Récupère tous les fichiers actifs pour les visiteurs.
 */
export const fetchActiveLibraryFiles = async (): Promise<LibraryFile[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[libraryService] Erreur fetchActiveLibraryFiles:', error.message);
    return [];
  }

  return (data as DbLibraryFile[]).map(dbToLibraryFile);
};

/**
 * Récupère tous les fichiers (actifs et inactifs) pour le dashboard administrateur.
 */
export const fetchAllLibraryFiles = async (): Promise<LibraryFile[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[libraryService] Erreur fetchAllLibraryFiles:', error.message);
    return [];
  }

  return (data as DbLibraryFile[]).map(dbToLibraryFile);
};

/**
 * Crée un nouveau fichier dans la bibliothèque (admin).
 */
export const createLibraryFile = async (
  file: Omit<LibraryFile, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'downloadCount'>
): Promise<LibraryFile> => {
  const dbPayload = {
    title: file.title,
    description: file.description || null,
    category: file.category,
    file_url: file.fileUrl,
    file_type: file.fileType,
    file_size_kb: file.fileSizeKb ?? null,
    is_active: file.isActive,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('[libraryService] Erreur createLibraryFile:', error.message);
    throw error;
  }

  return dbToLibraryFile(data as DbLibraryFile);
};

/**
 * Met à jour un fichier existant dans la bibliothèque (admin).
 */
export const updateLibraryFile = async (
  id: string,
  updates: Partial<Omit<LibraryFile, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'downloadCount'>>
): Promise<LibraryFile> => {
  const dbPayload: any = {};
  if (updates.title !== undefined) dbPayload.title = updates.title;
  if (updates.description !== undefined) dbPayload.description = updates.description || null;
  if (updates.category !== undefined) dbPayload.category = updates.category;
  if (updates.fileUrl !== undefined) dbPayload.file_url = updates.fileUrl;
  if (updates.fileType !== undefined) dbPayload.file_type = updates.fileType;
  if (updates.fileSizeKb !== undefined) dbPayload.file_size_kb = updates.fileSizeKb ?? null;
  if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;

  const { data, error } = await supabase
    .from(TABLE)
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[libraryService] Erreur updateLibraryFile:', error.message);
    throw error;
  }

  return dbToLibraryFile(data as DbLibraryFile);
};

/**
 * Supprime un fichier de la bibliothèque (admin) et tente également de supprimer son fichier associé dans le stockage.
 */
export const deleteLibraryFile = async (id: string, fileUrl?: string): Promise<void> => {
  // Optionnellement supprimer le fichier physique du bucket Storage si l'URL est fournie
  if (fileUrl) {
    try {
      const urlParts = fileUrl.split(`/${BUCKET}/`);
      if (urlParts.length >= 2) {
        const fileName = urlParts[1];
        await supabase.storage.from(BUCKET).remove([fileName]);
      }
    } catch (e) {
      console.warn('[libraryService] Impossible de supprimer le fichier du storage:', e);
    }
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[libraryService] Erreur deleteLibraryFile:', error.message);
    throw error;
  }
};

/**
 * Active/Désactive un fichier de la bibliothèque (admin).
 */
export const toggleLibraryFileActive = async (id: string, isActive: boolean): Promise<LibraryFile> => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[libraryService] Erreur toggleLibraryFileActive:', error.message);
    throw error;
  }

  return dbToLibraryFile(data as DbLibraryFile);
};

/**
 * Incrémente le compteur de téléchargement d'un fichier.
 */
export const incrementFileDownloads = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_file_downloads', { file_id: id });

  if (error) {
    console.error('[libraryService] Erreur incrementFileDownloads:', error.message);
    throw error;
  }
};

/**
 * Upload un document vers Supabase Storage dans le bucket 'library-files'.
 * Retourne l'URL publique du fichier.
 */
export const uploadLibraryFile = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'pdf';
  // Créer un nom unique propre
  const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `doc_${Date.now()}_${cleanName}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error('[libraryService] Erreur uploadLibraryFile:', error.message);
    throw new Error(`Erreur lors de l'upload du fichier : ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
};

import { supabase } from '../lib/supabaseClient';
import { NewsPost, DbNewsPost, dbToNewsPost } from '../types';

const TABLE = 'news_posts';

/**
 * Récupère toutes les actualités actives, triées par date de publication (plus récent en premier).
 */
export const fetchActiveNewsPosts = async (): Promise<NewsPost[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[newsService] Erreur fetchActiveNewsPosts:', error.message);
    return [];
  }

  return (data as DbNewsPost[]).map(dbToNewsPost);
};

/**
 * Récupère les actualités actives et épinglées.
 */
export const fetchPinnedNewsPosts = async (): Promise<NewsPost[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .eq('is_pinned', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[newsService] Erreur fetchPinnedNewsPosts:', error.message);
    return [];
  }

  return (data as DbNewsPost[]).map(dbToNewsPost);
};

/**
 * Récupère TOUTES les actualités (admin).
 */
export const fetchAllNewsPosts = async (): Promise<NewsPost[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[newsService] Erreur fetchAllNewsPosts:', error.message);
    return [];
  }

  return (data as DbNewsPost[]).map(dbToNewsPost);
};

/**
 * Crée une nouvelle actualité (admin).
 */
export const createNewsPost = async (
  post: Omit<NewsPost, 'id' | 'createdAt' | 'publishedAtDisplay'>
): Promise<NewsPost> => {
  const dbPayload = {
    title: post.title,
    summary: post.summary,
    content: post.content,
    category: post.category,
    image_url: post.imageUrl ?? null,
    external_link: post.externalLink ?? null,
    is_pinned: post.isPinned,
    published_at: post.publishedAt,
    expires_at: post.expiresAt ?? null,
    is_active: post.isActive,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('[newsService] Erreur createNewsPost:', error.message);
    throw error;
  }

  return dbToNewsPost(data as DbNewsPost);
};

/**
 * Met à jour une actualité existante (admin).
 */
export const updateNewsPost = async (
  id: string,
  updates: Partial<Omit<NewsPost, 'id' | 'createdAt' | 'publishedAtDisplay'>>
): Promise<NewsPost> => {
  const dbPayload: any = {};
  if (updates.title !== undefined) dbPayload.title = updates.title;
  if (updates.summary !== undefined) dbPayload.summary = updates.summary;
  if (updates.content !== undefined) dbPayload.content = updates.content;
  if (updates.category !== undefined) dbPayload.category = updates.category;
  if (updates.imageUrl !== undefined) dbPayload.image_url = updates.imageUrl;
  if (updates.externalLink !== undefined) dbPayload.external_link = updates.externalLink;
  if (updates.isPinned !== undefined) dbPayload.is_pinned = updates.isPinned;
  if (updates.publishedAt !== undefined) dbPayload.published_at = updates.publishedAt;
  if (updates.expiresAt !== undefined) dbPayload.expires_at = updates.expiresAt;
  if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;

  const { data, error } = await supabase
    .from(TABLE)
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[newsService] Erreur updateNewsPost:', error.message);
    throw error;
  }

  return dbToNewsPost(data as DbNewsPost);
};

/**
 * Supprime une actualité (admin).
 */
export const deleteNewsPost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[newsService] Erreur deleteNewsPost:', error.message);
    throw error;
  }
};

/**
 * Active/Désactive une actualité (admin).
 */
export const toggleNewsActive = async (id: string, isActive: boolean): Promise<NewsPost> => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[newsService] Erreur toggleNewsActive:', error.message);
    throw error;
  }

  return dbToNewsPost(data as DbNewsPost);
};

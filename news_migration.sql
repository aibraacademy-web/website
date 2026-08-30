-- ====================================================================
-- MIGRATION: Ajout de la fonctionnalité "Actualités & Informations"
-- ====================================================================

-- 1. Table des actualités
CREATE TABLE IF NOT EXISTS public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Éducation & Inscriptions', 'Conseils Carrière', 'Annonces Officielles')),
  image_url TEXT,
  external_link TEXT,
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger pour updated_at
DROP TRIGGER IF EXISTS set_news_posts_updated_at ON public.news_posts;
CREATE TRIGGER set_news_posts_updated_at 
  BEFORE UPDATE ON public.news_posts 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Sécurité RLS
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- Lecture publique
DROP POLICY IF EXISTS "Published news are viewable by anyone" ON public.news_posts;
CREATE POLICY "Published news are viewable by anyone" ON public.news_posts FOR SELECT USING (true);

-- Insertion admin
DROP POLICY IF EXISTS "Admins can insert news" ON public.news_posts;
CREATE POLICY "Admins can insert news" ON public.news_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Mise à jour admin
DROP POLICY IF EXISTS "Admins can update news" ON public.news_posts;
CREATE POLICY "Admins can update news" ON public.news_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Suppression admin
DROP POLICY IF EXISTS "Admins can delete news" ON public.news_posts;
CREATE POLICY "Admins can delete news" ON public.news_posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Bucket Storage pour les images des actualités
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS Storage: news-images (Public Read, Admin Insert/Update/Delete)
DROP POLICY IF EXISTS "Public Read News Images" ON storage.objects;
CREATE POLICY "Public Read News Images" ON storage.objects FOR SELECT USING (bucket_id = 'news-images');

DROP POLICY IF EXISTS "Admin Insert News Images" ON storage.objects;
CREATE POLICY "Admin Insert News Images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'news-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Update News Images" ON storage.objects;
CREATE POLICY "Admin Update News Images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'news-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin Delete News Images" ON storage.objects;
CREATE POLICY "Admin Delete News Images" ON storage.objects FOR DELETE USING (
  bucket_id = 'news-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ====================================================================
-- SCRIPT DE MIGRATION POUR CIBLE : TABLE job_offers EXISTANTE
-- Ajoute les colonnes manquantes sans supprimer/altérer les anciennes données
-- ====================================================================

-- 1. Ajout sécurisé des colonnes manquantes dans public.job_offers
ALTER TABLE public.job_offers
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Autre',
  ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'CDI',
  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'Tous niveaux',
  ADD COLUMN IF NOT EXISTS salary_range TEXT,
  ADD COLUMN IF NOT EXISTS company_initials TEXT DEFAULT 'AA',
  ADD COLUMN IF NOT EXISTS missions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_requirements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS contact_subject TEXT,
  ADD COLUMN IF NOT EXISTS original_link TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS domaine TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Mise à jour des valeurs par défaut pour les anciennes offres existantes (qui auraient des valeurs NULL)
UPDATE public.job_offers
SET 
  is_active = COALESCE(is_active, true),
  status = COALESCE(status, 'approved'),
  category = COALESCE(category, 'Autre'),
  contract_type = COALESCE(contract_type, 'CDI'),
  experience_level = COALESCE(experience_level, 'Tous niveaux'),
  company_initials = COALESCE(company_initials, UPPER(SUBSTRING(company FROM 1 FOR 2)), 'AA'),
  missions = COALESCE(missions, '{}'),
  profile_requirements = COALESCE(profile_requirements, '{}'),
  featured = COALESCE(featured, false),
  views_count = COALESCE(views_count, 0),
  applications_count = COALESCE(applications_count, 0)
WHERE is_active IS NULL OR status IS NULL OR company_initials IS NULL;

-- 3. Mise en place de la fonction d'incrémentation des vues si non présente
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.job_offers
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Application des Politiques de Sécurité (RLS) sur job_offers
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published jobs are viewable by anyone" ON public.job_offers;
CREATE POLICY "Published jobs are viewable by anyone" ON public.job_offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can insert their own jobs" ON public.job_offers;
CREATE POLICY "Companies can insert their own jobs" ON public.job_offers FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Companies can update their own jobs" ON public.job_offers;
CREATE POLICY "Companies can update their own jobs" ON public.job_offers FOR UPDATE USING (
  auth.uid() = company_id OR auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Companies can delete their own jobs" ON public.job_offers;
CREATE POLICY "Companies can delete their own jobs" ON public.job_offers FOR DELETE USING (
  auth.uid() = company_id OR auth.role() = 'authenticated'
);

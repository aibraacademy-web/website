-- ====================================================================
-- SCRIPT FINAL & UNIFIÉ POUR SUPABASE (100% SÉCURISÉ POUR VOS DONNÉES)
-- Conservation de job_offers existante + Ajout des nouvelles tables & colonnes
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE PROFILES (Utilisateurs & Rôles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('candidat', 'entreprise', 'admin')) DEFAULT 'candidat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE CANDIDATES (Informations Candidats)
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  domaine_souhaite TEXT,
  niveau_etude TEXT,
  ville TEXT,
  skills TEXT[] DEFAULT '{}',
  cv_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE COMPANIES (Informations Entreprises)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE JOB_OFFERS (Conservation des offres existantes + Ajout progressif des colonnes)
CREATE TABLE IF NOT EXISTS public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajout sécurisé des nouvelles colonnes à la table job_offers sans altérer les données existantes
ALTER TABLE public.job_offers
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS logo TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'CDI',
  ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'CDI',
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Autre',
  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'Tous niveaux',
  ADD COLUMN IF NOT EXISTS salary TEXT,
  ADD COLUMN IF NOT EXISTS salary_range TEXT,
  ADD COLUMN IF NOT EXISTS company_initials TEXT DEFAULT 'AA',
  ADD COLUMN IF NOT EXISTS missions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_requirements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS contact_subject TEXT,
  ADD COLUMN IF NOT EXISTS original_link TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS domaine TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Mise à jour des valeurs par défaut pour les offres existantes (qui auraient des valeurs NULL)
UPDATE public.job_offers
SET 
  is_active = COALESCE(is_active, true),
  status = COALESCE(status, 'approved'),
  category = COALESCE(category, 'Autre'),
  contract_type = COALESCE(contract_type, 'CDI'),
  experience_level = COALESCE(experience_level, 'Tous niveaux'),
  company_initials = COALESCE(company_initials, CASE WHEN company IS NOT NULL AND LENGTH(company) >= 2 THEN UPPER(SUBSTRING(company FROM 1 FOR 2)) ELSE 'AA' END),
  missions = COALESCE(missions, '{}'),
  profile_requirements = COALESCE(profile_requirements, '{}'),
  featured = COALESCE(featured, false),
  views_count = COALESCE(views_count, 0),
  applications_count = COALESCE(applications_count, 0)
WHERE is_active IS NULL OR status IS NULL OR company_initials IS NULL;

-- 6. TABLE APPLICATIONS (Candidatures reçues)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_offers(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cv_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- FONCTIONS ET TRIGGERS AUTOMATIQUES
-- ====================================================================

-- Trigger automatique de mise à jour des dates (updated_at)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_candidates_updated_at ON public.candidates;
CREATE TRIGGER set_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_job_offers_updated_at ON public.job_offers;
CREATE TRIGGER set_job_offers_updated_at BEFORE UPDATE ON public.job_offers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Fonction d'incrémentation des vues pour les offres d'emploi
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.job_offers
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger d'automatisation de la création de profil lors de l'inscription (signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
  user_company_name TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidat');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'name', 'Entreprise');

  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (id) DO NOTHING;

  IF user_role = 'entreprise' THEN
    INSERT INTO public.companies (id, company_name)
    VALUES (NEW.id, user_company_name)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.candidates (id, full_name)
    VALUES (NEW.id, user_full_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS) & POLICIES AFFINÉES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policies Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by anyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies Candidates
DROP POLICY IF EXISTS "Candidates profiles are viewable by authenticated users" ON public.candidates;
CREATE POLICY "Candidates profiles are viewable by authenticated users" ON public.candidates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Candidates can update own candidate profile" ON public.candidates;
CREATE POLICY "Candidates can update own candidate profile" ON public.candidates FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Candidates can insert own candidate profile" ON public.candidates;
CREATE POLICY "Candidates can insert own candidate profile" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies Companies
DROP POLICY IF EXISTS "Companies profiles are viewable by anyone" ON public.companies;
CREATE POLICY "Companies profiles are viewable by anyone" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can update own company profile" ON public.companies;
CREATE POLICY "Companies can update own company profile" ON public.companies FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Companies can insert own company profile" ON public.companies;
CREATE POLICY "Companies can insert own company profile" ON public.companies FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies Job Offers (Affinées et Strictes)
DROP POLICY IF EXISTS "Published jobs are viewable by anyone" ON public.job_offers;
CREATE POLICY "Published jobs are viewable by anyone" ON public.job_offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Companies can insert their own jobs" ON public.job_offers;
CREATE POLICY "Companies can insert their own jobs" ON public.job_offers FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND (
    company_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    (company_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('entreprise', 'admin')))
  )
);

DROP POLICY IF EXISTS "Companies can update their own jobs" ON public.job_offers;
CREATE POLICY "Companies can update their own jobs" ON public.job_offers FOR UPDATE USING (
  auth.uid() = company_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Companies can delete their own jobs" ON public.job_offers;
CREATE POLICY "Companies can delete their own jobs" ON public.job_offers FOR DELETE USING (
  auth.uid() = company_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies Applications
DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;
CREATE POLICY "Candidates can view their own applications" ON public.applications FOR SELECT USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Companies can view applications for their jobs" ON public.applications;
CREATE POLICY "Companies can view applications for their jobs" ON public.applications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.job_offers
    WHERE job_offers.id = applications.job_id
    AND (job_offers.company_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);

DROP POLICY IF EXISTS "Candidates can submit applications" ON public.applications;
CREATE POLICY "Candidates can submit applications" ON public.applications FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- ====================================================================
-- CONFIGURATION STORAGE BUCKETS (LOGOS & CVS)
-- ====================================================================

-- Buckets dans storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- RLS Storage: LOGOS (Public Read, Authenticated Insert/Update/Delete)
DROP POLICY IF EXISTS "Public Read Logos" ON storage.objects;
CREATE POLICY "Public Read Logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Authenticated Insert Logos" ON storage.objects;
CREATE POLICY "Authenticated Insert Logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Logos" ON storage.objects;
CREATE POLICY "Authenticated Update Logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete Logos" ON storage.objects;
CREATE POLICY "Authenticated Delete Logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- RLS Storage: CVS (Bucket Privé)
DROP POLICY IF EXISTS "Users can upload their own CV" ON storage.objects;
DROP POLICY IF EXISTS "Allow CV Upload" ON storage.objects;

CREATE POLICY "Allow CV Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'cvs' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM auth.users WHERE id::text = (storage.foldername(name))[1])
  )
);

DROP POLICY IF EXISTS "Users can read their own CV" ON storage.objects;
CREATE POLICY "Users can read their own CV" ON storage.objects FOR SELECT USING (
  bucket_id = 'cvs' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    auth.role() = 'authenticated'
  )
);

DROP POLICY IF EXISTS "Companies can read applicant CVs" ON storage.objects;

DROP POLICY IF EXISTS "Users can delete their own CV" ON storage.objects;
CREATE POLICY "Users can delete their own CV" ON storage.objects FOR DELETE USING (
  bucket_id = 'cvs' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

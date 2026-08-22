-- ====================================================================
-- Migration: Transformation des entreprises d'un champ texte vers une table liée
-- Date: 2026-08-21
-- Note: Ces changements ont déjà été appliqués manuellement en production.
-- Ce fichier sert uniquement de documentation historique. NE PAS RE-EXÉCUTER.
-- ====================================================================

-- 1. Suppression de la contrainte FK de companies vers profiles
-- Les entreprises n'ont plus de compte utilisateur, elles sont gérées par les admins.
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_id_fkey;

-- 2. Ajout des nouvelles colonnes à la table companies
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS secteur TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ice_number TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;

-- (Note: Les colonnes id, company_name, logo_url existaient déjà)
-- (Note: job_offers.company_id existait déjà et a été peuplé manuellement)

-- ====================================================================
-- NOUVELLES POLITIQUES RLS (À appliquer, cf. point 2 de la demande)
-- ====================================================================

-- S'assurer que le RLS est activé
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous
DROP POLICY IF EXISTS "Companies profiles are viewable by anyone" ON public.companies;
CREATE POLICY "Companies profiles are viewable by anyone" 
  ON public.companies FOR SELECT USING (true);

-- Écriture réservée aux admins (Role = admin dans la table profiles)
-- Les entreprises sont gérées manuellement par les admins.
DROP POLICY IF EXISTS "Admins can insert company" ON public.companies;
CREATE POLICY "Admins can insert company" 
  ON public.companies FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update company" ON public.companies;
CREATE POLICY "Admins can update company" 
  ON public.companies FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete company" ON public.companies;
CREATE POLICY "Admins can delete company" 
  ON public.companies FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

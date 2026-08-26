-- ====================================================================
-- CANDIDATURE HYBRIDE : envoi direct (Resend) + fallback mailto
-- À exécuter dans l'éditeur SQL du dashboard Supabase.
-- Étend la table `applications` existante (créée par supabase_schema.sql
-- mais jamais utilisée par le code applicatif) pour supporter le tracking
-- des deux méthodes de candidature depuis le job board public.
-- ====================================================================

-- 1. Assouplir les contraintes existantes devenues incompatibles
--    (candidature anonyme : pas de compte, donc pas toujours de nom/email structuré)
ALTER TABLE public.applications ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.applications ALTER COLUMN email DROP NOT NULL;

-- 2. Nouvelles colonnes pour le flux hybride
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS candidate_name TEXT,
  ADD COLUMN IF NOT EXISTS candidate_message TEXT,
  ADD COLUMN IF NOT EXISTS cv_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS recruiter_email TEXT,
  ADD COLUMN IF NOT EXISTS method TEXT NOT NULL DEFAULT 'mailto',
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_method_check,
  ADD CONSTRAINT applications_method_check CHECK (method IN ('direct', 'mailto'));

-- 3. Élargir le CHECK sur status pour couvrir les nouveaux statuts hybrides
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected', 'sent', 'opened_mailto', 'failed'));

-- 4. Index pour les requêtes par offre (comptage admin, rate-limit)
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_method_created
  ON public.applications(job_id, method, created_at);

-- ====================================================================
-- COMPTEUR AUTOMATIQUE : job_offers.applications_count
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_application()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.job_offers
  SET applications_count = COALESCE(applications_count, 0) + 1
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_created ON public.applications;
CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_application();

-- ====================================================================
-- STORAGE BUCKET : candidatures-cv (privé, service_role uniquement)
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('candidatures-cv', 'candidatures-cv', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Volontairement AUCUNE policy RLS n'est ajoutée sur ce bucket ni sur les
-- INSERT `applications` liés au flux hybride : sans policy, RLS refuse par
-- défaut tout accès aux rôles `anon`/`authenticated`, tandis que
-- `service_role` (utilisé exclusivement par l'Edge Function submit-application)
-- bypass toujours RLS. C'est donc déjà un accès "service_role only" — le
-- frontend n'uploade jamais directement vers ce bucket ni n'insère
-- directement dans `applications` pour ce flux, il passe systématiquement
-- par l'Edge Function.

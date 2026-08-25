-- ====================================================================
-- Migration: Backfill companies.category depuis job_offers.special_category
--            + backfill companies.slug pour les entreprises existantes
-- Date: 2026-08-25
-- Note: À exécuter manuellement une seule fois dans l'éditeur SQL Supabase.
--       Idempotent : ne touche que les lignes où category/slug est NULL.
--       special_category N'EST PAS supprimé de job_offers (conservé pour
--       historique) mais n'est plus lu par le code applicatif.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1. Backfill companies.category à partir de la dernière offre catégorisée
--    liée à chaque entreprise (mapping ancien système -> nouveau système)
UPDATE public.companies c
SET category = mapped.category
FROM (
  SELECT DISTINCT ON (jo.company_id)
    jo.company_id,
    CASE jo.special_category
      WHEN 'Concours & Grandes Écoles'   THEN 'ecole'
      WHEN 'Grande Distribution & Retail' THEN 'entreprise'
      WHEN 'Fonction Publique'            THEN 'etat'
    END AS category
  FROM public.job_offers jo
  WHERE jo.company_id IS NOT NULL
    AND jo.special_category IN ('Concours & Grandes Écoles', 'Grande Distribution & Retail', 'Fonction Publique')
  ORDER BY jo.company_id, jo.created_at DESC
) AS mapped
WHERE c.id = mapped.company_id
  AND c.category IS NULL;

-- 2. Backfill companies.slug (nécessaire pour les routes /entreprises/[slug])
--    à partir de company_name, avec dédoublonnage par suffixe numérique.
UPDATE public.companies c
SET slug = base.final_slug
FROM (
  SELECT
    id,
    CASE WHEN rn = 1 THEN root_slug ELSE root_slug || '-' || rn::text END AS final_slug
  FROM (
    SELECT
      id,
      lower(regexp_replace(regexp_replace(unaccent(company_name), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+)|(-+$)', '', 'g')) AS root_slug,
      row_number() OVER (
        PARTITION BY lower(regexp_replace(regexp_replace(unaccent(company_name), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+)|(-+$)', '', 'g'))
        ORDER BY created_at
      ) AS rn
    FROM public.companies
    WHERE slug IS NULL
  ) AS numbered
) AS base
WHERE c.id = base.id;

-- ====================================================================
-- Fix: la contrainte FK companies_id_fkey (-> profiles) est toujours
-- active en production malgré la note de 20260821_migration_companies_schema.sql
-- qui affirmait l'avoir supprimée. Résultat : impossible de créer une
-- institution admin (sans compte utilisateur) -> "violates foreign key
-- constraint companies_id_fkey".
-- A exécuter une seule fois dans l'éditeur SQL Supabase.
-- ====================================================================

ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_id_fkey;

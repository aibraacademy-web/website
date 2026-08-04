import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant dans les variables d\'environnement.'
  );
}

// Fournir des valeurs par défaut vides évite le crash fatal (page blanche)
// de createClient() lors de l'évaluation du module par le navigateur.
export const supabase = createClient(
  supabaseUrl || 'https://missing-env.supabase.co', 
  supabaseAnonKey || 'missing-anon-key'
);

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

const TITLE = 'Chargé(e) de Recrutement RH';

async function run() {
  try {
    const { data, error } = await supabase
      .from('job_offers')
      .select('id,title,description,missions,profile_requirements,contact_email,contact_phone,original_link,status')
      .eq('title', TITLE)
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Unexpected error', e);
    process.exit(1);
  }
}

run();

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('Missing Supabase credentials'); process.exit(1); }
const supabase = createClient(url, key);

const TITLE = 'Chargé(e) de Recrutement RH';

const isHeadingOrContact = (line) => {
  if (!line) return false;
  const l = line.toLowerCase();
  return /^(profil(?: recherch)?|profil recherch|profil recherché|profil)\b/i.test(line)
    || /comp[eé]tences?|skills?|aptitudes/i.test(line)
    || /^(ce que nous offrons|nous offrons|avantages|conditions)\b/i.test(l)
    || /^pour postuler\b/i.test(l)
    || /^email\b|^e-mail\b|^t[eé]l[eé]phone\b|^t[eé]l\b|^contact\b/i.test(l)
    || /^profil recherché :?/i.test(l);
};

async function run() {
  const { data, error } = await supabase
    .from('job_offers')
    .select('id,title,missions,profile_requirements')
    .eq('title', TITLE)
    .limit(1)
    .single();

  if (error) { console.error('Select error', error); process.exit(1); }
  console.log('Before:', JSON.stringify({ missions: data.missions, profile: data.profile_requirements }, null, 2));

  const missions = Array.isArray(data.missions) ? data.missions.map(s=>s.trim()).filter(Boolean) : [];
  const profile = Array.isArray(data.profile_requirements) ? data.profile_requirements.map(s=>s.trim()).filter(Boolean) : [];

  // Trim missions up to first heading occurrence
  let cutIdx = missions.findIndex(line => isHeadingOrContact(line));
  const cleanedMissions = cutIdx === -1 ? missions : missions.slice(0, cutIdx);

  // Clean profile: remove heading lines, offers and contact lines
  let cleanedProfile = profile.filter(line => !isHeadingOrContact(line));

  // Extract competences if present inside profile as a comma-separated line
  let competences = [];
  const compIdx = profile.findIndex(l => /comp[eé]tences?|skills?/i.test(l) || (l.match(/,/g)||[]).length>1);
  if (compIdx !== -1) {
    const compLine = profile[compIdx];
    // extract after colon if present
    const after = compLine.split(':').slice(1).join(':') || compLine;
    competences = after.split(',').map(s=>s.trim()).filter(Boolean);
    // remove that line from cleanedProfile
    cleanedProfile = cleanedProfile.filter(l => l !== compLine);
  }

  // Remove any duplicates between missions and profile
  const profileFilteredNoDup = cleanedProfile.filter(p => !cleanedMissions.includes(p));

  console.log('Cleaned missions:', JSON.stringify(cleanedMissions, null, 2));
  console.log('Cleaned profile:', JSON.stringify(profileFilteredNoDup, null, 2));
  console.log('Extracted competences:', JSON.stringify(competences, null, 2));

  // Update DB
  const updateResponse = await supabase
    .from('job_offers')
    .update({ missions: cleanedMissions, profile_requirements: profileFilteredNoDup })
    .eq('id', data.id)
    .select();

  if (updateResponse.error) {
    console.error('Update error', updateResponse.error);
    process.exit(1);
  }
  console.log('Update response:', JSON.stringify(updateResponse.data, null, 2));

  // Re-read and print
  const { data: after, error: afterErr } = await supabase
    .from('job_offers')
    .select('id,title,missions,profile_requirements')
    .eq('id', data.id)
    .single();

  if (afterErr) { console.error('After select error', afterErr); process.exit(1); }
  console.log('After:', JSON.stringify({ missions: after.missions, profile: after.profile_requirements }, null, 2));
}

run();

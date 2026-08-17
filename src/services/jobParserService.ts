import { JobCategory, MoroccanCity, ContractType, JobOffer } from '../types';

// Arrays for the parser to use
const cities: MoroccanCity[] = [
  'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Oujda', 'Meknès', 
  'El Jadida', 'Kénitra', 'Tétouan', 'Nador', 'Salé', 'Mohammedia', 'Beni Mellal', 
  'Settat', 'Laâyoune', 'Berrechid', 'Safi', 'Essaouira', 'Errachidia', 'Taza', 
  'Guelmim', 'Dakhla', 'Autre ville'
];

export const detectContractType = (raw: string): ContractType | undefined => {
  const n = raw.toLowerCase();
  if (/\bcdi\b/.test(n)) return 'CDI';
  if (/\bcdd\b/.test(n)) return 'CDD';
  if (/\balternance\b/.test(n)) return 'Alternance';
  if (/\b(?:stage|pfe)\b/.test(n)) return 'Stage / PFE';
  if (/\bint[eé]rim\b/.test(n)) return 'Intérim';
  return undefined;
};

// Remove accents for text processing
const normalizeText = (text: string) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export const detectCity = (text: string): MoroccanCity | undefined => {
  const normalizedText = normalizeText(text);
  
  // Sort cities by length descending so we match "Beni Mellal" before checking smaller words
  const sortedCities = [...cities].sort((a, b) => b.length - a.length);

  for (const city of sortedCities) {
    if (city === 'Autre ville') continue;
    
    const normalizedCity = normalizeText(city);
    // Use word boundaries for matching
    const regex = new RegExp(`\\b${normalizedCity}\\b`, 'i');
    if (regex.test(normalizedText)) {
      return city;
    }
  }
  
  return undefined;
};

export const detectExperienceLevel = (text: string): JobOffer['experienceLevel'] | undefined => {
  const t = text.toLowerCase();
  
  if (t.includes('stage') || t.includes('pfe')) return 'Stage PFE';
  
  // Look for "X ans" or "X à Y ans"
  if (/\b(?:0|1)\s*an\b|\bd[eé]butant\b|\bjr\b|\bjunior\b/i.test(t)) return 'Débutant (0-1 an)';
  if (/\b(?:1|2|3)\s*ans\b/i.test(t)) return '1 à 3 ans';
  if (/\b(?:3|4|5)\s*ans\b/i.test(t)) return '3 à 5 ans';
  
  if (t.includes('tous niveaux')) return 'Tous niveaux';
  
  return undefined;
};

export const detectCategory = (title: string, description: string): JobCategory | undefined => {
  const categoriesMap: Record<JobCategory, string[]> = {
    'Informatique': ['développeur', 'dev', 'fullstack', 'frontend', 'backend', 'devops', 'data', 'cloud', 'it', 'réseau', 'logiciel', 'software', 'informatique'],
    'Mécanique': ['technicien', 'mécanicien', 'maintenance', 'industriel', 'électromécanique', 'production', 'ingénieur mécanique'],
    'RH': ['recrutement', 'paie', 'gpec', 'gestion du personnel', 'ressources humaines', 'rh', 'talent acquisition'],
    'Comptabilité': ['comptable', 'audit', 'fiscal', 'trésorerie', 'dcg', 'dscg', 'finance', 'comptabilité'],
    'Marketing': ['community manager', 'seo', 'digital', 'communication', 'marketing', 'social media', 'content'],
    'Administration': ['secrétaire', 'assistant', 'administrative', 'accueil', 'office manager', 'administration'],
    'Agriculture': ['agronome', 'agricole', 'irrigation', 'exploitation', 'agriculture', 'ferme'],
    'Commercial': ['commercial', 'vente', 'sales', 'business developer', 'account manager', 'technico-commercial'],
    'Logistique': ['logistique', 'supply chain', 'transport', 'achats', 'magasinier', 'approvisionnement'],
    'Santé': ['médecin', 'infirmier', 'santé', 'médical', 'clinique', 'pharmacie', 'soin'],
    'Éducation': ['professeur', 'enseignant', 'formateur', 'éducation', 'école', 'pédagogique'],
    'BTP': ['btp', 'construction', 'chantier', 'génie civil', 'architecte', 'conducteur de travaux'],
    'Finance': ['finance', 'analyste', 'banque', 'investissement', 'contrôle de gestion'],
    'Hôtellerie': ['hôtellerie', 'restauration', 'tourisme', 'réceptionniste', 'cuisinier', 'serveur'],
    'Juridique': ['juridique', 'avocat', 'juriste', 'droit', 'légal', 'compliance'],
    'Autre': []
  };

  const normTitle = normalizeText(title);
  const normDesc = normalizeText(description);

  let bestCategory: JobCategory | undefined = undefined;
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(categoriesMap)) {
    if (category === 'Autre') continue;

    let score = 0;
    for (const kw of keywords) {
      const normKw = normalizeText(kw);
      const regex = new RegExp(`\\b${normKw}\\b`, 'ig');
      
      const titleMatches = (normTitle.match(regex) || []).length;
      const descMatches = (normDesc.match(regex) || []).length;

      // Title matches weigh 3x more than description matches
      score += (titleMatches * 3) + descMatches;
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as JobCategory;
    }
  }

  // Fallback to "Autre" if no strong match or return undefined?
  // Let's return undefined so the caller knows it wasn't detected and can show the warning
  return maxScore > 0 ? bestCategory : undefined;
};

export const parseJobText = (rawText: string) => {
  const cleanText = rawText.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(line => line.trim()).filter(Boolean);
  const titleLine = lines[0] || '';
  const title = titleLine.replace(/^offre\s+d['’]emploi\s*[:\-]?\s*/i, '').trim() || titleLine;
  const companyMatch = cleanText.match(/chez\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ0-9&'’\-\s]+)/i) || cleanText.match(/entreprise\s*[:\-]\s*([A-Za-zÀ-ÿ0-9&'’\-\s]+)/i);
  const company = companyMatch ? companyMatch[1].trim().split('\n')[0] : '';
  
  const city = detectCity(cleanText);
  const contractType = detectContractType(cleanText);
  const experienceLevel = detectExperienceLevel(cleanText);

  // Define heading patterns to reliably split sections
  const headingPatterns: { key: string; pattern: RegExp }[] = [
    { key: 'missions', pattern: /^(?:m[iî]ssions|🎯|responsabilit)/i },
    { key: 'profile', pattern: /^(?:profil(?: recherch[eé])?|👤)/i },
    { key: 'competences', pattern: /^(?:comp[eé]tences?|skills?|aptitudes)/i },
    { key: 'offers', pattern: /^(?:ce que nous offrons|nous offrons|avantages|conditions)/i },
    { key: 'contact', pattern: /^(?:candidature|contact|📧|email|mail|📩)/i },
  ];

  // Find heading indices
  const foundHeadings: { key: string; idx: number }[] = headingPatterns
    .map(h => ({ key: h.key, idx: lines.findIndex(l => h.pattern.test(l)) }))
    .filter(h => h.idx >= 0)
    .sort((a, b) => a.idx - b.idx);

  // Description is the text between the title (line 0) and the first detected heading
  const firstHeadingIdx = foundHeadings.length > 0 ? foundHeadings[0].idx : -1;
  const descriptionEnd = firstHeadingIdx >= 0 ? firstHeadingIdx : Math.min(5, lines.length);
  const descriptionLines = lines.slice(1, descriptionEnd).filter(line => !/^(?:lieu|ville|contrat|type|poste|expérience|experience)\b/i.test(line));
  const description = descriptionLines.join(' ');

  const category = detectCategory(title, cleanText);

  // Helper to extract section between a heading and the next heading (or end)
  const extractSectionByKey = (key: string) => {
    const heading = foundHeadings.find(h => h.key === key);
    if (!heading) return [];
    const start = heading.idx + 1;
    const following = foundHeadings.find(h => h.idx > heading.idx);
    const end = following ? following.idx : lines.length;
    return lines.slice(start, end).map(line => line.replace(/^[•\-►→\*\s]+/, '').trim()).filter(Boolean);
  };

  const missions = extractSectionByKey('missions');
  const profile = extractSectionByKey('profile');
  const competences = extractSectionByKey('competences');
  const offers = extractSectionByKey('offers');

  // Contact extraction: try to extract email and subject anywhere in text
  const emailMatch = cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const contactEmail = emailMatch ? emailMatch[0] : '';
  const subjectMatch = cleanText.match(/objet\s*(?:du)?\s*(?:mail|email)\s*[:\-]?\s*(.*)/i);
  const contactSubject = subjectMatch ? subjectMatch[1].trim().split('\n')[0] : '';
  const linkMatch = cleanText.match(/https?:\/\/\S+/i);
  const originalLink = linkMatch ? linkMatch[0] : '';

  // If competences were not found as a heading but appear as a comma-separated line in profile, extract them
  let finalCompetences = competences;
  let finalProfile = profile;
  if (finalCompetences.length === 0 && finalProfile.length > 0) {
    const first = finalProfile[0] || '';
    if ((first.match(/,/g) || []).length >= 1 && /[a-zA-Z]{2,}/.test(first)) {
      const extracted = first.split(',').map(s => s.trim()).filter(Boolean);
      // Heuristic: if there are more than 1 items, treat as competences
      if (extracted.length > 1) {
        finalCompetences = extracted.filter(c => !/comp[eé]tence|skill/i.test(c));
        finalProfile = finalProfile.slice(1);
      }
    }
  }

  return {
    title,
    company,
    city,
    contractType,
    category,
    experienceLevel,
    description,
    missionsRaw: missions.join('\n'),
    profileRaw: finalProfile.join('\n'),
    competencesRaw: finalCompetences.join(', '),
    benefitsRaw: offers.join('\n'), // Changed to benefitsRaw to map clearly to form
    contactEmail,
    contactSubject,
    originalLink
  };
};

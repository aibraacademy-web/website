import { JobCategory, MoroccanCity, ContractType, JobOffer } from '../types';
import { GoogleGenAI } from '@google/genai';

// Arrays for the parser to use
const cities: MoroccanCity[] = [
  'Agadir', 'Al Hoceïma', 'Aousserd', 'Assa-Zag', 'Azilal', 'Azrou', 'Béni Mellal', 'Berkane', 'Berrechid', 'Boujdour', 'Bouskoura', 'Casablanca', 'Chefchaouen', 'Chichaoua', 'Dakhla', 'Demnate', 'Driouch', 'El Jadida', 'El Kelaâ des Sraghna', 'Errachidia', 'Essaouira', 'Fès', 'Fquih Ben Salah', 'Guelmim', 'Guelta Zemmour', 'Guercif', 'Ifrane', 'Jerada', 'Kénitra', 'Khemisset', 'Khouribga', 'Ksar El Kébir', 'Laâyoune', 'Larache', 'Marrakech', 'Meknès', 'Midelt', 'Mohammedia', 'Nador', 'Ouarzazate', 'Ouazzane', 'Oued Zem', 'Oujda', 'Rabat', 'Rhamna (Benguerir)', 'Safi', 'Salé', 'Sefrou', 'Settat', 'Sidi Bennour', 'Sidi Ifni', 'Sidi Kacem', 'Sidi Slimane', 'Smara', 'Tan-Tan', 'Tanger', 'Taourirt', 'Taroudant', 'Tata', 'Taza', 'Témara', 'Tétouan', 'Tifelt', 'Tinghir', 'Tiznit', 'Youssoufia', 'Zagora', 'Zemamra', 'Autre ville'
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
export const normalizeText = (text: string) => {
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

  return maxScore > 0 ? bestCategory : undefined;
};

/**
 * Nettoie la description pour supprimer toute répétition du nom de l'entreprise
 * ou des préfixes du type "Entreprise : ...", "Société : ...", "Chez ..."
 */
export const cleanDescription = (description: string, company?: string): string => {
  if (!description) return '';
  let clean = description.trim();

  // Supprimer les préfixes comme "Entreprise : XYZ", "Société : XYZ", "Client : XYZ", "Employeur : XYZ"
  clean = clean.replace(/^(?:entreprise|soci[eé]t[eé]|client|employeur|cabinet)\s*[:\-–]\s*[^\n\.\,]+[\n\.\,]?\s*/i, '');
  clean = clean.replace(/^(?:chez|pour le compte de)\s+[^\n\.\,]+[\n\.\,]?\s*/i, '');

  // Supprimer si l'entreprise est répétée au tout début (ex: "Aibra Tech recrute...")
  if (company && company.trim().length > 1) {
    const escapedComp = company.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const compRegex = new RegExp(`^${escapedComp}\\s*(?:recrute|cherche|est à la recherche de|engage|embauche)?\\s*[:\-–]?\\s*`, 'i');
    clean = clean.replace(compRegex, '');
  }

  // Nettoyer les espaces et sauts de ligne au début
  clean = clean.replace(/^[,\.\-–:\s]+/, '').trim();
  return clean;
};

export interface ParsedJobData {
  title: string;
  company: string;
  city?: MoroccanCity;
  contractType?: ContractType;
  category?: JobCategory;
  experienceLevel?: JobOffer['experienceLevel'];
  salaryRange?: string;
  description: string;
  contactEmail: string;
  contactSubject: string;
  originalLink: string;
}

/**
 * Analyse par IA (Gemini) : extrait les métadonnées et unifie tout le texte dans le champ unique `description`.
 */
export const parseJobWithGemini = async (rawText: string): Promise<ParsedJobData | null> => {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Tu es un assistant expert en extraction et structuration d'offres d'emploi au Maroc.
Analyse le texte d'offre d'emploi brut ci-dessous et retourne UNIQUEMENT un objet JSON valide contenant les champs structurés suivants :

{
  "title": "Titre exact du poste",
  "company": "Nom de l'entreprise uniquement (ex: AXA, Capgemini, etc.)",
  "city": "Une ville marocaine parmi : Agadir, Al Hoceïma, Casablanca, Fès, Kénitra, Marrakech, Meknès, Mohammedia, Oujda, Rabat, Salé, Tanger, Témara, Tétouan, Autre ville, etc.",
  "category": "Un secteur parmi : RH, Comptabilité, Mécanique, Administration, Informatique, Agriculture, Marketing, Commercial, Logistique, Santé, Éducation, BTP, Finance, Hôtellerie, Juridique, Autre",
  "contractType": "Un type parmi : CDI, CDD, Stage / PFE, Alternance, Intérim",
  "experienceLevel": "Un niveau parmi : Débutant (0-1 an), 1 à 3 ans, 3 à 5 ans, Stage PFE, Tous niveaux",
  "salaryRange": "Fourchette salariale si mentionnée (ex: 6 000 – 8 000 MAD) ou chaîne vide",
  "description": "Texte complet structuré et aéré de l'offre (avec sauts de ligne). Doit contenir le paragraphe de contexte du poste (SANS répéter l'entreprise au début), suivi des sections avec titres clairs et tirets (ex:\n\nMissions & Responsabilités :\n- Mission 1\n- Mission 2\n\nProfil recherché :\n- Critère 1\n- Critère 2\n\nAvantages :\n- Avantage 1)",
  "contactEmail": "Adresse email pour postuler si trouvée ou vide",
  "contactPhone": "Numéro de téléphone si trouvé ou vide",
  "contactSubject": "Objet recommandé pour le mail de candidature si mentionné ou vide",
  "originalLink": "Lien web vers l'annonce si mentionné ou vide"
}

RÈGLES IMPORTANTES ET STRICTES :
1. Le nom de l'entreprise (company) doit être extrait et stocké UNIQUEMENT dans son propre champ company, jamais mélangé ou dupliqué dans le champ description.
2. Le champ description doit être un texte libre unique complet et structuré avec ses propres retours à la ligne (\\n\\n).
3. N'inclus jamais le nom de l'entreprise au début du champ description, il est déjà extrait séparément dans le champ company.

Texte brut de l'offre d'emploi :
"""
${rawText}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim();
    if (!text) return null;

    // Parser le JSON retourné
    const cleanedJson = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    const json = JSON.parse(cleanedJson);

    const company = (json.company || '').trim();
    const description = cleanDescription(json.description || '', company);

    return {
      title: json.title || '',
      company: company,
      city: json.city || undefined,
      contractType: json.contractType || undefined,
      category: json.category || undefined,
      experienceLevel: json.experienceLevel || undefined,
      salaryRange: json.salaryRange || '',
      description: description,
      contactEmail: json.contactEmail || '',
      contactSubject: json.contactSubject || '',
      originalLink: json.originalLink || ''
    };
  } catch (err) {
    console.warn('[jobParserService] Erreur Gemini, bascule sur le parser heuristique:', err);
    return null;
  }
};

/**
 * Analyse heuristique / règles regex : regroupe tout le contenu dans le champ unique `description`.
 */
export const parseJobTextSync = (rawText: string): ParsedJobData => {
  const cleanText = rawText.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(line => line.trim()).filter(Boolean);
  const titleLine = lines[0] || '';
  const title = titleLine.replace(/^offre\s+d['’]emploi\s*[:\-]?\s*/i, '').trim() || titleLine;
  
  // Extraction de l'entreprise
  const companyMatch = cleanText.match(/chez\s+([A-ZÀ-Ÿ0-9][A-Za-zÀ-ÿ0-9&'’\-\s]{1,40})/i) || 
                       cleanText.match(/entreprise\s*[:\-]\s*([A-Za-zÀ-ÿ0-9&'’\-\s]{1,40})/i) ||
                       cleanText.match(/soci[eé]t[eé]\s*[:\-]\s*([A-Za-zÀ-ÿ0-9&'’\-\s]{1,40})/i) ||
                       cleanText.match(/cabinet\s*[:\-]\s*([A-Za-zÀ-ÿ0-9&'’\-\s]{1,40})/i);
  
  let company = companyMatch ? companyMatch[1].trim().split('\n')[0] : '';
  company = company.replace(/\s+(?:recrute|cherche|basé|situé).*$/i, '').trim();

  const city = detectCity(cleanText);
  const contractType = detectContractType(cleanText);
  const experienceLevel = detectExperienceLevel(cleanText);

  // Définition des séparateurs de sections
  const headingPatterns: { key: string; label: string; pattern: RegExp }[] = [
    { key: 'missions', label: 'Missions & Responsabilités :', pattern: /^(?:m[iî]ssions|🎯|responsabilit[eé]s?|vos missions)/i },
    { key: 'profile', label: 'Profil recherché :', pattern: /^(?:profil(?: recherch[eé])?|👤|exigences|pr[eé]requis)/i },
    { key: 'competences', label: 'Compétences requises :', pattern: /^(?:comp[eé]tences?|skills?|aptitudes|savoir-faire)/i },
    { key: 'offers', label: 'Ce que nous offrons / Avantages :', pattern: /^(?:ce que nous offrons|nous offrons|avantages|conditions|pourquoi nous rejoindre)/i },
    { key: 'contact', label: 'Contact & Candidature :', pattern: /^(?:candidature|contact|📧|email|mail|📩|postuler)/i },
  ];

  // Recherche des indices de titres de sections
  const foundHeadings = headingPatterns
    .map(h => ({ key: h.key, label: h.label, idx: lines.findIndex(l => h.pattern.test(l)) }))
    .filter(h => h.idx >= 0)
    .sort((a, b) => a.idx - b.idx);

  // Description : texte entre le titre et la première section détectée
  const firstHeadingIdx = foundHeadings.length > 0 ? foundHeadings[0].idx : -1;
  const descriptionEnd = firstHeadingIdx >= 0 ? firstHeadingIdx : Math.min(5, lines.length);
  
  const descriptionLines = lines.slice(1, descriptionEnd).filter(line => {
    if (/^(?:lieu|ville|contrat|type|poste|expérience|experience|secteur|salaire)\b/i.test(line)) return false;
    if (/^(?:entreprise|soci[eé]t[eé]|client|employeur|cabinet)\s*[:\-]/i.test(line)) return false;
    return true;
  });

  const rawIntro = descriptionLines.join(' ');
  const intro = cleanDescription(rawIntro, company);

  const category = detectCategory(title, cleanText);

  // Helper pour extraire le contenu d'une section
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

  // Contact : extraction de l'email, téléphone, lien et objet
  const emailMatch = cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const contactEmail = emailMatch ? emailMatch[0] : '';
  const subjectMatch = cleanText.match(/objet\s*(?:du)?\s*(?:mail|email)\s*[:\-]?\s*(.*)/i);
  const contactSubject = subjectMatch ? subjectMatch[1].trim().split('\n')[0] : '';
  const linkMatch = cleanText.match(/https?:\/\/\S+/i);
  const originalLink = linkMatch ? linkMatch[0] : '';

  // Construction du texte unique structuré
  const textSections: string[] = [];
  if (intro) {
    textSections.push(intro);
  }
  if (missions.length > 0) {
    textSections.push(`Missions & Responsabilités :\n${missions.map(m => `- ${m}`).join('\n')}`);
  }
  if (profile.length > 0) {
    textSections.push(`Profil recherché :\n${profile.map(p => `- ${p}`).join('\n')}`);
  }
  if (competences.length > 0) {
    textSections.push(`Compétences requises :\n${competences.map(c => `- ${c}`).join('\n')}`);
  }
  if (offers.length > 0) {
    textSections.push(`Avantages & Ce que nous offrons :\n${offers.map(o => `- ${o}`).join('\n')}`);
  }

  // Fallback si aucune section spécifique n'a été détectée mais qu'il y a du texte
  const finalDescription = textSections.length > 0 
    ? textSections.join('\n\n')
    : lines.slice(1).join('\n');

  return {
    title,
    company,
    city,
    contractType,
    category,
    experienceLevel,
    description: finalDescription,
    contactEmail,
    contactSubject,
    originalLink
  };
};

/**
 * Fonction principale d'analyse : tente Gemini en premier, puis bascule sur le parser heuristique
 */
export const parseJobText = async (rawText: string): Promise<ParsedJobData> => {
  const aiResult = await parseJobWithGemini(rawText);
  if (aiResult) {
    return aiResult;
  }
  return parseJobTextSync(rawText);
};



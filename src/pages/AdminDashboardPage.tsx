import React, { useState } from 'react';
import { JobOffer, JobCategory, MoroccanCity, ContractType } from '../types';
import { addJobOffer, deleteJob } from '../services/jobService';
import { 
  PlusCircle, 
  Building2, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  List,
  Trash2,
  Settings
} from 'lucide-react';

interface AdminDashboardPageProps {
  jobs: JobOffer[];
  onJobAdded: (newJob: JobOffer) => void;
  onJobDeleted: (jobId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  jobs,
  onJobAdded,
  onJobDeleted
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'RH' as JobCategory,
    city: 'Casablanca' as MoroccanCity,
    contractType: 'CDI' as ContractType,
    experienceLevel: 'Débutant (0-1 an)' as JobOffer['experienceLevel'],
    contactEmail: '',
    contactSubject: '',
    salaryRange: '',
    description: '',
    missionsRaw: '',
    profileRaw: '',
    originalLink: ''
  });
  const [linkedInText, setLinkedInText] = useState('');
  const [parseNotice, setParseNotice] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const normalizeContractType = (raw: string): ContractType | undefined => {
    const normalized = raw.toLowerCase();
    if (normalized.includes('cdi')) return 'CDI';
    if (normalized.includes('cdd')) return 'CDD';
    if (normalized.includes('alternance')) return 'Alternance';
    if (normalized.includes('stage')) return 'Stage / PFE';
    if (normalized.includes('intérim') || normalized.includes('interim')) return 'Intérim';
    return undefined;
  };

  const parseLinkedInText = (rawText: string) => {
    const cleanText = rawText.replace(/\r/g, '');
    const lines = cleanText.split('\n').map(line => line.trim()).filter(Boolean);
    const fullText = cleanText.toLowerCase();
    const titleLine = lines[0] || '';
    const title = titleLine.replace(/^offre\s+d['’]emploi\s*[:\-]?\s*/i, '').trim() || titleLine;
    const companyMatch = cleanText.match(/chez\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ0-9&'’\-\s]+)/i) || cleanText.match(/entreprise\s*[:\-]\s*([A-Za-zÀ-ÿ0-9&'’\-\s]+)/i);
    const company = companyMatch ? companyMatch[1].trim().split('\n')[0] : '';
    const city = cities.find(city => new RegExp(`\\b${city}\\b`, 'i').test(cleanText));
    const contractType = normalizeContractType(fullText);
    const descriptionCandidate = lines.slice(1, 5).filter(line => !/^(lieu|ville|contrat|type|poste|expérience|experience|temps|entreprise)\b/i.test(line)).join(' ');
    
    // Find section markers (emoji or keywords)
    const findSectionStart = (pattern: RegExp) => lines.findIndex(line => pattern.test(line));
    const missionStart = findSectionStart(/(?:m[iî]ssions|🎯)/i);
    const profileStart = findSectionStart(/(?:profil|👤)/i);
    const subjectStart = findSectionStart(/objet\s*(?:du)?\s*(?:mail|email)/i);
    
    // Description extraction (before first section)
    const descriptionEnd = [missionStart, profileStart, subjectStart].filter(idx => idx >= 0).sort((a, b) => a - b)[0];
    const descriptionLines = lines.slice(1, descriptionEnd >= 0 ? descriptionEnd : 5)
      .filter(line => !/^(🎯|👤|📧|📝|lieu|ville|contrat|type|poste|expérience|experience)\b/i.test(line));
    const description = descriptionLines.join(' ');
    
    // Extract section content
    const extractSection = (startIdx: number) => {
      if (startIdx < 0) return [];
      const stopIdx = lines.findIndex((line, idx) => idx > startIdx && /^(?:👤|📧|📝|🎯|objet\b|candidature\b|merci\b)/i.test(line));
      return lines.slice(startIdx + 1, stopIdx >= 0 ? stopIdx : undefined)
        .map(line => line.replace(/^[•\-►→\*\s]+/, '').trim())
        .filter(Boolean);
    };
    
    const missions = extractSection(missionStart);
    const profile = extractSection(profileStart);
    const missionsRaw = missions.join('\n');
    const profileRaw = profile.join('\n');
    
    // Email extraction
    const emailMatch = cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const contactEmail = emailMatch ? emailMatch[0] : '';
    
    // Mail subject extraction
    const subjectMatch = cleanText.match(/objet\s*(?:du)?\s*(?:mail|email)\s*[:\-]?\s*(.*)/i);
    const contactSubject = subjectMatch ? subjectMatch[1].trim().split('\n')[0] : '';
    
    const linkMatch = cleanText.match(/https?:\/\/\S+/i);
    const originalLink = linkMatch ? linkMatch[0] : '';

    return {
      title,
      company,
      city,
      contractType,
      description,
      missionsRaw,
      profileRaw,
      contactEmail,
      contactSubject,
      originalLink
    };
  };

  const handleParseText = () => {
    const raw = linkedInText.trim();
    if (!raw) {
      setParseNotice('Veuillez coller un texte depuis LinkedIn ou Facebook avant d’analyser.');
      return;
    }

    const parsed = parseLinkedInText(raw);
    setFormData((prev) => ({
      ...prev,
      title: parsed.title || prev.title,
      company: parsed.company || prev.company,
      city: parsed.city || prev.city,
      contractType: parsed.contractType || prev.contractType,
      description: parsed.description || prev.description,
      missionsRaw: parsed.missionsRaw || prev.missionsRaw,
      profileRaw: parsed.profileRaw || prev.profileRaw,
      contactEmail: parsed.contactEmail || prev.contactEmail,
      contactSubject: parsed.contactSubject || prev.contactSubject,
      originalLink: parsed.originalLink || prev.originalLink
    }));

    const noticeParts = [];
    if (parsed.title) noticeParts.push('Titre détecté');
    if (parsed.city) noticeParts.push(`Ville détectée: ${parsed.city}`);
    if (parsed.contractType) noticeParts.push(`Type de contrat: ${parsed.contractType}`);
    if (parsed.company) noticeParts.push(`Entreprise possible: ${parsed.company}`);
    setParseNotice(noticeParts.length > 0 ? noticeParts.join(' • ') : 'Aucun champ important n’a été reconnu automatiquement. Vérifiez le texte fourni.');
  };

  const categories: JobCategory[] = ['RH', 'Comptabilité', 'Mécanique', 'Administration', 'Informatique', 'Agriculture', 'Marketing', 'Autre'];
  const cities: MoroccanCity[] = ['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Oujda', 'Meknès', 'El Jadida', 'Kénitra', 'Tétouan', 'Nador', 'Autre ville'];
  const contractTypes: ContractType[] = ['CDI', 'CDD', 'Stage / PFE', 'Alternance', 'Intérim'];
  const experienceLevels: JobOffer['experienceLevel'][] = ['Débutant (0-1 an)', '1 à 3 ans', '3 à 5 ans', 'Stage PFE', 'Tous niveaux'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.contactEmail || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const initials = formData.company.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'AB';
    
    const missions = formData.missionsRaw
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const profile = formData.profileRaw
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const created = addJobOffer({
      title: formData.title,
      company: formData.company,
      companyInitials: initials,
      category: formData.category,
      city: formData.city,
      contractType: formData.contractType,
      experienceLevel: formData.experienceLevel,
      contactEmail: formData.contactEmail,
      contactSubject: formData.contactSubject || undefined,
      salaryRange: formData.salaryRange || 'A négocier',
      description: formData.description,
      missions: missions.length > 0 ? missions : ['Missions définies lors de l\'entretien.'],
      profile: profile.length > 0 ? profile : ['Sérieux, rigueur et motivation.'],
      originalLink: formData.originalLink || undefined,
      featured: true
    });

    onJobAdded(created);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        title: '',
        company: '',
        category: 'RH',
        city: 'Casablanca',
        contractType: 'CDI',
        experienceLevel: 'Débutant (0-1 an)',
        contactEmail: '',
        contactSubject: '',
        salaryRange: '',
        description: '',
        missionsRaw: '',
        profileRaw: '',
        originalLink: ''
      });
      setActiveTab('manage');
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette offre ?')) {
      deleteJob(id);
      onJobDeleted(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Admin */}
        <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-slate-900">Tableau de bord Administrateur</h1>
              <p className="text-sm text-slate-500">Gestion des offres d'emploi</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'manage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-4 h-4" />
              Gérer les offres
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'add' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter une offre
            </button>
          </div>
        </div>

        {/* Tab Content: Manage */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-semibold">Poste & Entreprise</th>
                    <th className="p-4 font-semibold">Lieu & Contrat</th>
                    <th className="p-4 font-semibold text-center">Vues / Clics</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.company} • {job.publishedAt}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-700">{job.city}</p>
                        <p className="text-xs text-slate-500">{job.contractType} • {job.category}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex flex-col text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                          <span>👀 {job.viewsCount || 0}</span>
                          <span>✉️ {job.applicationsCount || 0}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer l'offre"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        Aucune offre trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Add Job */}
        {activeTab === 'add' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-serif">
                  Offre publiée avec succès !
                </h3>
                <p className="text-sm text-slate-600">L'offre est visible immédiatement sur le site public.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 pb-6 border-b border-slate-200 bg-slate-50 p-4 rounded-3xl">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-700" />
                    <span>Coller depuis LinkedIn / texte</span>
                  </h2>
                  <p className="text-sm text-slate-600">Collez un extrait brut d'une offre LinkedIn, Facebook ou autre, puis cliquez sur « Analyser le texte » pour pré-remplir le formulaire.</p>
                  <textarea
                    rows={4}
                    value={linkedInText}
                    onChange={(e) => {
                      setLinkedInText(e.target.value);
                      setParseNotice('');
                    }}
                    placeholder="Exemple : Offre d'emploi : Chargé(e) de recrutement chez ABC Consulting - CDI - Casablanca"
                    className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button type="button" onClick={handleParseText} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold hover:bg-slate-800 transition-all">
                      <FileText className="w-4 h-4" />
                      <span>Analyser le texte</span>
                    </button>
                    <button type="button" onClick={() => { setLinkedInText(''); setParseNotice(''); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                      <span>Effacer</span>
                    </button>
                  </div>
                  {parseNotice && <p className="text-sm text-slate-600 pt-1">{parseNotice}</p>}
                </div>

                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>1. Informations du poste</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre du poste *</label>
                      <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom de l'entreprise *</label>
                      <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email de candidature *</label>
                      <input type="email" required value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>2. Caractéristiques</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secteur *</label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as JobCategory })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ville *</label>
                      <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value as MoroccanCity })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contrat *</label>
                      <select value={formData.contractType} onChange={(e) => setFormData({ ...formData, contractType: e.target.value as ContractType })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        {contractTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expérience *</label>
                      <select value={formData.experienceLevel} onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as JobOffer['experienceLevel'] })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span>3. Description</span>
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                    <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Missions (une par ligne)</label>
                    <textarea rows={3} value={formData.missionsRaw} onChange={(e) => setFormData({ ...formData, missionsRaw: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profil (un par ligne)</label>
                    <textarea rows={3} value={formData.profileRaw} onChange={(e) => setFormData({ ...formData, profileRaw: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all">
                    <PlusCircle className="w-5 h-5" />
                    <span>Publier immédiatement sur le site</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

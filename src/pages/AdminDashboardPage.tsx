import React, { useState, useEffect, useRef } from 'react';
import { JobOffer, JobCategory, MoroccanCity, ContractType } from '../types';
import { fetchAllJobs, createJobOffer, deleteJobOffer, clearAllJobOffers, toggleJobActive } from '../services/jobService';
import { uploadLogo, deleteLogo } from '../services/storageService';
import { supabase } from '../lib/supabaseClient';
import { 
  PlusCircle, 
  Building2, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  List,
  Trash2,
  Settings,
  AlertTriangle,
  Upload,
  X,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  Image as ImageIcon,
  LogOut
} from 'lucide-react';

interface AdminDashboardPageProps {
  onJobAdded: (newJob: JobOffer) => void;
  onJobDeleted: (jobId: string) => void;
  onJobUpdated: (updatedJob: JobOffer) => void;
  onAllJobsCleared: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onJobAdded,
  onJobDeleted,
  onJobUpdated,
  onAllJobsCleared
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LinkedIn paste parser
  const [linkedInText, setLinkedInText] = useState('');
  const [parseNotice, setParseNotice] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'RH' as JobCategory,
    city: 'Casablanca' as MoroccanCity,
    contractType: 'CDI' as ContractType,
    experienceLevel: 'Débutant (0-1 an)' as JobOffer['experienceLevel'],
    contactEmail: '',
    contactPhone: '',
    contactSubject: '',
    salaryRange: '',
    description: '',
    missionsRaw: '',
    profileRaw: '',
    originalLink: ''
  });

  const categories: JobCategory[] = ['RH', 'Comptabilité', 'Mécanique', 'Administration', 'Informatique', 'Agriculture', 'Marketing', 'Autre'];
  const cities: MoroccanCity[] = ['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Oujda', 'Meknès', 'El Jadida', 'Kénitra', 'Tétouan', 'Nador', 'Autre ville'];
  const contractTypes: ContractType[] = ['CDI', 'CDD', 'Stage / PFE', 'Alternance', 'Intérim'];
  const experienceLevels: JobOffer['experienceLevel'][] = ['Débutant (0-1 an)', '1 à 3 ans', '3 à 5 ans', 'Stage PFE', 'Tous niveaux'];

  // ─── Chargement des offres depuis Supabase ─────────────────────────────────

  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const all = await fetchAllJobs();
      setJobs(all);
    } catch (err) {
      console.error('Erreur chargement offres admin:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // ─── Logo upload ────────────────────────────────────────────────────────────

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Le logo ne doit pas dépasser 5 Mo.');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── LinkedIn parser ────────────────────────────────────────────────────────

  const normalizeContractType = (raw: string): ContractType | undefined => {
    const n = raw.toLowerCase();
    if (n.includes('cdi')) return 'CDI';
    if (n.includes('cdd')) return 'CDD';
    if (n.includes('alternance')) return 'Alternance';
    if (n.includes('stage')) return 'Stage / PFE';
    if (n.includes('intérim') || n.includes('interim')) return 'Intérim';
    return undefined;
  };

  const parseLinkedInText = (rawText: string) => {
    const cleanText = rawText.replace(/\r/g, '');
    const lines = cleanText.split('\n').map(line => line.trim()).filter(Boolean);
    const fullText = cleanText.toLowerCase();
    const titleLine = lines[0] || '';
    const title = titleLine.replace(/^offre\s+d['']emploi\s*[:\-]?\s*/i, '').trim() || titleLine;
    const companyMatch = cleanText.match(/chez\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ0-9&''\-\s]+)/i) || cleanText.match(/entreprise\s*[:\-]\s*([A-Za-zÀ-ÿ0-9&''\-\s]+)/i);
    const company = companyMatch ? companyMatch[1].trim().split('\n')[0] : '';
    const city = cities.find(city => new RegExp(`\\b${city}\\b`, 'i').test(cleanText));
    const contractType = normalizeContractType(fullText);

    const findSectionStart = (pattern: RegExp) => lines.findIndex(line => pattern.test(line));
    const missionStart = findSectionStart(/(?:m[iî]ssions|🎯)/i);
    const profileStart = findSectionStart(/(?:profil|👤)/i);
    const subjectStart = findSectionStart(/objet\s*(?:du)?\s*(?:mail|email)/i);

    const descriptionEnd = [missionStart, profileStart, subjectStart].filter(idx => idx >= 0).sort((a, b) => a - b)[0];
    const descriptionLines = lines.slice(1, descriptionEnd >= 0 ? descriptionEnd : 5)
      .filter(line => !/^(🎯|👤|📧|📝|lieu|ville|contrat|type|poste|expérience|experience)\b/i.test(line));
    const description = descriptionLines.join(' ');

    const extractSection = (startIdx: number) => {
      if (startIdx < 0) return [];
      const stopIdx = lines.findIndex((line, idx) => idx > startIdx && /^(?:👤|📧|📝|🎯|objet\b|candidature\b|merci\b)/i.test(line));
      return lines.slice(startIdx + 1, stopIdx >= 0 ? stopIdx : undefined)
        .map(line => line.replace(/^[•\-►→\*\s]+/, '').trim())
        .filter(Boolean);
    };

    const missions = extractSection(missionStart);
    const profile = extractSection(profileStart);
    const emailMatch = cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const contactEmail = emailMatch ? emailMatch[0] : '';
    const subjectMatch = cleanText.match(/objet\s*(?:du)?\s*(?:mail|email)\s*[:\-]?\s*(.*)/i);
    const contactSubject = subjectMatch ? subjectMatch[1].trim().split('\n')[0] : '';
    const linkMatch = cleanText.match(/https?:\/\/\S+/i);
    const originalLink = linkMatch ? linkMatch[0] : '';

    return { title, company, city, contractType, description, missionsRaw: missions.join('\n'), profileRaw: profile.join('\n'), contactEmail, contactSubject, originalLink };
  };

  const handleParseText = () => {
    const raw = linkedInText.trim();
    if (!raw) {
      setParseNotice('Veuillez coller un texte avant d\'analyser.');
      return;
    }
    const parsed = parseLinkedInText(raw);
    setFormData(prev => ({
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
    const parts = [];
    if (parsed.title) parts.push('Titre détecté');
    if (parsed.city) parts.push(`Ville: ${parsed.city}`);
    if (parsed.contractType) parts.push(`Contrat: ${parsed.contractType}`);
    if (parsed.company) parts.push(`Entreprise: ${parsed.company}`);
    setParseNotice(parts.length > 0 ? parts.join(' • ') : 'Aucun champ reconnu automatiquement.');
  };

  // ─── Soumission du formulaire ───────────────────────────────────────────────

  const resetForm = () => {
    setFormData({
      title: '', company: '', category: 'RH', city: 'Casablanca',
      contractType: 'CDI', experienceLevel: 'Débutant (0-1 an)',
      contactEmail: '', contactPhone: '', contactSubject: '',
      salaryRange: '', description: '', missionsRaw: '', profileRaw: '', originalLink: ''
    });
    setLogoFile(null);
    setLogoPreview(null);
    setLinkedInText('');
    setParseNotice('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.contactEmail || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload logo si présent
      let logoUrl: string | undefined;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      // 2. Préparer les données
      const initials = formData.company.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'AB';
      const missions = formData.missionsRaw.split('\n').map(m => m.trim()).filter(m => m.length > 0);
      const profile = formData.profileRaw.split('\n').map(p => p.trim()).filter(p => p.length > 0);

      // 3. Insérer dans Supabase
      const created = await createJobOffer({
        title: formData.title,
        company: formData.company,
        companyInitials: initials,
        companyLogo: logoUrl,
        category: formData.category,
        city: formData.city,
        contractType: formData.contractType,
        experienceLevel: formData.experienceLevel,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        contactSubject: formData.contactSubject || undefined,
        salaryRange: formData.salaryRange || 'A négocier',
        description: formData.description,
        missions: missions.length > 0 ? missions : ['Missions définies lors de l\'entretien.'],
        profile: profile.length > 0 ? profile : ['Sérieux, rigueur et motivation.'],
        originalLink: formData.originalLink || undefined,
        featured: true,
        isActive: true,
      });

      onJobAdded(created);
      setJobs(prev => [created, ...prev]);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        resetForm();
        setActiveTab('manage');
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur lors de la publication : ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Actions admin ──────────────────────────────────────────────────────────

  const handleDelete = async (job: JobOffer) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'offre "${job.title}" ?`)) return;
    setDeletingId(job.id);
    try {
      // Supprimer le logo du Storage si présent
      if (job.companyLogo) {
        await deleteLogo(job.companyLogo);
      }
      await deleteJobOffer(job.id);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      onJobDeleted(job.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur suppression : ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (job: JobOffer) => {
    setTogglingId(job.id);
    try {
      await toggleJobActive(job.id, !job.isActive);
      const updated = { ...job, isActive: !job.isActive };
      setJobs(prev => prev.map(j => j.id === job.id ? updated : j));
      onJobUpdated(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur : ${msg}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleClearAll = async () => {
    if (jobs.length === 0) {
      alert('La liste des offres est déjà vide.');
      return;
    }
    const confirmed = window.confirm(
      `⚠️ Attention ! Vous allez supprimer TOUTES les ${jobs.length} offres.\n\nCette action est irréversible.\n\nContinuer ?`
    );
    if (!confirmed) return;

    try {
      await clearAllJobOffers();
      setJobs([]);
      onAllJobsCleared();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur : ${msg}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Admin */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-slate-900">Tableau de bord Administrateur</h1>
              <p className="text-sm text-slate-500">Gestion des offres d'emploi · Supabase</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>

            <button
              onClick={handleClearAll}
              title="Supprimer toutes les offres"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Réinitialiser
            </button>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'manage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-4 h-4" />
                Gérer ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'add' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <PlusCircle className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Tab: Manage */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Chargement des offres...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Logo</th>
                      <th className="p-4 font-semibold">Poste & Entreprise</th>
                      <th className="p-4 font-semibold">Lieu & Contrat</th>
                      <th className="p-4 font-semibold text-center">Statut</th>
                      <th className="p-4 font-semibold text-center">Vues</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {jobs.map((job) => (
                      <tr key={job.id} className={`hover:bg-slate-50/50 transition-colors ${!job.isActive ? 'opacity-60' : ''}`}>
                        <td className="p-4">
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo}
                              alt={job.company}
                              className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white p-1"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                              {job.companyInitials}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.company} · {job.publishedAt}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700">{job.city}</p>
                          <p className="text-xs text-slate-500">{job.contractType} · {job.category}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${job.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {job.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xs text-slate-600">👀 {job.viewsCount || 0}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle actif/inactif */}
                            <button
                              onClick={() => handleToggleActive(job)}
                              disabled={togglingId === job.id}
                              title={job.isActive ? 'Désactiver l\'offre' : 'Activer l\'offre'}
                              className={`p-2 rounded-lg transition-colors ${job.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                            >
                              {togglingId === job.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : job.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                              }
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => handleDelete(job)}
                              disabled={deletingId === job.id}
                              title="Supprimer l'offre"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              {deletingId === job.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Trash2 className="w-4 h-4" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Aucune offre trouvée. Commencez par en ajouter une.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Add Job */}
        {activeTab === 'add' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-serif">Offre publiée avec succès !</h3>
                <p className="text-sm text-slate-600">L'offre est maintenant visible sur le site public.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section: LinkedIn paste */}
                <div className="space-y-4 pb-6 border-b border-slate-200 bg-slate-50 p-4 rounded-3xl">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-700" />
                    Coller depuis LinkedIn / texte
                  </h2>
                  <p className="text-sm text-slate-600">Collez une offre brute pour pré-remplir le formulaire automatiquement.</p>
                  <textarea
                    rows={4}
                    value={linkedInText}
                    onChange={(e) => { setLinkedInText(e.target.value); setParseNotice(''); }}
                    placeholder="Exemple : Offre d'emploi : Chargé(e) de recrutement chez ABC Consulting - CDI - Casablanca"
                    className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button type="button" onClick={handleParseText} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold hover:bg-slate-800 transition-all">
                      <FileText className="w-4 h-4" />
                      Analyser le texte
                    </button>
                    <button type="button" onClick={() => { setLinkedInText(''); setParseNotice(''); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                      Effacer
                    </button>
                  </div>
                  {parseNotice && <p className="text-sm text-emerald-700 font-medium">{parseNotice}</p>}
                </div>

                {/* Section: Informations du poste */}
                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    1. Informations du poste
                  </h2>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Logo de l'entreprise</label>
                    <div className="flex items-start gap-4">
                      {/* Preview ou placeholder */}
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          Choisir un logo
                        </label>
                        {logoFile && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                            Supprimer
                          </button>
                        )}
                        <p className="text-xs text-slate-400">JPG, PNG, WebP · Max 5 Mo</p>
                      </div>
                    </div>
                  </div>

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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Téléphone (optionnel)
                      </label>
                      <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="+212 6XX XXX XXX" className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Objet du mail (optionnel)</label>
                      <input type="text" value={formData.contactSubject} onChange={(e) => setFormData({ ...formData, contactSubject: e.target.value })} placeholder="ex: Candidature - Développeur React" className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Section: Caractéristiques */}
                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    2. Caractéristiques
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

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Salaire (optionnel)</label>
                      <input type="text" value={formData.salaryRange} onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })} placeholder="ex: 5 000 – 7 000 MAD / mois" className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Section: Description */}
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    3. Description
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
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profil recherché (un par ligne)</label>
                    <textarea rows={3} value={formData.profileRaw} onChange={(e) => setFormData({ ...formData, profileRaw: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lien original (optionnel)</label>
                    <input type="url" value={formData.originalLink} onChange={(e) => setFormData({ ...formData, originalLink: e.target.value })} placeholder="https://www.linkedin.com/..." className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publication en cours...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        Publier immédiatement sur le site
                      </>
                    )}
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

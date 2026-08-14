import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobOffer, JobCategory, MoroccanCity, ContractType } from '../types';
import { getCompanyJobs, upsertCompanyProfile } from '../services/companyService';
import { createJobOffer, updateJobOffer, deleteJobOffer, toggleJobActive } from '../services/jobService';
import { uploadLogo } from '../services/storageService';
import { Building2, PlusCircle, Briefcase, Settings, Loader2, Save, Upload, Trash2, Edit, AlertTriangle, BadgeCheck, XCircle, Clock, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

interface EntrepriseDashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const EntrepriseDashboardPage: React.FC<EntrepriseDashboardPageProps> = ({ onNavigate }) => {
  const { user, company, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'my-jobs' | 'new-job'>('my-jobs');
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Profile Form
  const [companyName, setCompanyName] = useState(company?.companyName || '');
  const [description, setDescription] = useState(company?.description || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [secteur, setSecteur] = useState(company?.secteur || 'Informatique');
  const [ville, setVille] = useState(company?.ville || 'Casablanca');
  const [contactPerson, setContactPerson] = useState(company?.contactPerson || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [workforceSize, setWorkforceSize] = useState(company?.workforceSize || '11-50');
  const [iceNumber, setIceNumber] = useState(company?.iceNumber || '');
  const [linkedinUrl, setLinkedinUrl] = useState(company?.linkedinUrl || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // New Job Form
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'RH' as JobCategory,
    city: 'Casablanca' as MoroccanCity,
    contractType: 'CDI' as ContractType,
    experienceLevel: 'Débutant (0-1 an)' as JobOffer['experienceLevel'],
    contactEmail: '',
    description: '',
    missionsRaw: '',
    profileRaw: ''
  });

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || '');
      setDescription(company.description || '');
      setPhone(company.phone || '');
      setSecteur(company.secteur || 'Informatique');
      setVille(company.ville || 'Casablanca');
      setContactPerson(company.contactPerson || '');
      setWebsite(company.website || '');
      setWorkforceSize(company.workforceSize || '11-50');
      setIceNumber(company.iceNumber || '');
      setLinkedinUrl(company.linkedinUrl || '');
    }
  }, [company]);

  useEffect(() => {
    if (user && activeTab === 'my-jobs') {
      loadJobs();
    }
  }, [user, activeTab]);

  const loadJobs = async () => {
    if (!user) return;
    setIsLoadingJobs(true);
    try {
      const companyJobs = await getCompanyJobs(user.id);
      setJobs(companyJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      let logoUrl = company?.logoUrl;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }
      await upsertCompanyProfile(user.id, {
        companyName,
        description,
        logoUrl,
        phone,
        secteur,
        ville,
        contactPerson,
        website,
        workforceSize,
        iceNumber,
        linkedinUrl
      });
      await refreshProfile();
      setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setLogoFile(null);
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !company) return;

    if (company.verificationStatus !== 'verified') {
      alert("Votre compte est en cours de vérification. Vous pourrez publier des offres une fois votre compte validé.");
      return;
    }

    setIsSubmittingJob(true);

    try {
      const initials = company.companyName.trim().substring(0, 2).toUpperCase() || 'CP';
      const missions = formData.missionsRaw.split('\n').map(m => m.trim()).filter(Boolean);
      const profileInfo = formData.profileRaw.split('\n').map(p => p.trim()).filter(Boolean);

      const created = await createJobOffer({
        title: formData.title,
        company: company.companyName,
        companyInitials: initials,
        companyLogo: company.logoUrl,
        category: formData.category,
        city: formData.city,
        contractType: formData.contractType,
        experienceLevel: formData.experienceLevel,
        contactEmail: formData.contactEmail,
        salaryRange: 'A négocier',
        description: formData.description,
        missions: missions.length > 0 ? missions : ['Missions définies lors de l\'entretien.'],
        profile: profileInfo.length > 0 ? profileInfo : ['Sérieux et rigueur.'],
        featured: false,
        isActive: true,
        companyId: user.id,
        domaine: formData.category,
        status: 'pending'
      });

      setJobs([created, ...jobs]);
      setActiveTab('my-jobs');
      setFormData({
        title: '', category: 'RH', city: 'Casablanca', contractType: 'CDI',
        experienceLevel: 'Débutant (0-1 an)', contactEmail: '', description: '',
        missionsRaw: '', profileRaw: ''
      });
      alert('Offre créée et en attente d\'approbation par l\'administrateur.');
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleToggleActive = async (job: JobOffer) => {
    try {
      await toggleJobActive(job.id, !job.isActive);
      setJobs(jobs.map(j => j.id === job.id ? { ...j, isActive: !job.isActive } : j));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'activation/désactivation.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
    try {
      await deleteJobOffer(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    }
  };

  const isVerified = company?.verificationStatus === 'verified';
  const isRejected = company?.verificationStatus === 'rejected';
  const isPending = !isVerified && !isRejected;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Verification Status Alert Banner */}
        {isPending && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">Compte en cours de vérification</h3>
                <p className="text-sm text-amber-700">
                  Votre compte est en cours de vérification. Vous pourrez publier des offres une fois votre compte validé par l'équipe Aibra Academy.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Compléter mon profil
            </button>
          </div>
        )}

        {isRejected && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900">Compte non validé</h3>
              <p className="text-sm text-red-700">
                Raison : {company?.rejectionReason || "Informations insuffisantes ou non conformes."}. Veuillez mettre à jour votre profil ci-dessous ou contacter le support.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-200">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-serif text-slate-900">{company?.companyName}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    Vérifiée
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{company?.secteur || 'Entreprise'} • {company?.ville || 'Maroc'}</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('my-jobs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'my-jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Briefcase className="w-4 h-4" />
              Mes Offres
            </button>
            <button
              onClick={() => setActiveTab('new-job')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'new-job' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PlusCircle className="w-4 h-4" />
              Publier
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Settings className="w-4 h-4" />
              Profil
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          
          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Complétion du Profil Entreprise</h2>
                <p className="text-sm text-slate-500">
                  Renseignez votre numéro ICE et vos coordonnées pour accélérer la vérification de votre compte.
                </p>
              </div>

              {profileMessage && (
                <div className={`px-4 py-3 rounded-xl text-sm ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nom de l'entreprise *</label>
                    <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nom du contact RH *</label>
                    <input type="text" required value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" placeholder="Ex: Karima Benali" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Téléphone de contact</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" placeholder="+212 6XX XXX XXX" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Secteur d'activité</label>
                    <select value={secteur} onChange={e => setSecteur(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none">
                      {['Informatique', 'RH', 'Comptabilité', 'Marketing', 'Mécanique', 'Administration', 'Agriculture', 'Autre'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Ville / Siège social</label>
                    <select value={ville} onChange={e => setVille(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none">
                      {['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Oujda', 'Meknès', 'El Jadida', 'Kénitra', 'Tétouan', 'Nador', 'Autre ville'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-semibold text-emerald-800">Numéro ICE (Identifiant Commun)</label>
                    <input type="text" value={iceNumber} onChange={e => setIceNumber(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-emerald-300 bg-emerald-50/30 rounded-xl focus:ring-emerald-500 outline-none" placeholder="Ex: 001524896000034" />
                    <span className="text-xs text-slate-500">Utilisé pour la vérification rapide par l'administration.</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Site Web officiel</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" placeholder="https://www.exemple.ma" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Taille de l'effectif</label>
                    <select value={workforceSize} onChange={e => setWorkforceSize(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none">
                      <option value="1-10">1 à 10 employés</option>
                      <option value="11-50">11 à 50 employés</option>
                      <option value="51-200">51 à 200 employés</option>
                      <option value="201-500">201 à 500 employés</option>
                      <option value="500+">Plus de 500 employés</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Page LinkedIn</label>
                    <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" placeholder="https://www.linkedin.com/company/..." />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Description & Présentation de l'entreprise</label>
                    <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" placeholder="Présentez votre entreprise, votre activité et vos valeurs..." />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo de l'entreprise</label>
                    <div className="flex items-center gap-4">
                      <input type="file" id="logo" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                      <label htmlFor="logo" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        {logoFile ? logoFile.name : 'Téléverser un logo'}
                      </label>
                      {company?.logoUrl && !logoFile && <span className="text-xs text-slate-500">Logo actuel enregistré</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button type="submit" disabled={isSavingProfile} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm">
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'my-jobs' && (
            <div>
              <div className="mb-6 border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Vos Offres Publiées</h2>
                  <p className="text-sm text-slate-500">Gérez vos annonces et suivez leur statut de modération.</p>
                </div>
                {isVerified && (
                  <button
                    onClick={() => setActiveTab('new-job')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Publier une offre
                  </button>
                )}
              </div>
              {isLoadingJobs ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed rounded-xl border-slate-300">
                  Vous n'avez publié aucune offre pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors bg-slate-50">
                      <div className="flex flex-col gap-1 mb-4 sm:mb-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900">{job.title}</h3>
                          <StatusBadge status={job.status} />
                          {!job.isActive && <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">Désactivée</span>}
                        </div>
                        <p className="text-sm text-slate-500">{job.city} • {job.contractType}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleToggleActive(job)}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-100"
                        >
                          {job.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new-job' && (
            <div className="max-w-2xl mx-auto">
              {!isVerified ? (
                <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900 font-serif">Vérification de compte requise</h3>
                  <p className="text-sm text-amber-700 max-w-md mx-auto">
                    Votre compte entreprise est actuellement en cours de vérification. Vous pourrez publier des offres d'emploi une fois votre compte validé par l'équipe Aibra Academy.
                  </p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all text-sm shadow-sm"
                  >
                    Compléter les informations de mon entreprise
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Publier une Nouvelle Offre</h2>
                  <form onSubmit={handleSubmitJob} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Titre de l'offre</label>
                      <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Domaine/Catégorie</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as JobCategory})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none">
                          {['RH', 'Comptabilité', 'Mécanique', 'Administration', 'Informatique', 'Agriculture', 'Marketing', 'Autre'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Ville</label>
                        <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value as MoroccanCity})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none">
                          {['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Oujda', 'Meknès', 'El Jadida', 'Kénitra', 'Tétouan', 'Nador', 'Autre ville'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Contrat</label>
                        <select value={formData.contractType} onChange={e => setFormData({...formData, contractType: e.target.value as ContractType})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none">
                          {['CDI', 'CDD', 'Stage / PFE', 'Alternance', 'Intérim'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Niveau d'expérience</label>
                        <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value as any})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none">
                          {['Débutant (0-1 an)', '1 à 3 ans', '3 à 5 ans', 'Stage PFE', 'Tous niveaux'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Email de contact pour CV</label>
                      <input type="email" required value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Description générale</label>
                      <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Missions (1 par ligne)</label>
                      <textarea rows={4} value={formData.missionsRaw} onChange={e => setFormData({...formData, missionsRaw: e.target.value})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Profil recherché (1 critère par ligne)</label>
                      <textarea rows={4} value={formData.profileRaw} onChange={e => setFormData({...formData, profileRaw: e.target.value})} className="mt-1 block w-full py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-emerald-500 outline-none" />
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200">
                      <button type="submit" disabled={isSubmittingJob} className="w-full flex justify-center py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
                        {isSubmittingJob ? <Loader2 className="w-5 h-5 animate-spin" /> : "Soumettre l'offre (En attente de validation)"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

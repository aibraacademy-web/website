import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobOffer } from '../types';
import { fetchJobs } from '../services/jobService';
import { getCVSignedUrl, uploadCV } from '../services/storageService';
import { upsertCandidateProfile } from '../services/candidateService';
import { JobCard } from '../components/JobCard';
import { User, FileText, Briefcase, Upload, Loader2, Save } from 'lucide-react';

interface CandidateDashboardPageProps {
  onNavigate: (tab: string) => void;
  savedJobIds: string[];
  onToggleSaveJob: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
}

export const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = ({ 
  onNavigate, 
  savedJobIds, 
  onToggleSaveJob,
  onOpenMailModal,
  onSelectJob
}) => {
  const { user, candidate, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'recommended' | 'all'>('recommended');
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState(candidate?.fullName || '');
  const [phone, setPhone] = useState(candidate?.phone || '');
  const [domaine, setDomaine] = useState(candidate?.domaineSouhaite || 'RH');
  const [niveauEtude, setNiveauEtude] = useState(candidate?.niveauEtude || 'Bac+3');
  const [ville, setVille] = useState(candidate?.ville || 'Casablanca');
  const [skills, setSkills] = useState(candidate?.skills || '');
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (activeTab !== 'profile') {
      loadJobs();
    }
  }, [activeTab]);

  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const allJobs = await fetchJobs(); // Already filters for approved and active
      setJobs(allJobs);
    } catch (error) {
      console.error('Failed to load jobs', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
      let cvUrl = candidate?.cvUrl;
      if (cvFile) {
        cvUrl = await uploadCV(cvFile, user.id);
      }

      await upsertCandidateProfile(user.id, {
        fullName,
        phone,
        domaineSouhaite: domaine,
        niveauEtude,
        ville,
        skills,
        cvUrl
      });
      
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
      setCvFile(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewCV = async () => {
    if (!candidate?.cvUrl) return;
    const url = await getCVSignedUrl(candidate.cvUrl);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert("Impossible de charger le CV.");
    }
  };

  const recommendedJobs = jobs.filter(job => 
    !candidate?.domaineSouhaite || 
    job.category.toLowerCase() === candidate.domaineSouhaite.toLowerCase() ||
    job.domaine?.toLowerCase() === candidate.domaineSouhaite.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900">Espace Candidat</h1>
              <p className="text-sm text-slate-500">Bienvenue, {candidate?.fullName}</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'recommended' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Briefcase className="w-4 h-4" />
              Recommandées
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Briefcase className="w-4 h-4" />
              Toutes les offres
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <User className="w-4 h-4" />
              Mon Profil
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Informations personnelles</h2>
              
              {message && (
                <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Nom & Prénom</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Ville</label>
                    <input type="text" value={ville} onChange={e => setVille(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Domaine souhaité</label>
                    <select value={domaine} onChange={e => setDomaine(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="RH">RH</option>
                      <option value="Comptabilité">Comptabilité</option>
                      <option value="Informatique">Informatique</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Niveau d'étude</label>
                    <select value={niveauEtude} onChange={e => setNiveauEtude(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="Bac">Bac</option>
                      <option value="Bac+2">Bac+2</option>
                      <option value="Bac+3">Bac+3</option>
                      <option value="Bac+5">Bac+5</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Compétences (séparées par des virgules)</label>
                    <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Curriculum Vitae (CV)</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                      {candidate?.cvUrl ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <FileText className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">CV actuel enregistré</p>
                            <button type="button" onClick={handleViewCV} className="text-xs text-emerald-600 hover:underline">Voir le document</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Aucun CV uploadé.</p>
                      )}
                      
                      <div className="sm:ml-auto">
                        <input type="file" id="cv-update" accept="application/pdf" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                        <label htmlFor="cv-update" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          {cvFile ? cvFile.name : 'Remplacer le CV'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          )}

          {(activeTab === 'recommended' || activeTab === 'all') && (
            <div>
              <div className="mb-6 border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {activeTab === 'recommended' ? 'Offres recommandées pour vous' : 'Toutes les offres disponibles'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {activeTab === 'recommended' 
                    ? `Basé sur votre domaine souhaité : ${candidate?.domaineSouhaite || 'Non défini'}` 
                    : 'Explorez toutes nos offres approuvées.'}
                </p>
              </div>

              {isLoadingJobs ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <span>Recherche des offres...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(activeTab === 'recommended' ? recommendedJobs : jobs).length > 0 ? (
                    (activeTab === 'recommended' ? recommendedJobs : jobs).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.includes(job.id)}
                        onToggleSave={() => onToggleSaveJob(job.id)}
                        onOpenMailModal={onOpenMailModal}
                        onSelectJob={onSelectJob}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      Aucune offre ne correspond à cette vue pour le moment.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

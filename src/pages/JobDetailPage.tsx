import React, { useState } from 'react';
import { JobOffer } from '../types';
import { SimilarJobs } from '../components/SimilarJobs';
import { cleanDescription } from '../services/jobParserService';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Bookmark, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Send, 
  ExternalLink, 
  ShieldCheck, 
  Award, 
  Coins, 
  FileText,
  CheckCircle2,
  Link2,
  BadgeCheck,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

interface JobDetailPageProps {
  job: JobOffer;
  allJobs: JobOffer[];
  savedJobIds: string[];
  onToggleSave: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
  onBack: () => void;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({
  job,
  allJobs,
  savedJobIds,
  onToggleSave,
  onOpenMailModal,
  onSelectJob,
  onBack
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Assembler la description complète avec rétrocompatibilité pour les offres existantes
  const getFullDescription = (): string => {
    let base = cleanDescription(job.description || '', job.company);
    
    // Si l'offre ancienne a déjà des champs missions / profil séparés et qu'ils ne sont pas déjà inclus dans description
    const hasMissionsInDesc = base.toLowerCase().includes('mission');
    const parts: string[] = [];
    
    if (base) {
      parts.push(base);
    }
    
    if (!hasMissionsInDesc) {
      if (job.missions && job.missions.length > 0) {
        parts.push(`Missions & Responsabilités :\n${job.missions.map(m => `• ${m}`).join('\n')}`);
      }
      if (job.profile && job.profile.length > 0) {
        parts.push(`Profil recherché :\n${job.profile.map(p => `• ${p}`).join('\n')}`);
      }
      if (job.benefits && job.benefits.length > 0) {
        parts.push(`Avantages & Ce que nous offrons :\n${job.benefits.map(b => `• ${b}`).join('\n')}`);
      }
    }
    
    return parts.join('\n\n').trim();
  };

  const fullDescriptionText = getFullDescription();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/offres/${job.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmail = () => {
    if (!job.contactEmail) return;
    navigator.clipboard.writeText(job.contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleShare = () => {
    const companyText = job.company || 'une entreprise confidentielle';
    const text = encodeURIComponent(`Découvre cette offre d'emploi sur Aibra Academy : ${job.title} chez ${companyText} à ${job.city}.\nContact email: ${job.contactEmail}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-bold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des offres</span>
        </button>

        {/* Main Job Detail Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg border border-emerald-400/30 font-serif overflow-hidden">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" />
                  ) : (
                    job.companyInitials
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {job.category || 'Général'}
                    </span>
                    <span className="bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                      {job.contractType || 'Contrat non précisé'}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-3xl font-extrabold text-white font-serif leading-tight">
                    {job.title}
                  </h1>

                  <div className="text-sm font-semibold text-slate-300 flex flex-wrap items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{job.company || 'Entreprise confidentielle'}</span>
                      {job.companyIsVerified && job.company && (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Entreprise vérifiée
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Top */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onToggleSave(job.id)}
                  className={`p-3 rounded-xl border transition-all ${
                    isSaved
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/20'
                  }`}
                  title={isSaved ? "Retirer des favoris" : "Enregistrer l'offre"}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 border border-white/20 transition-all"
                  title="Partager sur WhatsApp"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

          {/* Main Body Grid */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Main Content: 3 Structured Blocks */}
            <div className="lg:col-span-2 space-y-8 text-slate-800">
              
              {/* ──────────────────────────────────────────────────────────── */}
              {/* BLOC 1: Résumé du poste (En haut)                           */}
              {/* ──────────────────────────────────────────────────────────── */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-extrabold text-slate-900 font-serif">
                    Résumé du poste
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {/* Secteur */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secteur</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{job.category || 'Non spécifié'}</p>
                    </div>
                  </div>

                  {/* Ville */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ville</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{job.city || 'Maroc'}</p>
                    </div>
                  </div>

                  {/* Contrat */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type de contrat</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{job.contractType || 'Non spécifié'}</p>
                    </div>
                  </div>

                  {/* Expérience */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expérience</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{job.experienceLevel || 'Tous niveaux'}</p>
                    </div>
                  </div>

                  {/* Salaire */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <Coins className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salaire</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{job.salaryRange || 'A négocier'}</p>
                    </div>
                  </div>

                  {/* Date de publication */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Publié le</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{job.publishedAt || 'Récemment'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────── */}
              {/* BLOC 2: Entreprise (À côté / en dessous du résumé)           */}
              {/* ──────────────────────────────────────────────────────────── */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-extrabold text-slate-900 font-serif">
                    Entreprise
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" />
                      ) : (
                        job.companyInitials || 'AA'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-slate-900">{job.company || 'Entreprise confidentielle'}</p>
                        {job.companyIsVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            <BadgeCheck className="w-3 h-3 text-emerald-600" />
                            Vérifiée
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Secteur : <span className="font-semibold text-slate-700">{job.category || 'Non spécifié'}</span>
                      </p>
                    </div>
                  </div>

                  {job.originalLink && (
                    <a
                      href={job.originalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold text-slate-700 transition-all shadow-2xs shrink-0"
                    >
                      <span>Lien de l'annonce</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────── */}
              {/* BLOC 3: Détails de l'annonce (Texte complet structuré)       */}
              {/* ──────────────────────────────────────────────────────────── */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-extrabold text-slate-900 font-serif">
                    Détails de l'annonce
                  </h2>
                </div>

                {fullDescriptionText ? (
                  <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                    {fullDescriptionText}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Aucune description détaillée fournie pour cette offre.
                  </p>
                )}
              </div>

            </div>

            {/* Right Recruiter & Apply Box */}
            <div className="lg:col-span-1 space-y-6">
              
              {job.contactEmail ? (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white space-y-5 shadow-lg border border-slate-800">
                  
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                      Postuler maintenant
                    </span>
                    <h3 className="text-lg font-bold font-serif text-white mt-2">
                      Envoyer votre candidature
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Directement par email au service recrutement.
                    </p>
                  </div>

                  {/* Email Box */}
                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-400">Email de contact :</p>
                    <p className="text-sm font-bold text-emerald-300 font-mono break-all">
                      {job.contactEmail}
                    </p>
                    
                    <button
                      onClick={handleCopyEmail}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Adresse email copiée !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copier l'adresse email</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={() => onOpenMailModal(job)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer ma candidature</span>
                  </button>

                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gratuit sans frais de dossier pour les candidats</span>
                  </div>

                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-center shadow-sm">
                  <h3 className="text-base font-bold mb-2">Comment postuler ?</h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {job.originalLink 
                      ? "Veuillez consulter le lien vers l'annonce officielle pour postuler directement." 
                      : "Les modalités de candidature ne sont pas communiquées par l'entreprise."}
                  </p>
                  {job.originalLink && (
                    <a
                      href={job.originalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                    >
                      <span>Voir l'offre officielle</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Share Box */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Partager cette offre
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedLink ? 'Copié !' : 'Copier lien'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Similar Jobs Suggestions */}
        <SimilarJobs
          currentJob={job}
          allJobs={allJobs}
          savedJobIds={savedJobIds}
          onToggleSave={onToggleSave}
          onOpenMailModal={onOpenMailModal}
          onSelectJob={onSelectJob}
        />

      </div>
    </div>
  );
};

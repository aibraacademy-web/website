import React, { useState } from 'react';
import { JobOffer } from '../types';
import { SimilarJobs } from '../components/SimilarJobs';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Mail, 
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
  BadgeCheck
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

  const isSaved = savedJobIds.includes(job.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/offres/${job.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(job.contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Découvre cette offre d'emploi sur Aibra Academy : ${job.title} chez ${job.company} à ${job.city}.\nContact email: ${job.contactEmail}`);
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
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg border border-emerald-400/30 font-serif">
                  {job.companyInitials}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {job.category}
                    </span>
                    <span className="bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                      {job.contractType}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-3xl font-extrabold text-white font-serif leading-tight">
                    {job.title}
                  </h1>

                  <p className="text-sm font-semibold text-slate-300 flex flex-wrap items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>{job.company}</span>
                    {job.companyIsVerified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Entreprise vérifiée
                      </span>
                    )}
                  </p>
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
                  onClick={handleWhatsAppShare}
                  className="p-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 border border-white/20 transition-all"
                  title="Partager sur WhatsApp"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Sub-meta Strip */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Ville</p>
                  <p className="font-bold text-white">{job.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Expérience</p>
                  <p className="font-bold text-white">{job.experienceLevel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Rémunération</p>
                  <p className="font-bold text-white">{job.salaryRange || 'A négocier'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Publié le</p>
                  <p className="font-bold text-white">{job.publishedAt}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Main Body Grid */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-8 text-slate-800">
              
              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-lg font-extrabold text-slate-900 font-serif border-l-4 border-emerald-600 pl-3">
                  Présentation de l'offre
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Missions */}
              {job.missions && job.missions.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold text-slate-900 font-serif border-l-4 border-emerald-600 pl-3">
                    Missions & Responsabilités
                  </h2>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {job.missions.map((mission, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{mission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Profil recherché */}
              {job.profile && job.profile.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold text-slate-900 font-serif border-l-4 border-emerald-600 pl-3">
                    Profil recherché & Compétences
                  </h2>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {job.profile.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Original link if available */}
              {job.originalLink && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
                  <span>Source originale / Site entreprise :</span>
                  <a 
                    href={job.originalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Lien vers l'annonce officielle</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>

            {/* Right Recruiter Box */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Primary Application Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white space-y-5 shadow-lg border border-slate-800">
                
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                    Postuler maintenant
                  </span>
                  <h3 className="text-lg font-bold font-serif text-white mt-2">
                    Envoyer votre candidature
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Directement par email au service recrutement d'Aibra Academy.
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
                  <span>Gratuit sans frais de dossier pour les étudiants & diplômés</span>
                </div>

              </div>

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
                    onClick={handleWhatsAppShare}
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

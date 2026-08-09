import React, { useState } from 'react';
import { JobOffer } from '../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Mail, 
  Bookmark, 
  ArrowRight, 
  Briefcase, 
  CheckCircle2,
  Link2
} from 'lucide-react';

interface JobCardProps {
  job: JobOffer;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
  layout?: 'grid' | 'list';
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onToggleSave,
  onOpenMailModal,
  onSelectJob,
  layout = 'grid'
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/offres/${job.id}`);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  };

  // Contract badge styling
  const getContractBadge = (contract: string) => {
    switch (contract.toLowerCase()) {
      case 'cdi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'cdd':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'stage / pfe':
      case 'stage':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
      case 'alternance':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
    }
  };

  return (
    <div className={`group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
      job.featured ? 'ring-2 ring-emerald-500/30 bg-gradient-to-b from-emerald-50/20 to-white' : ''
    }`}>
      
      {job.featured && (
        <div className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 tracking-wider uppercase flex items-center justify-between">
          <span>Offre à la Une</span>
          <span>Aibra Verified</span>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Company Avatar / Logo */}
            {job.companyLogo ? (
              <img 
                src={job.companyLogo} 
                alt={job.company} 
                className="w-12 h-12 rounded-xl object-contain bg-white shrink-0 shadow-sm border border-slate-200 p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm border border-slate-800 font-serif">
                {job.companyInitials}
              </div>
            )}

            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{job.company}</span>
              </h4>
              <p className="text-xs text-emerald-700 font-medium">
                {job.category}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleSave(job.id)}
            className={`p-2 rounded-xl transition-colors ${
              isSaved
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            title={isSaved ? "Retirer des favoris" : "Enregistrer l'offre"}
            aria-label="Enregistrer l'offre"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Job Title */}
        <div>
          <button 
            onClick={() => onSelectJob(job)}
            className="text-left font-bold text-slate-900 text-base sm:text-lg leading-snug hover:text-emerald-600 transition-colors line-clamp-2 font-serif group-hover:text-emerald-700"
          >
            {job.title}
          </button>
        </div>

        {/* Info Badges & Location */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-md text-xs border ${getContractBadge(job.contractType)}`}>
            {job.contractType}
          </span>

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{job.city}</span>
          </span>

          <span className="flex items-center gap-1 text-slate-500 font-medium ml-auto text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.publishedAt}</span>
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        
        {/* Prominent Direct Email Mailto Icon Button */}
        <button
          onClick={() => onOpenMailModal(job)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 group/btn"
          title={`Postuler directement par email (${job.contactEmail})`}
        >
          <Mail className="w-4 h-4 text-emerald-100 group-hover/btn:scale-110 transition-transform" />
          <span>Postuler par Email</span>
        </button>

        {/* View Details Button */}
        <button
          onClick={() => onSelectJob(job)}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors"
        >
          <span>Détails</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors"
          title="Copier le lien de l'offre"
        >
          <Link2 className={`w-4 h-4 ${copiedLink ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span>{copiedLink ? 'Copié !' : 'Copier lien'}</span>
        </button>

      </div>

    </div>
  );
};

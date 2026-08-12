import React, { useState } from 'react';
import { JobOffer } from '../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Mail, 
  Bookmark, 
  ArrowRight, 
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

  return (
    <div className={`group relative bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden`}>

      <div className="p-5 space-y-3">
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Company Avatar / Logo */}
            {job.companyLogo ? (
              <img 
                src={job.companyLogo} 
                alt={job.company} 
                className="w-11 h-11 rounded-lg object-contain bg-white shrink-0 border border-slate-200 p-1"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {job.companyInitials}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 truncate">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{job.company}</span>
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {job.category}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleSave(job.id)}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              isSaved
                ? 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isSaved ? "Retirer des favoris" : "Enregistrer l'offre"}
            aria-label="Enregistrer l'offre"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Job Title */}
        <button 
          onClick={() => onSelectJob(job)}
          className="text-left font-semibold text-slate-900 text-base leading-snug hover:text-emerald-700 transition-colors line-clamp-2 w-full"
        >
          {job.title}
        </button>

        {/* Info: Contract + Location + Date */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
            {job.contractType}
          </span>

          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            {job.city}
          </span>

          <span className="flex items-center gap-1 text-slate-400 font-medium ml-auto text-[11px]">
            <Clock className="w-3 h-3" />
            {job.publishedAt}
          </span>
        </div>

      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        
        <button
          onClick={() => onOpenMailModal(job)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
          title={`Postuler directement par email (${job.contactEmail})`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Postuler</span>
        </button>

        <button
          onClick={() => onSelectJob(job)}
          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-emerald-700 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span>Voir l'offre</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleCopyLink}
          className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Copier le lien de l'offre"
          aria-label="Copier le lien"
        >
          <Link2 className={`w-3.5 h-3.5 ${copiedLink ? 'text-emerald-600' : ''}`} />
        </button>

      </div>

    </div>
  );
};

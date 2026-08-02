import React from 'react';
import { JobOffer } from '../types';
import { JobCard } from './JobCard';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';

interface SavedJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedJobs: JobOffer[];
  onToggleSave: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
}

export const SavedJobsModal: React.FC<SavedJobsModalProps> = ({
  isOpen,
  onClose,
  savedJobs,
  onToggleSave,
  onOpenMailModal,
  onSelectJob
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            <h3 className="text-lg font-bold font-serif text-white">
              Vos offres enregistrées ({savedJobs.length})
            </h3>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 p-1.5 rounded-full transition-all"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {savedJobs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Aucune offre enregistrée pour le moment
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Vous pouvez cliquer sur le petit marque-page sur n'importe quelle offre pour la retrouver facilement ici et postuler plus tard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                  onOpenMailModal={(j) => {
                    onClose();
                    onOpenMailModal(j);
                  }}
                  onSelectJob={(j) => {
                    onClose();
                    onSelectJob(j);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

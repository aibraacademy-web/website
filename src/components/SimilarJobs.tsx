import React from 'react';
import { JobOffer } from '../types';
import { JobCard } from './JobCard';
import { Sparkles } from 'lucide-react';

interface SimilarJobsProps {
  currentJob: JobOffer;
  allJobs: JobOffer[];
  savedJobIds: string[];
  onToggleSave: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
}

export const SimilarJobs: React.FC<SimilarJobsProps> = ({
  currentJob,
  allJobs,
  savedJobIds,
  onToggleSave,
  onOpenMailModal,
  onSelectJob
}) => {
  // Filter similar jobs by same category or city excluding current job
  const similar = allJobs
    .filter(j => j.id !== currentJob.id && (j.category === currentJob.category || j.city === currentJob.city))
    .slice(0, 3);

  if (similar.length === 0) return null;

  return (
    <section className="pt-12 mt-12 border-t border-slate-200">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pour vous</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
          Suggestions d'offres similaires
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          D'autres opportunités dans le secteur {currentJob.category} ou à {currentJob.city}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similar.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobIds.includes(job.id)}
            onToggleSave={onToggleSave}
            onOpenMailModal={onOpenMailModal}
            onSelectJob={onSelectJob}
          />
        ))}
      </div>
    </section>
  );
};

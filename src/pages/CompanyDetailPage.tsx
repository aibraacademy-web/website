import React, { useEffect, useState } from 'react';
import { Company, JobOffer, CompanyCategory } from '../types';
import { getCompanyBySlug } from '../services/companyService';
import { Breadcrumb } from '../components/Breadcrumb';
import { JobCard } from '../components/JobCard';
import { getCompanyCategoryMeta } from '../lib/companyCategories';
import { Building2, MapPin, Globe, SearchX, ArrowRight } from 'lucide-react';

interface CompanyDetailPageProps {
  slug: string;
  jobs: JobOffer[];
  savedJobIds: string[];
  onToggleSave: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
  onNavigateHome: () => void;
  onSelectCategory: (category: CompanyCategory) => void;
}

export const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({
  slug,
  jobs,
  savedJobIds,
  onToggleSave,
  onOpenMailModal,
  onSelectJob,
  onNavigateHome,
  onSelectCategory
}) => {
  const [company, setCompany] = useState<Company | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setCompany(undefined);
    getCompanyBySlug(slug).then(result => {
      if (!cancelled) setCompany(result);
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (company === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <SearchX className="w-10 h-10 text-slate-300" />
        <p className="text-slate-600 font-semibold">Institution introuvable.</p>
        <button
          onClick={onNavigateHome}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold underline"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const meta = getCompanyCategoryMeta(company.category);
  const companyJobs = jobs.filter(j => j.companyId === company.id && j.isActive && j.status === 'approved');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Accueil', onClick: onNavigateHome },
              ...(meta ? [{ label: meta.shortLabel, onClick: () => onSelectCategory(meta.value) }] : []),
              { label: company.companyName },
            ]}
          />

          <div className="flex items-center gap-4 mt-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-700 p-1.5 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
                {company.companyName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{company.companyName}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                {company.ville && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" />{company.ville}</span>
                )}
                {company.secteur && <span>{company.secteur}</span>}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="text-slate-300 text-sm mt-4 max-w-2xl leading-relaxed">{company.description}</p>
          )}
        </div>
      </div>

      {/* Job offers */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-lg font-bold text-slate-900 mb-5">
          Offres actives {companyJobs.length > 0 && `(${companyJobs.length})`}
        </h2>

        {companyJobs.length === 0 ? (
          <div className="text-center py-14 px-6 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">
              Aucune offre active pour le moment chez {company.companyName}.
            </p>
            <p className="text-slate-500 text-sm mt-1 mb-5">
              Revenez bientôt, ou explorez d'autres institutions{meta ? ` de la catégorie "${meta.shortLabel}"` : ''}.
            </p>
            {meta && (
              <button
                onClick={() => onSelectCategory(meta.value)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                <span>Voir d'autres institutions dans {meta.shortLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companyJobs.map(job => (
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
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Company, JobOffer, CompanyCategory } from '../types';
import { Breadcrumb } from '../components/Breadcrumb';
import { getCompanyCategoryMeta } from '../lib/companyCategories';
import { Building2, ArrowRight, ArrowUpRight } from 'lucide-react';

interface CategoryPageProps {
  category: CompanyCategory;
  jobs: JobOffer[];
  companies: Company[];
  isLoadingCompanies: boolean;
  onNavigateHome: () => void;
  onSelectCompany: (slug: string) => void;
  onViewAllOffers: (category: CompanyCategory) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  jobs,
  companies,
  isLoadingCompanies,
  onNavigateHome,
  onSelectCompany,
  onViewAllOffers
}) => {
  const meta = getCompanyCategoryMeta(category);

  const activeOfferCount = (companyId: string) =>
    jobs.filter(j => j.companyId === companyId && j.isActive && j.status === 'approved').length;

  const categoryCompanies = companies
    .filter(c => c.category === category)
    .map(c => ({ company: c, count: activeOfferCount(c.id) }))
    .sort((a, b) => b.count - a.count);

  const totalOffers = categoryCompanies.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Accueil', onClick: onNavigateHome },
              { label: meta?.shortLabel || category },
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">
            {meta?.label || category}
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            {meta?.description}
          </p>

          {totalOffers > 0 && (
            <button
              onClick={() => onViewAllOffers(category)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              <span>Voir les {totalOffers} offre{totalOffers > 1 ? 's' : ''} de cette catégorie</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Companies grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoadingCompanies ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categoryCompanies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune institution enregistrée dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryCompanies.map(({ company, count }) => {
              const isEmpty = count === 0;
              return (
                <button
                  key={company.id}
                  onClick={() => company.slug && onSelectCompany(company.slug)}
                  disabled={!company.slug}
                  className="group text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.companyName}
                        className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">
                        {company.companyName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {company.companyName}
                      </h3>
                      {company.ville && (
                        <p className="text-xs text-slate-500 truncate">{company.ville}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isEmpty ? (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        Bientôt disponible
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {count} offre{count > 1 ? 's' : ''}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

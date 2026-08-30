import React, { useState, useEffect } from 'react';
import { JobOffer, StatisticsData, CompanyCategory, NewsPost } from '../types';
import { HeroSection } from '../components/HeroSection';
import { CounterSection } from '../components/CounterSection';
import { PopularCategories } from '../components/PopularCategories';
import { JobCard } from '../components/JobCard';
import { NewsCard } from '../components/NewsCard';
import { COMPANY_CATEGORIES } from '../lib/companyCategories';
import { fetchActiveNewsPosts } from '../services/newsService';
import {
  ArrowRight,
  GraduationCap,
  Briefcase,
  Landmark
} from 'lucide-react';

interface HomePageProps {
  jobs: JobOffer[];
  stats: StatisticsData;
  savedJobIds: string[];
  onToggleSave: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
  onNavigate: (tab: string, category?: string, city?: string) => void;
  onSelectCategory: (category: CompanyCategory) => void;
  onSearch: (keyword: string, city: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  jobs,
  stats,
  savedJobIds,
  onToggleSave,
  onOpenMailModal,
  onSelectJob,
  onNavigate,
  onSelectCategory,
  onSearch
}) => {
  // Compute category counts
  const categoryCounts: Record<string, number> = {};
  jobs.forEach(j => {
    categoryCounts[j.category] = (categoryCounts[j.category] || 0) + 1;
  });

  // Latest 6 jobs for home preview
  const recentJobs = jobs.slice(0, 6);

  // Fetch recent news
  const [recentNews, setRecentNews] = useState<NewsPost[]>([]);
  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await fetchActiveNewsPosts();
        setRecentNews(news.slice(0, 3)); // Only show top 3 on home
      } catch (e) {
        console.error("Error loading news for home", e);
      }
    };
    loadNews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. Hero Section (search prominently displayed) */}
      <HeroSection 
        onSearch={(kw, c) => {
          onSearch(kw, c);
          onNavigate('jobs');
        }}
        onExplore={() => onNavigate('jobs')}
      />

      {/* 2. Dynamic Counters */}
      <CounterSection stats={stats} />

      {/* 2.5 Actualités & Informations */}
      {recentNews.length > 0 && (
        <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                  📢 Actualités & Informations
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Restez informé des annonces, inscriptions et conseils carrière.
                </p>
              </div>

              <button
                onClick={() => onNavigate('actualites')}
                className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm shrink-0"
              >
                <span>Voir toutes les actualités</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex overflow-x-auto pb-6 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 snap-x snap-mandatory">
              {recentNews.map((post) => (
                <div key={post.id} className="min-w-[85vw] sm:min-w-0 snap-center shrink-0 flex">
                  <NewsCard news={post} onClick={(id) => onNavigate('actualite-detail', id)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Dernières Offres Publiées */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Dernières offres d'emploi & stages
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Postulez directement par email sans créer de compte.
              </p>
            </div>

            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-700 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm shrink-0"
            >
              <span>Voir toutes les offres</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Job cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentJobs.map((job) => (
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

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-8 py-3 rounded-lg shadow-sm transition-colors"
            >
              <span>Explorer toutes les offres</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 4. Popular Categories */}
      <PopularCategories 
        categoryCounts={categoryCounts}
        onSelectCategory={(cat) => {
          onNavigate('jobs', cat);
        }}
      />

      {/* 5. Catégories spécialisées — toujours visibles, désactivées si 0 offre */}
      {(() => {
        const categoryStyles: Record<CompanyCategory, { icon: React.ReactNode; iconBg: string }> = {
          ecole: {
            icon: <GraduationCap className="w-5 h-5 text-violet-600" />,
            iconBg: 'bg-violet-50 border-violet-100 group-hover:bg-violet-100',
          },
          entreprise: {
            icon: <Briefcase className="w-5 h-5 text-blue-600" />,
            iconBg: 'bg-blue-50 border-blue-100 group-hover:bg-blue-100',
          },
          etat: {
            icon: <Landmark className="w-5 h-5 text-amber-600" />,
            iconBg: 'bg-amber-50 border-amber-100 group-hover:bg-amber-100',
          },
        };

        const cards = COMPANY_CATEGORIES.map(meta => ({
          key: meta.value,
          count: jobs.filter(j => j.companyCategory === meta.value && j.isActive && j.status === 'approved').length,
          label: meta.label,
          description: meta.description,
          ...categoryStyles[meta.value],
          category: meta.value,
        }));

        return (
          <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              <div className="mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Catégories spécialisées
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Accédez directement aux offres correspondant à votre parcours ou secteur cible.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {cards.map(({ key, count, label, description, icon, iconBg, category }) => {
                  const isEmpty = count === 0;
                  return (
                    <div
                      key={key}
                      onClick={() => onSelectCategory(category)}
                      className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer transition-all duration-200 ease-out flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1.5"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={[
                            'w-11 h-11 rounded-full border flex items-center justify-center transition-colors',
                            isEmpty ? 'bg-slate-50 border-slate-100' : iconBg,
                          ].join(' ')}>
                            {icon}
                          </div>

                          {isEmpty ? (
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              Bientôt disponible
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {count} offre{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-semibold mb-1 text-slate-900 transition-colors group-hover:text-emerald-700">
                          {label}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold mt-4 text-emerald-600 group-hover:text-emerald-700">
                        <span>Découvrir les institutions</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>
        );
      })()}

    </div>
  );
};

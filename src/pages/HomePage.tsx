import React from 'react';
import { JobOffer, StatisticsData } from '../types';
import { HeroSection } from '../components/HeroSection';
import { CounterSection } from '../components/CounterSection';
import { PopularCategories } from '../components/PopularCategories';
import { JobCard } from '../components/JobCard';
import { 
  ArrowRight, 
  BookOpen,
  ShoppingCart,
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
  onSearch
}) => {
  // Compute category counts
  const categoryCounts: Record<string, number> = {};
  jobs.forEach(j => {
    categoryCounts[j.category] = (categoryCounts[j.category] || 0) + 1;
  });

  // Latest 6 jobs for home preview
  const recentJobs = jobs.slice(0, 6);

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

      {/* 5. Catégories spécialisées (couleurs uniformisées : vert émeraude/slate) */}
      <section className="py-12 sm:py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Catégories spécialisées
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Accédez directement aux offres correspondant à votre parcours ou secteur cible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Card 1: Concours & Grandes Écoles */}
            <div
              onClick={() => {
                onSearch('concours|pfe|stage fin|encg|ensa|est |école|ingénieur|licence|master|bac+', '');
                onNavigate('jobs');
              }}
              className="group cursor-pointer bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
                  Concours & Grandes Écoles
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Offres liées aux concours d'entrée et grandes écoles marocaines (ENCG, ENSA, EST, écoles d'ingénieurs...)
                </p>
              </div>
              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-emerald-500 group-hover:text-emerald-400 mt-4">
                <span>Explorer les offres</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Grande Distribution & Retail */}
            <div
              onClick={() => {
                onSearch('distribution|retail|marjane|carrefour|aswak|grande surface|hypermarché|supermarché|magasin|commercial', '');
                onNavigate('jobs');
              }}
              className="group cursor-pointer bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
                  Grande Distribution & Retail
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Offres d'emploi dans les grandes surfaces et enseignes de distribution (Marjane, Carrefour, Aswak Assalam...)
                </p>
              </div>
              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-emerald-500 group-hover:text-emerald-400 mt-4">
                <span>Explorer les offres</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Fonction Publique & Concours d'État */}
            <div
              onClick={() => {
                onSearch('public|police|gendarmerie|commune|jamaa|administration|fonction publique|collectivité|ministère|état|territorial', '');
                onNavigate('jobs');
              }}
              className="group cursor-pointer bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Landmark className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
                  Fonction Publique & Concours d'État
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Offres et concours du secteur public : Police, Gendarmerie, Collectivités territoriales (Jamaa/Commune), administrations...
                </p>
              </div>
              <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-emerald-500 group-hover:text-emerald-400 mt-4">
                <span>Explorer les offres</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

import React from 'react';
import { JobOffer, JobCategory, StatisticsData } from '../types';
import { HeroSection } from '../components/HeroSection';
import { CounterSection } from '../components/CounterSection';
import { PopularCategories } from '../components/PopularCategories';
import { JobCard } from '../components/JobCard';
import { VisualBanner } from '../components/VisualBanner';
import { 
  ArrowRight, 
  Briefcase, 
  PlusCircle, 
  ShieldCheck, 
  GraduationCap, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Users2,
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
      
      {/* 1. Hero Section */}
      <HeroSection 
        onSearch={(kw, c) => {
          onSearch(kw, c);
          onNavigate('jobs');
        }}
        onExplore={() => onNavigate('jobs')}
      />

      <VisualBanner />

      {/* 2. Dynamic Counters */}
      <CounterSection stats={stats} />

      {/* 3. Popular Categories */}
      <PopularCategories 
        categoryCounts={categoryCounts}
        onSelectCategory={(cat) => {
          onNavigate('jobs', cat);
        }}
      />

      {/* 4. Dernières Offres Publiées */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mis à jour en temps réel</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                Dernières offres d'emploi & stages
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Postulez directement par email sans créer de compte compliqué.
              </p>
            </div>

            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-sm shrink-0"
            >
              <span>Voir toutes les offres</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Job cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <div className="mt-10 text-center">
            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-98"
            >
              <span>Explorer l'ensemble du catalogue d'emploi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 4bis. Thematic Category Cards */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explorer par thématique</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              Catégories spécialisées
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Accédez directement aux offres qui correspondent à votre parcours ou secteur cible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Concours & Grandes Écoles */}
            <div
              onClick={() => {
                onSearch('concours|pfe|stage fin|encg|ensa|est |école|ingénieur|licence|master|bac+', '');
                onNavigate('jobs');
              }}
              className="group cursor-pointer bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Thématique
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors font-serif mb-1">
                  Concours & Grandes Écoles
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Retrouvez les offres liées aux concours d'entrée et aux grandes écoles marocaines (ENCG, ENSA, EST, écoles d'ingénieurs...)
                </p>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
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
              className="group cursor-pointer bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-300 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    Thématique
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors font-serif mb-1">
                  Grande Distribution & Retail
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Offres d'emploi dans les grandes surfaces et enseignes de distribution (Marjane, Carrefour, Aswak Assalam...)
                </p>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
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
              className="group cursor-pointer bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Thématique
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors font-serif mb-1">
                  Fonction Publique & Concours d'État
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Offres et concours du secteur public : Police, Gendarmerie, Collectivités territoriales (Jamaa/Commune), administrations...
                </p>
              </div>
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span>Explorer les offres</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Pourquoi Aibra Academy ? */}
      <section className="py-12 sm:py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              Expertise RH Nearshore &amp; Recrutement Maroc
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
              Pourquoi choisir Aibra Academy comme partenaire RH ?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Cabinet de recrutement engagé à Agadir et à travers le Maroc, nous rapprochons les candidats qualifiés et les entreprises grâce à nos solutions RH nearshore et notre service de talent acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">
                Contact Email Direct
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Pas de formulaires interminables. Vous cliquez sur le bouton email et votre candidature s'envoie directement à la boîte de réception du recruteur.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">
                Spécial Jeunes Diplômés & PFE
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Une priorité accordée aux stages de fin d'études (PFE) et aux premiers emplois pour accompagner les étudiants des universités et instituts marocains (EST, OFPPT, ENCG, ENSA, FSJES...).
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">
                Offres Authentiques & Vérifiées
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Chaque offre est modérée pour garantir l'exactitude des coordonnées de contact et lutter contre les fausses annonces.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

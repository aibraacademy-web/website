import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  GraduationCap
} from 'lucide-react';

interface HeroSectionProps {
  onSearch: (keyword: string, city: string) => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onExplore }) => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword, city);
  };

  const moroccanCities = [
    'Toutes les villes',
    'Casablanca',
    'Rabat',
    'Tanger',
    'Marrakech',
    'Agadir',
    'Fès',
    'Oujda',
    'Meknès',
    'Kénitra',
    'Tétouan'
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800">
      
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text & Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Cabinet de Recrutement &amp; Nearshore RH à Agadir</span>
            </div>

            {/* Main Catchy Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-serif">
              Solutions RH Nearshore &amp; <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Recrutement au Maroc
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Aibra Academy est votre cabinet de recrutement de référence à Agadir. Nous accompagnons les entreprises dans leur outsourcing RH et connectons les jeunes diplômés du Maroc aux meilleures opportunités de carrière.
            </p>

            {/* Main Interactive Search Form */}
            <form 
              onSubmit={handleFormSubmit}
              className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200/80 text-slate-900 max-w-2xl mx-auto lg:mx-0 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-2"
            >
              {/* Keyword Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-emerald-600 absolute left-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Poste, compétence, secteur (ex: RH, Développeur, Comptable)..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder-slate-400"
                />
              </div>

              {/* City Select */}
              <div className="relative sm:w-48 flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 pl-0 sm:pl-2">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-2 shrink-0" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-8 pr-6 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-transparent font-semibold text-slate-800 appearance-none cursor-pointer"
                >
                  {moroccanCities.map((c) => (
                    <option key={c} value={c === 'Toutes les villes' ? '' : c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Submit CTA */}
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-md transition-all shrink-0 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Voir les offres</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Quick Searches Tag Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-slate-300 pt-1">
              <span className="font-semibold text-slate-400">Populaire :</span>
              {[
                { label: 'Casablanca', type: 'city' },
                { label: 'Stage / PFE', type: 'keyword' },
                { label: 'CDI Débutant', type: 'keyword' },
                { label: 'RH', type: 'keyword' },
                { label: 'Informatique', type: 'keyword' },
                { label: 'Agriculture', type: 'keyword' }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.type === 'city') onSearch('', item.label);
                    else onSearch(item.label, '');
                  }}
                  className="bg-slate-800/80 hover:bg-emerald-600/30 hover:border-emerald-500 text-slate-200 px-3 py-1 rounded-full border border-slate-700 transition-colors"
                >
                  + {item.label}
                </button>
              ))}
            </div>

            {/* Trust bullet features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs text-slate-300 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Candidatures 100% Directes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Annonces vérifiées au Maroc</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Totalement Gratuit</span>
              </div>
            </div>

          </div>

          {/* Right Column Feature Graphic/Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Aujourd'hui au Maroc</span>
                </div>
                <span className="text-[11px] text-slate-400">Mise à jour en temps réel</span>
              </div>

              {/* Sample Highlighting Card */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Stage PFE / Embauche
                  </span>
                  <span className="text-slate-400 text-xs">Casablanca</span>
                </div>
                <h4 className="text-white font-bold text-base font-serif">
                  Développeur Fullstack React / Node.js
                </h4>
                <p className="text-slate-300 text-xs line-clamp-2">
                  Entreprise informatique recrute un(e) jeune diplômé(e) enthousiaste pour intégrer nos projets SaaS.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>Contact: recruitment@tech.ma</span>
                  <span className="bg-emerald-600 text-white text-[11px] px-3 py-1 rounded-lg">Email Direct</span>
                </div>
              </div>

              {/* Stat highlight card overlay */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
                  <p className="text-xl font-extrabold text-emerald-400 font-mono">100%</p>
                  <p className="text-[11px] text-slate-400">Offres authentiques</p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
                  <p className="text-xl font-extrabold text-teal-300 font-mono">24/7</p>
                  <p className="text-[11px] text-slate-400">Accès ouvert</p>
                </div>
              </div>

              <button
                onClick={onExplore}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Découvrir toutes les opportunités</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

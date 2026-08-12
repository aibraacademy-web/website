import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  CheckCircle2,
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
    <section className="bg-slate-900 text-white pt-10 pb-14 border-b border-slate-800">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-3">
          Trouvez votre emploi au{' '}
          <span className="text-emerald-400">Maroc</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
          Offres d'emploi, stages PFE et alternances — postulez directement par email, sans créer de compte.
        </p>

        {/* Search Form */}
        <form 
          onSubmit={handleFormSubmit}
          className="bg-white rounded-xl shadow-lg p-3 flex flex-col sm:flex-row items-center gap-2 max-w-3xl mx-auto"
        >
          {/* Keyword Input */}
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 shrink-0" />
            <input
              type="text"
              placeholder="Poste, compétence, secteur..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200 shrink-0" />

          {/* City Select */}
          <div className="relative sm:w-44 w-full flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 shrink-0" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-transparent font-medium cursor-pointer appearance-none"
            >
              {moroccanCities.map((c) => (
                <option key={c} value={c === 'Toutes les villes' ? '' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <span>Rechercher</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Candidatures directes par email
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Annonces vérifiées
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Totalement gratuit
          </span>
        </div>

      </div>
    </section>
  );
};

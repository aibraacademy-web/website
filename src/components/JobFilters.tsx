import React from 'react';
import { JobFilterState, JobCategory, MoroccanCity, ContractType } from '../types';
import { 
  Filter, 
  RotateCcw, 
  MapPin, 
  Briefcase, 
  FolderKanban, 
  Award, 
  X,
  Search
} from 'lucide-react';

interface JobFiltersProps {
  filters: JobFilterState;
  onChangeFilter: (key: keyof JobFilterState, value: string) => void;
  onResetFilters: () => void;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChangeFilter,
  onResetFilters,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer
}) => {
  const categories = [
    'TOUS',
    'RH',
    'Comptabilité',
    'Mécanique',
    'Administration',
    'Informatique',
    'Agriculture',
    'Marketing'
  ];

  const cities = [
    'TOUTES',
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

  const contractTypes = [
    'TOUS',
    'CDI',
    'CDD',
    'Stage / PFE',
    'Alternance',
    'Intérim'
  ];

  const experienceLevels = [
    'TOUS',
    'Débutant (0-1 an)',
    '1 à 3 ans',
    'Stage PFE',
    '3 à 5 ans'
  ];

  const filterContent = (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm font-serif">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filtres de recherche</span>
        </div>
        
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* Filter 1: Secteur / Catégorie */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secteur / Catégorie</span>
        </label>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = filters.category.toUpperCase() === cat.toUpperCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChangeFilter('category', cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{cat === 'TOUS' ? 'Tous les secteurs' : cat}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter 2: Ville */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ville au Maroc</span>
        </label>
        <select
          value={filters.city}
          onChange={(e) => onChangeFilter('city', e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {cities.map((city) => (
            <option key={city} value={city}>
              {city === 'TOUTES' ? 'Toutes les villes marocaines' : city}
            </option>
          ))}
        </select>
      </div>

      {/* Filter 3: Type de Contrat */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          <span>Type de contrat</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {contractTypes.map((type) => {
            const isSelected = filters.contractType.toUpperCase() === type.toUpperCase();
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChangeFilter('contractType', type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {type === 'TOUS' ? 'Tous' : type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter 4: Expérience */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Niveau d'expérience</span>
        </label>
        <select
          value={filters.experienceLevel}
          onChange={(e) => onChangeFilter('experienceLevel', e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {experienceLevels.map((exp) => (
            <option key={exp} value={exp}>
              {exp === 'TOUS' ? 'Tous niveaux' : exp}
            </option>
          ))}
        </select>
      </div>

    </div>
  );

  // Desktop view
  return (
    <>
      <div className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
        {filterContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <h3 className="font-bold text-slate-900 text-base font-serif">
                  Filtres
                </h3>
                <button
                  onClick={onCloseMobileDrawer}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {filterContent}
            </div>

            <div className="pt-6 border-t border-slate-200">
              <button
                onClick={onCloseMobileDrawer}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

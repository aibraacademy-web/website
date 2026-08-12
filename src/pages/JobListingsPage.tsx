import React, { useState } from 'react';
import { JobOffer, JobFilterState } from '../types';
import { filterJobs } from '../services/jobService';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/JobFilters';
import { 
  Search, 
  Filter, 
  Briefcase, 
  X,
  MapPin,
  FolderKanban,
  ChevronDown
} from 'lucide-react';

interface JobListingsPageProps {
  jobs: JobOffer[];
  initialFilters: JobFilterState;
  savedJobIds: string[];
  onToggleSave: (id: string) => void;
  onOpenMailModal: (job: JobOffer) => void;
  onSelectJob: (job: JobOffer) => void;
}

export const JobListingsPage: React.FC<JobListingsPageProps> = ({
  jobs,
  initialFilters,
  savedJobIds,
  onToggleSave,
  onOpenMailModal,
  onSelectJob
}) => {
  const [filters, setFilters] = useState<JobFilterState>(initialFilters);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const filteredJobs = filterJobs(jobs, filters);

  const handleFilterChange = (key: keyof JobFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      category: 'TOUS',
      city: 'TOUTES',
      contractType: 'TOUS',
      experienceLevel: 'TOUS',
      sortBy: 'latest'
    });
  };

  const activeFiltersCount = 
    (filters.keyword ? 1 : 0) +
    (filters.category !== 'TOUS' ? 1 : 0) +
    (filters.city !== 'TOUTES' ? 1 : 0) +
    (filters.contractType !== 'TOUS' ? 1 : 0) +
    (filters.experienceLevel !== 'TOUS' ? 1 : 0);

  const cities = ['TOUTES', 'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Oujda', 'Meknès', 'Kénitra', 'Tétouan'];
  const categories = ['TOUS', 'RH', 'Comptabilité', 'Mécanique', 'Administration', 'Informatique', 'Agriculture', 'Marketing'];
  const contractTypes = ['TOUS', 'CDI', 'CDD', 'Stage / PFE', 'Alternance', 'Intérim'];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Search Bar (always visible, no scroll needed) ── */}
      <div className="bg-slate-900 border-b border-slate-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-white mb-4">
            Offres d'emploi & stages au Maroc
          </h1>
          
          {/* Inline search + quick filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            
            {/* Keyword */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Poste, entreprise, compétence..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 placeholder-slate-400"
              />
              {filters.keyword && (
                <button
                  onClick={() => handleFilterChange('keyword', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* City quick filter */}
            <div className="relative sm:w-44">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 appearance-none cursor-pointer"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c === 'TOUTES' ? 'Toutes les villes' : c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Category quick filter */}
            <div className="relative sm:w-48">
              <FolderKanban className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 appearance-none cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'TOUS' ? 'Tous les secteurs' : c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Contract type quick filter */}
            <div className="relative sm:w-40">
              <select
                value={filters.contractType}
                onChange={(e) => handleFilterChange('contractType', e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 appearance-none cursor-pointer"
              >
                {contractTypes.map(c => (
                  <option key={c} value={c}>{c === 'TOUS' ? 'Tout type de contrat' : c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>

          {/* Active filter pills */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {filters.keyword && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  "{filters.keyword}"
                  <button onClick={() => handleFilterChange('keyword', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.category !== 'TOUS' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  {filters.category}
                  <button onClick={() => handleFilterChange('category', 'TOUS')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.city !== 'TOUTES' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  {filters.city}
                  <button onClick={() => handleFilterChange('city', 'TOUTES')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.contractType !== 'TOUS' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  {filters.contractType}
                  <button onClick={() => handleFilterChange('contractType', 'TOUS')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white underline ml-1"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Side Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters
              filters={filters}
              onChangeFilter={handleFilterChange}
              onResetFilters={handleReset}
              isMobileDrawerOpen={mobileDrawerOpen}
              onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>

          {/* Job Listing Cards Column */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm"
              >
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Filtres {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>

              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{filteredJobs.length}</span> offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
              </p>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="p-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="latest">Plus récentes</option>
                <option value="popular">Plus populaires</option>
              </select>
            </div>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Aucune offre ne correspond à vos critères
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Essayez de modifier votre recherche ou de réinitialiser vos filtres.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredJobs.map((job) => (
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
      </div>
    </div>
  );
};

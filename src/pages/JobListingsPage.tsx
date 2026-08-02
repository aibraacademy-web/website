import React, { useState } from 'react';
import { JobOffer, JobFilterState } from '../types';
import { filterJobs } from '../services/jobService';
import { JobCard } from '../components/JobCard';
import { JobFilters } from '../components/JobFilters';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Grid, 
  List, 
  Briefcase, 
  MapPin, 
  X,
  Sparkles
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
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

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

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Base d'opportunités au Maroc</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif">
                Offres d'emploi & stages
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {filteredJobs.length} {filteredJobs.length > 1 ? 'offres disponibles' : 'offre disponible'} correspondant à vos critères
              </p>
            </div>

            {/* Quick Keyword Bar */}
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Rechercher un poste, ville, entreprise..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
              />
              {filters.keyword && (
                <button
                  onClick={() => handleFilterChange('keyword', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Filtres actifs :</span>
              
              {filters.keyword && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  Mot-clé: "{filters.keyword}"
                  <button onClick={() => handleFilterChange('keyword', '')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {filters.category !== 'TOUS' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  Secteur: {filters.category}
                  <button onClick={() => handleFilterChange('category', 'TOUS')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {filters.city !== 'TOUTES' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  Ville: {filters.city}
                  <button onClick={() => handleFilterChange('city', 'TOUTES')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {filters.contractType !== 'TOUS' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  Contrat: {filters.contractType}
                  <button onClick={() => handleFilterChange('contractType', 'TOUS')}><X className="w-3 h-3" /></button>
                </span>
              )}

              {filters.experienceLevel !== 'TOUS' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  Expérience: {filters.experienceLevel}
                  <button onClick={() => handleFilterChange('experienceLevel', 'TOUS')}><X className="w-3 h-3" /></button>
                </span>
              )}

              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-600 hover:text-emerald-700 underline ml-2"
              >
                Tout réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* Layout Grid with Side Filters */}
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
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              
              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                <Filter className="w-4 h-4 text-emerald-400" />
                <span>Filtres ({activeFiltersCount})</span>
              </button>

              <div className="text-xs text-slate-600 font-medium hidden sm:block">
                Affichage de <span className="font-bold text-slate-900">{filteredJobs.length}</span> opportunité(s)
              </div>

              {/* Sort selector & Layout toggle */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <span className="hidden sm:inline">Trier par :</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="latest">Plus récentes</option>
                    <option value="popular">Plus populaires</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Aucune offre ne correspond à vos critères
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Essayez de modifier votre recherche par mot-clé ou de réinitialiser vos filtres par secteur et ville.
                </p>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

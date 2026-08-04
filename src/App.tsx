import React, { useState, useEffect, useCallback } from 'react';
import { JobOffer, JobFilterState } from './types';
import { 
  fetchJobs,
  fetchAllJobs,
  getSavedJobIds, 
  toggleSaveJob, 
  getPlatformStats,
  incrementJobViews
} from './services/jobService';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MailtoModal } from './components/MailtoModal';
import { SavedJobsModal } from './components/SavedJobsModal';

import { HomePage } from './pages/HomePage';
import { JobListingsPage } from './pages/JobListingsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  
  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const isAdminAuthenticated = !!session;
  
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [routeJobId, setRouteJobId] = useState<string | null>(null);
  const [mailtoJob, setMailtoJob] = useState<JobOffer | null>(null);
  
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const resolveRouteFromPath = (pathname: string, authenticated: boolean) => {
    const cleanPath = pathname.toLowerCase().replace(/\/+$|^\/+/g, '');
    if (cleanPath === 'admin') {
      return { tab: authenticated ? 'admin-dashboard' : 'admin-login' };
    }
    if (cleanPath.startsWith('offres/')) {
      const [, id] = cleanPath.split('/');
      return { tab: 'job-detail', jobId: id };
    }
    if (cleanPath === 'offres' || cleanPath === 'jobs') {
      return { tab: 'jobs' };
    }
    if (cleanPath.startsWith('about')) {
      return { tab: 'about' };
    }
    if (cleanPath.startsWith('contact')) {
      return { tab: 'contact' };
    }
    return { tab: 'home' };
  };

  useEffect(() => {
    const initialRoute = resolveRouteFromPath(window.location.pathname, isAdminAuthenticated);
    setCurrentTab(initialRoute.tab);
    setRouteJobId(initialRoute.jobId || null);

    const handlePopState = () => {
      const route = resolveRouteFromPath(window.location.pathname, isAdminAuthenticated);
      setCurrentTab(route.tab);
      setRouteJobId(route.jobId || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminAuthenticated]);

  const getPathFromTab = (tab: string, jobId?: string) => {
    if (tab === 'jobs') return '/offres';
    if (tab === 'job-detail' && jobId) return `/offres/${jobId}`;
    if (tab === 'about') return '/about';
    if (tab === 'contact') return '/contact';
    if (tab === 'admin-login' || tab === 'admin-dashboard') return '/admin';
    return '/';
  };

  // Initial filter state passed when searching from home page
  const [jobFilters, setJobFilters] = useState<JobFilterState>({
    keyword: '',
    category: 'TOUS',
    city: 'TOUTES',
    contractType: 'TOUS',
    experienceLevel: 'TOUS',
    sortBy: 'latest'
  });

  // Charge les offres publiques depuis Supabase
  const loadPublicJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedJobs = await fetchJobs();
      setJobs(loadedJobs);
    } catch (error) {
      console.error('[App] Erreur chargement offres:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial dataset & bookmarks on mount
  useEffect(() => {
    loadPublicJobs();
    setSavedJobIds(getSavedJobIds());
  }, [loadPublicJobs]);

  // Sync selected job with route ID when jobs are available
  useEffect(() => {
    if (routeJobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === routeJobId);
      setSelectedJob(job || null);
      if (job) {
        setCurrentTab('job-detail');
      }
    }
  }, [routeJobId, jobs]);

  // Handle bookmark toggle
  const handleToggleSave = (id: string) => {
    const updated = toggleSaveJob(id);
    setSavedJobIds(updated);
  };

  // Open mail modal
  const handleOpenMailModal = (job: JobOffer) => {
    setMailtoJob(job);
    setIsMailModalOpen(true);
  };

  // Select job detail
  const handleSelectJob = (job: JobOffer) => {
    setSelectedJob(job);
    setRouteJobId(job.id);
    incrementJobViews(job.id);
    setCurrentTab('job-detail');
    window.history.pushState(null, '', getPathFromTab('job-detail', job.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation helper
  const handleNavigate = (tab: string, category?: string, city?: string) => {
    if (category || city) {
      setJobFilters(prev => ({
        ...prev,
        category: category || prev.category,
        city: city || prev.city
      }));
    }

    if (tab === 'jobs') {
      setRouteJobId(null);
      setSelectedJob(null);
    }

    const route = getPathFromTab(tab);
    window.history.pushState(null, '', route);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search trigger from hero
  const handleSearchTrigger = (keyword: string, city: string) => {
    setJobFilters(prev => ({
      ...prev,
      keyword: keyword,
      city: city || 'TOUTES'
    }));
    setCurrentTab('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Job added callback — refresh public jobs list
  const handleJobAdded = async (newJob: JobOffer) => {
    setJobs(prev => [newJob, ...prev]);
  };

  // Job deleted callback
  const handleJobDeleted = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  // Job updated callback (activer/désactiver, etc.)
  const handleJobUpdated = (updatedJob: JobOffer) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  // All jobs cleared callback
  const handleAllJobsCleared = () => {
    setJobs([]);
    setSavedJobIds([]);
  };

  // Get saved offers array
  const savedJobsList = jobs.filter(j => savedJobIds.includes(j.id));
  const stats = getPlatformStats(jobs);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => handleNavigate(tab)}
        savedJobsCount={savedJobIds.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            jobs={jobs}
            stats={stats}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSave}
            onOpenMailModal={handleOpenMailModal}
            onSelectJob={handleSelectJob}
            onNavigate={handleNavigate}
            onSearch={handleSearchTrigger}
          />
        )}

        {currentTab === 'jobs' && (
          <JobListingsPage
            jobs={jobs}
            initialFilters={jobFilters}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSave}
            onOpenMailModal={handleOpenMailModal}
            onSelectJob={handleSelectJob}
          />
        )}

        {currentTab === 'job-detail' && (
          selectedJob ? (
            <JobDetailPage
              job={selectedJob}
              allJobs={jobs}
              savedJobIds={savedJobIds}
              onToggleSave={handleToggleSave}
              onOpenMailModal={handleOpenMailModal}
              onSelectJob={handleSelectJob}
              onBack={() => handleNavigate('jobs')}
            />
          ) : (
            <JobListingsPage
              jobs={jobs}
              initialFilters={jobFilters}
              savedJobIds={savedJobIds}
              onToggleSave={handleToggleSave}
              onOpenMailModal={handleOpenMailModal}
              onSelectJob={handleSelectJob}
            />
          )
        )}

        {currentTab === 'admin-login' && !isAdminAuthenticated && (
          <AdminLoginPage
            onLogin={() => {
              setCurrentTab('admin-dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {(currentTab === 'admin-dashboard' || (currentTab === 'admin-login' && isAdminAuthenticated)) && (
          isAdminAuthenticated ? (
            <AdminDashboardPage
              onJobAdded={handleJobAdded}
              onJobDeleted={handleJobDeleted}
              onJobUpdated={handleJobUpdated}
              onAllJobsCleared={handleAllJobsCleared}
            />
          ) : (
            <div className="text-center py-20 text-slate-500">Accès refusé. Veuillez vous connecter via l'espace admin.</div>
          )
        )}

        {currentTab === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Candidate Direct Email Mailto Modal */}
      <MailtoModal
        job={mailtoJob}
        isOpen={isMailModalOpen}
        onClose={() => setIsMailModalOpen(false)}
      />

      {/* Saved Jobs Modal */}
      <SavedJobsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedJobs={savedJobsList}
        onToggleSave={handleToggleSave}
        onOpenMailModal={handleOpenMailModal}
        onSelectJob={handleSelectJob}
      />

    </div>
  );
}

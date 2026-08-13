import React, { useState } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  Bookmark, 
  Menu, 
  X, 
  GraduationCap, 
  ChevronRight,
  Sparkles,
  PhoneCall,
  Info,
  Search,
  User,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  savedJobsCount: number;
  onOpenSavedModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  savedJobsCount,
  onOpenSavedModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();

  const navItems: { id: string; label: string; icon?: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'home', label: 'Accueil' },
    { id: 'jobs', label: 'Offres d\'emploi', badge: 'Nouveau' },
    { id: 'about', label: 'À propos' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOut();
    handleNavClick('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
        <span>Plateforme N°1 des offres d'emploi & de stages pour la jeunesse marocaine</span>
        <span className="hidden sm:inline-block bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">100% Gratuit</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Aibra Academy (image) */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
            aria-label="Aibra Academy Accueil"
          >
            <div className="flex items-center justify-center w-12 h-12 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-transparent group-hover:scale-105 transition-transform">
              <img src="/aibra-logo.png" alt="Aibra Academy - Cabinet de recrutement &amp; RH nearshore à Agadir" className="h-10 sm:h-12 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-serif">
                  Aibra<span className="text-emerald-400">Academy</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 tracking-wide uppercase font-semibold">
                Emploi & Stages au Maroc
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-900/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Saved Offers Bookmark Button */}
            <button
              onClick={onOpenSavedModal}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-all"
              title="Vos offres enregistrées"
            >
              <Bookmark className={`w-4 h-4 ${savedJobsCount > 0 ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Favoris</span>
              {savedJobsCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-full">
                  {savedJobsCount}
                </span>
              )}
            </button>

            {/* Auth Controls */}
            {profile ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNavClick(profile.role === 'admin' ? 'admin-dashboard' : profile.role === 'entreprise' ? 'entreprise-dashboard' : 'candidat-dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Mon Espace</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Inscription</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-emerald-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pb-1">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {Icon ? <Icon className="w-4 h-4 text-emerald-400" /> : <Search className="w-4 h-4 text-slate-400" />}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 space-y-2 mt-2">
            {profile ? (
              <>
                <button
                  onClick={() => handleNavClick(profile.role === 'admin' ? 'admin-dashboard' : profile.role === 'entreprise' ? 'entreprise-dashboard' : 'candidat-dashboard')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-sm"
                >
                  <User className="w-4 h-4" />
                  Mon Espace
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-semibold shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-semibold border border-slate-700"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Inscription gratuite
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

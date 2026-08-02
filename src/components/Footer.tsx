import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Send,
  Heart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string, category?: string, city?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white font-serif">
                Aibra<span className="text-emerald-400">Academy</span>
              </span>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Aibra Academy est le tremplin de carrière dédié aux jeunes diplômés et étudiants au Maroc. Nous connectons directement les candidats talentueux avec les entreprises qui recrutent à Casablanca, Rabat, Tanger et partout dans le Royaume.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/aibra-academy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/212600000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 flex items-center justify-center transition-all"
                aria-label="WhatsApp Support"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Annonces vérifiées & candidatures directes sans intermédiaire</span>
            </div>
          </div>

          {/* Col 2: Navigation Rapide */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('jobs')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Toutes les offres d'emploi
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('admin-login')} 
                  className="hover:text-emerald-400 transition-colors text-slate-500 font-medium flex items-center gap-1"
                >
                  <span>🔒 Espace Admin</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  À propos d'Aibra Academy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('contact')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Offres par Ville */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Offres par Ville
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Meknès'].map((city) => (
                <li key={city}>
                  <button 
                    onClick={() => onNavigate('jobs', undefined, city)}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Jobs à {city}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Info */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Contact Maroc
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Agadir, Agadir Bay, Maroc</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:aibraacademy@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  aibraacademy@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Linkedin className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="https://www.linkedin.com/company/aibra-academy/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  LinkedIn Aibra Academy
                </a>
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Candidats jeunes diplômés
              </p>
              <p>Envoyez directement vos CVs par email aux recruteurs sans frais.</p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Aibra Academy Maroc. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            <span>Conçu avec passion pour la jeunesse marocaine</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

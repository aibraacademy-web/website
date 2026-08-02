import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Target, 
  HeartHandshake, 
  Sparkles, 
  ShieldCheck, 
  Users2, 
  Building2,
  CheckCircle2,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>À propos d'Aibra Academy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif leading-tight">
            Le pont entre les diplômés et l'emploi au Maroc
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Aibra Academy est une initiative dédiée à la facilitation de l'accès à l'emploi et aux stages PFE pour les étudiants et jeunes diplômés à travers toutes les villes du Royaume du Maroc.
          </p>
        </div>

        {/* Vision & Mission Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Notre Vision
              </span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">
                Pourquoi avons-nous créé Aibra Academy ?
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Chaque année, des milliers d'étudiants sortent diplômés des universités, écoles supérieures (EST, ENCG, ENSA, FST, FSJES) et instituts de formation professionnelle (OFPPT / ISTA) au Maroc.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pourtant, trouver un premier stage PFE ou un emploi de débutant reste souvent complexe en raison de la lourdeur des processus. Aibra Academy supprime les intermédiaires et permet aux jeunes de contacter <strong>directement par email</strong> les responsables RH des entreprises.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-4 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                Nos 3 Piliers Fondamentaux
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Gratuit :</strong> Aucun frais exigé des candidats ou étudiants.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Candidature Directe :</strong> Un clic pour envoyer son CV au recruteur.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Annonces Vérifiées :</strong> Contrôle des coordonnées et des offres.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Key Moroccan Presence */}
          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 text-center">
              Présence dans tous les bassins d'emploi du Maroc
            </h3>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Casablanca Nearshore & Zenith',
                'Agdal & Technopolis Rabat',
                'Tanger Automotive City & Med',
                'Marrakech Gueliz & Hivernage',
                'Agadir Anza & Souss',
                'Fès Shore',
                'Oujda Technopole',
                'Meknès Saïs',
                'El Jadida',
                'Kénitra Atlantic Free Zone'
              ].map((loc) => (
                <span key={loc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{loc}</span>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* CTA Footer inside about */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-8 text-center space-y-4 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
            Prêt à franchir une nouvelle étape dans votre carrière ?
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto">
            Découvrez dès maintenant les dernières offres d'emploi et de stage disponibles sur la plateforme.
          </p>
          <button
            onClick={() => onNavigate('jobs')}
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            <span>Voir les offres d'emploi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

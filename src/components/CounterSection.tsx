import React from 'react';
import { StatisticsData } from '../types';
import { Briefcase, Building2, Users, Send, Sparkles } from 'lucide-react';

interface CounterSectionProps {
  stats: StatisticsData;
}

export const CounterSection: React.FC<CounterSectionProps> = ({ stats }) => {
  const statItems = [
    {
      id: 'jobs',
      label: 'Offres d\'emploi & stages',
      value: `${stats.totalJobs} +`,
      description: 'Annonces réelles publiées au Maroc',
      icon: Briefcase,
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'En direct'
    },
    {
      id: 'companies',
      label: 'Entreprises partenaires',
      value: `${stats.totalCompanies} +`,
      description: 'Recrutent à Casablanca, Rabat, Tanger...',
      icon: Building2,
      gradient: 'from-blue-600 to-indigo-600',
      badge: 'Recruteurs'
    },
    {
      id: 'youth',
      label: 'Jeunes candidats inscrits',
      value: `${stats.totalYouthRegistered.toLocaleString('fr-FR')} +`,
      description: 'Étudiants et jeunes diplômés accompagnés',
      icon: Users,
      gradient: 'from-emerald-600 to-green-600',
      badge: 'Communauté'
    },
    {
      id: 'applications',
      label: 'Candidatures envoyées',
      value: `${stats.totalApplicationsSent.toLocaleString('fr-FR')} +`,
      description: 'Contacts directes établis par email',
      icon: Send,
      gradient: 'from-teal-600 to-cyan-600',
      badge: 'Impact'
    }
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Impact Aibra Academy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-serif">
            Des chiffres qui témoignent de notre engagement
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Faciliter l'insertion professionnelle de la jeunesse marocaine à travers des opportunités concrètes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="relative bg-slate-50/80 rounded-2xl p-6 border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight group-hover:text-emerald-600 transition-colors">
                    {item.value}
                  </h3>
                  <p className="text-sm font-bold text-slate-800 font-serif">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

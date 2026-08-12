import React from 'react';
import { StatisticsData } from '../types';
import { Briefcase, Building2, Users, Send } from 'lucide-react';

interface CounterSectionProps {
  stats: StatisticsData;
}

export const CounterSection: React.FC<CounterSectionProps> = ({ stats }) => {
  const statItems = [
    {
      id: 'jobs',
      label: "Offres d'emploi & stages",
      value: `${stats.totalJobs}+`,
      description: 'Annonces réelles publiées au Maroc',
      icon: Briefcase,
    },
    {
      id: 'companies',
      label: 'Entreprises partenaires',
      value: `${stats.totalCompanies}+`,
      description: 'Recrutent à Casablanca, Rabat, Tanger...',
      icon: Building2,
    },
    {
      id: 'youth',
      label: 'Jeunes candidats accompagnés',
      value: `${stats.totalYouthRegistered.toLocaleString('fr-FR')}+`,
      description: 'Étudiants et jeunes diplômés',
      icon: Users,
    },
    {
      id: 'applications',
      label: 'Candidatures envoyées',
      value: `${stats.totalApplicationsSent.toLocaleString('fr-FR')}+`,
      description: 'Contacts directes établis par email',
      icon: Send,
    }
  ];

  return (
    <section className="py-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="relative bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
                    {item.value}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400 leading-snug">
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

import React from 'react';
import { JobCategory } from '../types';
import { 
  Users, 
  TrendingUp, 
  Factory, 
  ClipboardList, 
  Monitor, 
  Wheat, 
  ArrowRight
} from 'lucide-react';

interface PopularCategoriesProps {
  onSelectCategory: (category: JobCategory) => void;
  categoryCounts: Record<string, number>;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({
  onSelectCategory,
  categoryCounts
}) => {
  const categories: {
    id: JobCategory;
    title: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'RH',
      title: 'Ressources Humaines (RH)',
      description: 'Recrutement, gestion du personnel, paie et développement RH',
      icon: Users,
    },
    {
      id: 'Comptabilité',
      title: 'Comptabilité & Finance',
      description: 'Comptabilité générale, trésorerie, audit et fiscalité marocaine',
      icon: TrendingUp,
    },
    {
      id: 'Mécanique',
      title: 'Mécanique & Industrie',
      description: 'Automobile, maintenance industrielle, électromécanique',
      icon: Factory,
    },
    {
      id: 'Administration',
      title: 'Administration & Secrétariat',
      description: 'Gestion administrative, accueil, secrétariat de direction',
      icon: ClipboardList,
    },
    {
      id: 'Informatique',
      title: 'Informatique & Digital',
      description: 'Développement web, systèmes & réseaux, data, support IT',
      icon: Monitor,
    },
    {
      id: 'Agriculture',
      title: 'Agriculture & Agroalimentaire',
      description: 'Agronomie, horticulture, contrôle qualité et exportation',
      icon: Wheat,
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Secteurs clés du recrutement au Maroc
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Explorez les pôles qui recrutent le plus de jeunes diplômés à Agadir et à travers le Maroc.
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('RH')}
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold text-sm bg-white hover:bg-emerald-50 px-4 py-2.5 rounded-lg border border-slate-200 transition-all shrink-0"
          >
            <span>Toutes les catégories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] || 0;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group cursor-pointer bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {count} {count > 1 ? 'offres' : 'offre'}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                    {cat.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Voir les opportunités</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

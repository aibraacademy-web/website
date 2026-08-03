import React from 'react';
import { JobCategory } from '../types';
import { 
  Users, 
  Calculator, 
  Wrench, 
  FolderKanban, 
  Laptop, 
  Sprout, 
  ArrowRight,
  Sparkles
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
    color: string;
    bgGlow: string;
  }[] = [
    {
      id: 'RH',
      title: 'Ressources Humaines (RH)',
      description: 'Recrutement, gestion du personnel, paie et développement RH',
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      bgGlow: 'hover:border-blue-300'
    },
    {
      id: 'Comptabilité',
      title: 'Comptabilité & Finance',
      description: 'Comptabilité générale, trésorerie, audit et fiscalité marocaine',
      icon: Calculator,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      bgGlow: 'hover:border-emerald-300'
    },
    {
      id: 'Mécanique',
      title: 'Mécanique & Industrie',
      description: 'Automobile, maintenance industrielle, électromécanique',
      icon: Wrench,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      bgGlow: 'hover:border-amber-300'
    },
    {
      id: 'Administration',
      title: 'Administration & Secrétariat',
      description: 'Gestion administrative, accueil, secrétariat de direction',
      icon: FolderKanban,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      bgGlow: 'hover:border-purple-300'
    },
    {
      id: 'Informatique',
      title: 'Informatique & Digital',
      description: 'Développement web, systèmes & réseaux, data, support IT',
      icon: Laptop,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      bgGlow: 'hover:border-teal-300'
    },
    {
      id: 'Agriculture',
      title: 'Agriculture & Agroalimentaire',
      description: 'Agronomie, horticulture, contrôle qualité et exportation',
      icon: Sprout,
      color: 'text-green-600 bg-green-50 border-green-200',
      bgGlow: 'hover:border-green-300'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secteurs Porteurs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Secteurs clés du recrutement au Maroc
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Explorez les pôles de talent acquisition et de services RH nearshore qui recrutent le plus de jeunes diplômés à Agadir et à travers le Maroc.
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('RH')} // Navigates to all offers
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-sm bg-white hover:bg-emerald-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition-all shrink-0"
          >
            <span>Toutes les catégories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] || 0;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${cat.bgGlow}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xs ${cat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {count} {count > 1 ? 'offres' : 'offre'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors font-serif mb-1">
                    {cat.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
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

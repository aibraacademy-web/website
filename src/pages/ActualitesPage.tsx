import React, { useState, useEffect } from 'react';
import { NewsPost, NewsCategory } from '../types';
import { fetchActiveNewsPosts } from '../services/newsService';
import { NewsCard } from '../components/NewsCard';
import { Newspaper, Search, Filter } from 'lucide-react';

interface ActualitesPageProps {
  onNavigate: (tab: string, id?: string) => void;
}

export const ActualitesPage: React.FC<ActualitesPageProps> = ({ onNavigate }) => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'Toutes'>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const data = await fetchActiveNewsPosts();
        setNews(data);
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  const categories: (NewsCategory | 'Toutes')[] = [
    'Toutes',
    'Éducation & Inscriptions',
    'Conseils Carrière',
    'Annonces Officielles'
  ];

  const filteredNews = news.filter((post) => {
    const matchesCategory = activeCategory === 'Toutes' || post.category === activeCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-6">
            <Newspaper className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-serif mb-6 leading-tight tracking-tight">
            Actualités & <span className="text-emerald-600">Informations</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Restez informé des dernières annonces officielles, découvrez nos conseils pour booster votre carrière et ne manquez aucune date d'inscription.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeCategory === cat 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Chargement des actualités...</p>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((post) => (
              <NewsCard 
                key={post.id} 
                news={post} 
                onClick={(id) => onNavigate('actualite-detail', id)} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune actualité trouvée</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Nous n'avons trouvé aucun article correspondant à vos critères de recherche.
            </p>
            <button
              onClick={() => {
                setActiveCategory('Toutes');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

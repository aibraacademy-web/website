import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Bell } from 'lucide-react';
import { fetchPinnedNewsPosts } from '../services/newsService';
import { NewsPost } from '../types';

interface NewsBannerProps {
  onNavigate: (tab: string, id?: string) => void;
}

export const NewsBanner: React.FC<NewsBannerProps> = ({ onNavigate }) => {
  const [pinnedNews, setPinnedNews] = useState<NewsPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadPinnedNews = async () => {
      try {
        const news = await fetchPinnedNewsPosts();
        setPinnedNews(news);
      } catch (error) {
        console.error('Failed to load pinned news:', error);
      }
    };
    loadPinnedNews();
  }, []);

  useEffect(() => {
    if (pinnedNews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pinnedNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [pinnedNews.length]);

  if (pinnedNews.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
        <span>Plateforme N°1 des offres d'emploi & de stages pour la jeunesse marocaine</span>
        <span className="hidden sm:inline-block bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">100% Gratuit</span>
      </div>
    );
  }

  const currentNews = pinnedNews[currentIndex];

  return (
    <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white text-xs py-1.5 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 relative">
        <Bell className="w-3.5 h-3.5 text-emerald-200 shrink-0 animate-pulse" />
        <div className="flex-1 text-center relative h-5 sm:h-4 overflow-hidden flex items-center justify-center">
          {pinnedNews.map((news, index) => (
            <button
              key={news.id}
              onClick={() => onNavigate('actualite-detail', news.id)}
              className={`absolute w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-500 ease-in-out hover:text-emerald-100 ${
                index === currentIndex 
                  ? 'opacity-100 translate-y-0 z-10' 
                  : 'opacity-0 -translate-y-full z-0 pointer-events-none'
              }`}
            >
              <span className="font-semibold truncate max-w-[200px] sm:max-w-none">
                {news.title}
              </span>
              <span className="flex items-center text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold shrink-0">
                En savoir plus <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

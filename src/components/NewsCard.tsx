import React from 'react';
import { NewsPost } from '../types';
import { Clock, ExternalLink, Megaphone, Briefcase, GraduationCap } from 'lucide-react';

interface NewsCardProps {
  news: NewsPost;
  onClick: (id: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  const isExpiringSoon = () => {
    if (!news.expiresAt) return false;
    const expiresAt = new Date(news.expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  const getCategoryStyles = () => {
    switch (news.category) {
      case 'Éducation & Inscriptions':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: GraduationCap };
      case 'Conseils Carrière':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Briefcase };
      case 'Annonces Officielles':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Megaphone };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Megaphone };
    }
  };

  const styles = getCategoryStyles();
  const Icon = styles.icon;

  return (
    <button
      onClick={() => onClick(news.id)}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 w-full min-w-[280px]"
    >
      {/* Image or Icon placeholder */}
      <div className="w-full h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
        {news.imageUrl ? (
          <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Icon className={`w-12 h-12 opacity-50 ${styles.text}`} />
        )}
        
        {/* Urgent Badge */}
        {isExpiringSoon() && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
            Se termine bientôt
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
            {news.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3 h-3" />
            {news.publishedAtDisplay}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {news.title}
        </h3>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
          {news.summary}
        </p>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
            Lire la suite
          </span>
          {news.externalLink && (
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          )}
        </div>
      </div>
    </button>
  );
};

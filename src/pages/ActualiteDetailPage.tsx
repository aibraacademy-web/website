import React, { useState, useEffect } from 'react';
import { NewsPost } from '../types';
import { supabase } from '../lib/supabaseClient';
import { dbToNewsPost } from '../types';
import { ArrowLeft, Clock, ExternalLink, CalendarDays, Share2, Check } from 'lucide-react';

interface ActualiteDetailPageProps {
  newsId: string;
  onBack: () => void;
}

export const ActualiteDetailPage: React.FC<ActualiteDetailPageProps> = ({ newsId, onBack }) => {
  const [news, setNews] = useState<NewsPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('*')
          .eq('id', newsId)
          .single();

        if (error) throw error;
        if (data) {
          setNews(dbToNewsPost(data));
        }
      } catch (error) {
        console.error('Erreur chargement actualité:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsDetail();
  }, [newsId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Chargement de l'article...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Article introuvable</h2>
        <p className="text-slate-500 mb-6">L'actualité que vous cherchez n'existe plus ou a été retirée.</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux actualités
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-medium mb-8 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Retour aux actualités
        </button>

        {/* Article Container */}
        <article className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header Image */}
          {news.imageUrl && (
            <div className="w-full h-64 sm:h-80 md:h-96 relative">
              <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            </div>
          )}

          <div className="p-6 sm:p-10 lg:p-12">
            
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs sm:text-sm border border-emerald-200">
                {news.category}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm font-medium">
                <Clock className="w-4 h-4" />
                {news.publishedAtDisplay}
              </span>
              {news.expiresAt && (
                <span className="flex items-center gap-1.5 text-orange-600 text-xs sm:text-sm font-medium">
                  <CalendarDays className="w-4 h-4" />
                  Jusqu'au {new Date(news.expiresAt).toLocaleDateString('fr-MA')}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-serif leading-tight mb-8">
              {news.title}
            </h1>

            {/* Content */}
            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-headings:font-serif prose-headings:text-slate-900 prose-strong:text-slate-900">
              <div className="whitespace-pre-line text-slate-700 text-[15px] sm:text-base">
                {news.content}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              {news.externalLink ? (
                <a
                  href={news.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all"
                >
                  En savoir plus
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div /> /* Spacer */
              )}

              <button
                onClick={handleShare}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Lien copié !
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Partager
                  </>
                )}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

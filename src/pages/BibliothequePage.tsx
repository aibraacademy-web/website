import React, { useState, useEffect } from 'react';
import { LibraryFile, LibraryCategory } from '../types';
import { fetchActiveLibraryFiles, incrementFileDownloads } from '../services/libraryService';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Download,
  Loader2
} from 'lucide-react';

export const BibliothequePage: React.FC = () => {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | 'Tous'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      try {
        const data = await fetchActiveLibraryFiles();
        setFiles(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la bibliothèque:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFiles();
  }, []);

  const categories: (LibraryCategory | 'Tous')[] = [
    'Tous',
    'Modèles CV',
    'Guides & Conseils',
    'Documents officiels',
    'Formulaires',
    'Autre'
  ];

  const filteredFiles = files.filter(file => {
    const matchesCategory = activeCategory === 'Tous' || file.category === activeCategory;
    const matchesSearch =
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatFileSize = (kb?: number) => {
    if (!kb) return 'N/A';
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(1)} Mo`;
    }
    return `${kb} Ko`;
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf') {
      return (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
          <FileText className="w-8 h-8" />
        </div>
      );
    }
    if (type === 'docx' || type === 'doc') {
      return (
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
          <FileText className="w-8 h-8" />
        </div>
      );
    }
    if (type === 'xlsx' || type === 'xls') {
      return (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
      );
    }
    if (['png', 'jpg', 'jpeg', 'svg'].includes(type)) {
      return (
        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
          <FileImage className="w-8 h-8" />
        </div>
      );
    }
    return (
      <div className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 shadow-sm">
        <File className="w-8 h-8" />
      </div>
    );
  };

  const handleDownload = async (file: LibraryFile) => {
    try {
      // Incrementation locale instantanée pour un feedback utilisateur optimal
      setFiles(prev =>
        prev.map(f => (f.id === file.id ? { ...f, downloadCount: f.downloadCount + 1 } : f))
      );
      await incrementFileDownloads(file.id);
    } catch (err) {
      console.error('Erreur incrémentation download_count:', err);
    }
    // Déclencher le téléchargement
    window.open(file.fileUrl, '_blank');
  };

  const getCategoryBadgeColor = (category: LibraryCategory) => {
    switch (category) {
      case 'Modèles CV':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Guides & Conseils':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Documents officiels':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Formulaires':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-serif mb-6 leading-tight tracking-tight">
            Bibliothèque de <span className="text-emerald-600">Documents</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Consultez et téléchargez gratuitement nos modèles de CV, guides pratiques et formulaires indispensables pour votre parcours professionnel.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
            {categories.map(cat => (
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
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
            <p className="text-slate-500 font-medium">Chargement de la bibliothèque...</p>
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    {getFileIcon(file.fileType)}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(
                        file.category
                      )}`}
                    >
                      {file.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2 font-serif" title={file.title}>
                    {file.title}
                  </h3>

                  {file.description ? (
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                      {file.description}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-sm italic mb-4 h-10">
                      Aucune description disponible pour ce document.
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 flex flex-col space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase font-mono">
                      {file.fileType} • {formatFileSize(file.fileSizeKb)}
                    </span>
                    <span className="flex items-center text-slate-400 font-medium">
                      ⬇ {file.downloadCount} téléchargement{file.downloadCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownload(file)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm group"
                  >
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun document trouvé</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Nous n'avons trouvé aucun document dans la bibliothèque correspondant à vos critères.
            </p>
            <button
              onClick={() => {
                setActiveCategory('Tous');
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

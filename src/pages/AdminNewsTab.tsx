import React, { useState, useEffect } from 'react';
import { NewsPost, NewsCategory } from '../types';
import { fetchAllNewsPosts, createNewsPost, updateNewsPost, deleteNewsPost, toggleNewsActive } from '../services/newsService';
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const AdminNewsTab: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const initialForm = {
    title: '',
    summary: '',
    content: '',
    category: 'Éducation & Inscriptions' as NewsCategory,
    imageUrl: '',
    externalLink: '',
    isPinned: false,
    publishedAt: new Date().toISOString().slice(0, 16),
    expiresAt: '',
    isActive: true,
  };
  
  const [formData, setFormData] = useState(initialForm);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllNewsPosts();
      setNews(data);
    } catch (error) {
      console.error('Erreur loadNews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleEdit = (post: NewsPost) => {
    setFormData({
      title: post.title,
      summary: post.summary,
      content: post.content,
      category: post.category,
      imageUrl: post.imageUrl || '',
      externalLink: post.externalLink || '',
      isPinned: post.isPinned,
      publishedAt: new Date(post.publishedAt).toISOString().slice(0, 16),
      expiresAt: post.expiresAt ? new Date(post.expiresAt).toISOString().slice(0, 16) : '',
      isActive: post.isActive,
    });
    setEditingId(post.id);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(initialForm);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        externalLink: formData.externalLink || undefined,
        isPinned: formData.isPinned,
        publishedAt: new Date(formData.publishedAt).toISOString(),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        isActive: formData.isActive,
      };

      if (editingId) {
        await updateNewsPost(editingId, payload);
      } else {
        await createNewsPost(payload);
      }
      
      await loadNews();
      handleCancel();
    } catch (error) {
      alert('Erreur lors de la sauvegarde : ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette actualité ?')) return;
    setDeletingId(id);
    try {
      await deleteNewsPost(id);
      setNews(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const updated = await toggleNewsActive(id, !currentStatus);
      setNews(prev => prev.map(n => n.id === id ? updated : n));
    } catch (error) {
      alert('Erreur de changement de statut');
    } finally {
      setTogglingId(null);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Titre de l'actualité *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Résumé (court) *</label>
              <textarea
                required
                rows={2}
                maxLength={200}
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">Sera affiché sur les cards ({formData.summary.length}/200)</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contenu complet *</label>
              <textarea
                required
                rows={8}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Catégorie *</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as NewsCategory })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Éducation & Inscriptions">Éducation & Inscriptions</option>
                <option value="Conseils Carrière">Conseils Carrière</option>
                <option value="Annonces Officielles">Annonces Officielles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">URL de l'image (optionnel)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Lien "En savoir plus" (optionnel)</label>
              <input
                type="url"
                value={formData.externalLink}
                onChange={e => setFormData({ ...formData, externalLink: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date de publication *</label>
              <input
                required
                type="datetime-local"
                value={formData.publishedAt}
                onChange={e => setFormData({ ...formData, publishedAt: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date limite (optionnel)</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-700">Publié (Actif)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-700">📌 Épingler en bandeau</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? 'Mettre à jour' : 'Créer l\'actualité'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Actualités & Informations</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez le contenu informatif (annonces, conseils, etc.).</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Ajouter
        </button>
      </div>
      
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : news.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          Aucune actualité pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Date & Statut</th>
                <th className="px-6 py-4">Épinglé</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {news.map(post => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 truncate max-w-xs">{post.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{post.summary}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isActive ? (
                        <StatusBadge status="approved" />
                      ) : (
                        <StatusBadge status="rejected" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{post.publishedAtDisplay}</div>
                  </td>
                  <td className="px-6 py-4">
                    {post.isPinned ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold">
                        <CheckCircle className="w-3 h-3" /> Oui
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1 text-xs">
                        <XCircle className="w-3 h-3" /> Non
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggle(post.id, post.isActive)}
                        disabled={togglingId === post.id}
                        title={post.isActive ? 'Désactiver' : 'Activer'}
                        className={`p-2 rounded-lg transition-colors border ${
                          post.isActive 
                            ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' 
                            : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {togglingId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : post.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

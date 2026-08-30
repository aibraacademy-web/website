import React, { useState, useEffect } from 'react';
import { LibraryFile, LibraryCategory } from '../types';
import {
  fetchAllLibraryFiles,
  createLibraryFile,
  updateLibraryFile,
  deleteLibraryFile,
  toggleLibraryFileActive,
  uploadLibraryFile
} from '../services/libraryService';
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle, Loader2, Eye, EyeOff, FileText, Upload } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const AdminLibraryTab: React.FC = () => {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    category: 'Modèles CV' as LibraryCategory,
    fileUrl: '',
    fileType: '',
    fileSizeKb: 0,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedType, setDetectedType] = useState('');
  const [detectedSizeKb, setDetectedSizeKb] = useState(0);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllLibraryFiles();
      setFiles(data);
    } catch (error) {
      console.error('Erreur loadFiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10 Mo = 10 * 1024 * 1024 bytes
    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier dépasse la taille maximale autorisée (10 Mo).");
      e.target.value = '';
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const sizeKb = Math.round(file.size / 1024);

    setSelectedFile(file);
    setDetectedType(ext);
    setDetectedSizeKb(sizeKb);
  };

  const handleEdit = (file: LibraryFile) => {
    setFormData({
      title: file.title,
      description: file.description || '',
      category: file.category,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileSizeKb: file.fileSizeKb || 0,
      isActive: file.isActive,
    });
    setEditingId(file.id);
    setSelectedFile(null);
    setDetectedType(file.fileType);
    setDetectedSizeKb(file.fileSizeKb || 0);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(initialForm);
    setEditingId(null);
    setSelectedFile(null);
    setDetectedType('');
    setDetectedSizeKb(0);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalFileUrl = formData.fileUrl;
      let finalFileType = formData.fileType || detectedType;
      let finalFileSizeKb = formData.fileSizeKb || detectedSizeKb;

      // S'il y a un nouveau fichier sélectionné, on l'upload d'abord
      if (selectedFile) {
        finalFileUrl = await uploadLibraryFile(selectedFile);
        finalFileType = detectedType;
        finalFileSizeKb = detectedSizeKb;
      }

      if (!finalFileUrl) {
        throw new Error('Veuillez sélectionner un fichier à uploader.');
      }

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        fileUrl: finalFileUrl,
        fileType: finalFileType,
        fileSizeKb: finalFileSizeKb || undefined,
        isActive: formData.isActive,
      };

      if (editingId) {
        await updateLibraryFile(editingId, payload);
      } else {
        await createLibraryFile(payload);
      }

      await loadFiles();
      handleCancel();
    } catch (error) {
      alert('Erreur lors de la sauvegarde : ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, fileUrl?: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    setDeletingId(id);
    try {
      await deleteLibraryFile(id, fileUrl);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const updated = await toggleLibraryFileActive(id, !currentStatus);
      setFiles(prev => prev.map(f => f.id === id ? updated : f));
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
          <h2 className="text-xl font-bold text-slate-900 font-serif">
            {editingId ? 'Modifier le document' : 'Ajouter un document'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Titre du document *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Modèle de CV Professionnel"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description courte (2 lignes max)</label>
              <textarea
                rows={2}
                maxLength={200}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Un modèle de CV moderne au format DOCX, prêt à remplir pour valoriser vos compétences."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Sera affiché sur les cards ({formData.description.length}/200)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Catégorie *</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as LibraryCategory })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Modèles CV">Modèles CV</option>
                <option value="Guides & Conseils">Guides & Conseils</option>
                <option value="Documents officiels">Documents officiels</option>
                <option value="Formulaires">Formulaires</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {editingId ? 'Changer le fichier (optionnel)' : 'Sélectionner le fichier *'}
              </label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
                <input
                  required={!editingId}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-1 text-slate-500">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">
                    {selectedFile ? selectedFile.name : "Cliquez ou glissez un fichier ici"}
                  </p>
                  <p className="text-xs text-slate-400">PDF, DOCX, XLSX, PNG, JPG jusqu'à 10 Mo</p>
                </div>
              </div>
            </div>

            {(selectedFile || editingId) && (
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3 text-slate-600">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-semibold text-slate-800">Fichier détecté :</span>{' '}
                    <span className="uppercase font-bold bg-slate-200 px-2 py-0.5 rounded text-xs">
                      {detectedType}
                    </span>
                    <span className="ml-3 text-slate-500">
                      Taille : {detectedSizeKb >= 1024 
                        ? `${(detectedSizeKb / 1024).toFixed(1)} Mo` 
                        : `${detectedSizeKb} Ko`}
                    </span>
                  </div>
                </div>
                {formData.fileUrl && !selectedFile && (
                  <a
                    href={formData.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:underline font-semibold"
                  >
                    Voir le fichier actuel
                  </a>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Publier immédiatement le fichier (rendre actif et visible en ligne)
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">Bibliothèque de documents</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez les fichiers téléchargeables disponibles pour les visiteurs.</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialForm);
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Ajouter un fichier
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            Chargement de la bibliothèque...
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Aucun document dans la bibliothèque pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Titre / Description</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Type / Taille</th>
                  <th className="px-6 py-4 text-center">Téléchargements</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {files.map(file => (
                  <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 mb-1">{file.title}</div>
                      {file.description && (
                        <div className="text-xs text-slate-500 line-clamp-1">{file.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {file.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <span className="uppercase text-xs font-extrabold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
                          {file.fileType}
                        </span>
                        <span className="text-xs text-slate-500">
                          {file.fileSizeKb 
                            ? file.fileSizeKb >= 1024 
                              ? `${(file.fileSizeKb / 1024).toFixed(1)} Mo`
                              : `${file.fileSizeKb} Ko`
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700">
                      {file.downloadCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(file.id, file.isActive)}
                        disabled={togglingId === file.id}
                        className="inline-flex items-center focus:outline-none"
                        title={file.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {togglingId === file.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        ) : file.isActive ? (
                          <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                            <Eye className="w-3.5 h-3.5 mr-1" /> Actif
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                            <EyeOff className="w-3.5 h-3.5 mr-1" /> Inactif
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(file)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.fileUrl)}
                          disabled={deletingId === file.id}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          {deletingId === file.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
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
    </div>
  );
};

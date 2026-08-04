import React, { useState } from 'react';
import { JobOffer } from '../types';
import { generateMailtoUrl } from '../services/jobService';
import { 
  X, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Building2, 
  MapPin, 
  Sparkles, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface MailtoModalProps {
  job: JobOffer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MailtoModal: React.FC<MailtoModalProps> = ({ job, isOpen, onClose }) => {
  const [candidateName, setCandidateName] = useState('');
  const [candidateMessage, setCandidateMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  if (!isOpen || !job) return null;

  const mailtoUrl = generateMailtoUrl(job.title, job.contactEmail, candidateName, candidateMessage, job.contactSubject);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(job.contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunchEmail = () => {
    setSentNotice(true);
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Candidature Directe par Email</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold leading-tight text-white font-serif">
            {job.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {job.city}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-500/30">
              {job.contractType}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Email Address Direct Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Email du recruteur :</p>
              <p className="text-sm font-bold text-slate-900 truncate font-mono">{job.contactEmail}</p>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition-all shrink-0"
              title="Copier l'adresse email"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {/* Mail subject preview */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
            <span className="font-bold">Objet de l'email : </span>
            <code className="bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-950 font-semibold font-mono">
              {job.contactSubject ? job.contactSubject : `Candidature - ${job.title}`}
            </code>
          </div>

          {/* Form helper to customize email content */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Votre Nom & Prénom (Optionnel)
              </label>
              <input 
                type="text"
                placeholder="Ex: Youssef El Amrani"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Note / Message d'accompagnement (Optionnel)
              </label>
              <textarea 
                rows={3}
                placeholder="Ex: Titulaire d'une licence en gestion, je vous exprime mon fort intérêt pour ce poste..."
                value={candidateMessage}
                onChange={(e) => setCandidateMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Important Tip */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold">Rappel :</span> N'oubliez pas de joindre votre <strong>CV (format PDF)</strong> dans votre logiciel de messagerie avant d'envoyer l'email.
            </p>
          </div>

          {sentNotice && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-medium text-center">
              🎉 Votre logiciel de messagerie s'ouvre... Si rien ne s'ouvre, vous pouvez utiliser le bouton "Copier" ci-dessus et écrire directement à <span className="font-bold">{job.contactEmail}</span>.
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleLaunchEmail}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-5 rounded-xl text-sm shadow-md transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Ouvrir mon application email</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

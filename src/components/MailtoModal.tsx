import React, { useState } from 'react';
import { JobOffer } from '../types';
import { generateMailtoUrl } from '../services/jobService';
import { submitApplication } from '../services/applicationService';
import { RESEND_DOMAIN_VERIFIED } from '../config/features';
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
  AlertCircle,
  Upload,
  Loader2,
  Zap
} from 'lucide-react';

interface MailtoModalProps {
  job: JobOffer | null;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_CV_BYTES = 5 * 1024 * 1024;

export const MailtoModal: React.FC<MailtoModalProps> = ({ job, isOpen, onClose }) => {
  const [activeMethod, setActiveMethod] = useState<'direct' | 'mailto'>(
    RESEND_DOMAIN_VERIFIED ? 'direct' : 'mailto'
  );
  const [candidateName, setCandidateName] = useState('');
  const [candidateMessage, setCandidateMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const hasContactEmail = Boolean(job.contactEmail && job.contactEmail.trim());
  const mailtoUrl = generateMailtoUrl(job.title, job.contactEmail, candidateName, candidateMessage, job.contactSubject);

  const resetDirectState = () => {
    setCvFile(null);
    setCvError(null);
    setDirectSuccess(false);
    setDirectError(null);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(job.contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunchEmail = () => {
    setSentNotice(true);
    window.open(mailtoUrl, '_blank');
    // Tracking best-effort : ne doit jamais bloquer ni retarder l'ouverture du client mail.
    submitApplication({ method: 'mailto', job, candidateName, candidateMessage }).catch(() => {});
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setCvError('Le CV doit être un fichier PDF.');
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setCvError('Le CV dépasse la taille maximale de 5 Mo.');
      return;
    }
    setCvError(null);
    setCvFile(file);
  };

  const handleSendDirect = async () => {
    if (!cvFile || isSending) return;
    setIsSending(true);
    setDirectError(null);

    const result = await submitApplication({
      method: 'direct',
      job,
      candidateName,
      candidateMessage,
      cvFile,
    });

    setIsSending(false);
    if (result.success) {
      setDirectSuccess(true);
    } else {
      setDirectError(result.error || "L'envoi a échoué.");
    }
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

          {hasContactEmail && (
            /* Method switch */
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => { setActiveMethod('direct'); resetDirectState(); }}
                className={[
                  'relative flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all',
                  activeMethod === 'direct' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Envoyer directement depuis le site
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  Rapide
                </span>
              </button>
              <button
                onClick={() => setActiveMethod('mailto')}
                className={[
                  'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all',
                  activeMethod === 'mailto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Utiliser mon logiciel de messagerie
              </button>
            </div>
          )}

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

          {/* Form helper to customize email content (shared by both methods) */}
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

          {activeMethod === 'direct' && hasContactEmail ? (
            <>
              {/* CV upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  CV (PDF, max 5 Mo) *
                </label>
                {cvFile ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-emerald-300 bg-emerald-50">
                    <span className="flex items-center gap-2 text-xs font-semibold text-emerald-900 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{cvFile.name}</span>
                    </span>
                    <button
                      onClick={() => setCvFile(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-red-600 shrink-0"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 py-5 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer transition-colors text-center">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">Cliquez pour choisir votre CV (PDF)</span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleCvChange} />
                  </label>
                )}
                {cvError && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{cvError}</p>
                )}
              </div>

              {directSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-medium text-center">
                  🎉 Votre candidature a été envoyée avec succès à <span className="font-bold">{job.company}</span> !
                </div>
              ) : (
                <>
                  {directError && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1.5">
                        <p>{directError}</p>
                        <button
                          onClick={() => setActiveMethod('mailto')}
                          className="font-bold text-amber-900 underline underline-offset-2"
                        >
                          Basculer vers l'envoi par email →
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleSendDirect}
                      disabled={!cvFile || isSending}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-xl text-sm shadow-md transition-all active:scale-98"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Envoyer ma candidature</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto px-4 py-3 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

        </div>

      </div>
    </div>
  );
};

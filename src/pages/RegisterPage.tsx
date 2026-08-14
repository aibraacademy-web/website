import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserRole } from '../types';
import { Mail, Lock, User, Briefcase, Loader2, Building2, Upload, Phone, CheckCircle2 } from 'lucide-react';
import { upsertCandidateProfile } from '../services/candidateService';
import { upsertCompanyProfile } from '../services/companyService';
import { uploadCV, uploadLogo } from '../services/storageService';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole | null>(null);

  // Common
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Candidate
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [domaine, setDomaine] = useState('RH');
  const [niveauEtude, setNiveauEtude] = useState('Bac+3');
  const [ville, setVille] = useState('Casablanca');
  const [skills, setSkills] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Company
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Inscription dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }, // Le trigger PostgreSQL créera la ligne dans profiles
        }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      const userId = authData.user.id;

      // 2. Établir la session authentifiée active pour que auth.uid() soit valide pour RLS
      let currentSession = authData.session;
      if (!currentSession) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          console.warn('[RegisterPage] Remarque connexion post-inscription:', signInError.message);
        } else {
          currentSession = signInData.session;
        }
      }

      // 3. Upload des fichiers avec la session authentifiée
      if (role === 'candidat') {
        let cvUrl: string | undefined;
        if (cvFile) {
          try {
            cvUrl = await uploadCV(cvFile, userId);
          } catch (storageErr: any) {
            console.error('[RegisterPage] Erreur upload CV:', storageErr);
            throw new Error(`Le compte a été créé mais l'upload du CV a échoué : ${storageErr.message}`);
          }
        }
        await upsertCandidateProfile(userId, {
          fullName,
          phone,
          domaineSouhaite: domaine,
          niveauEtude,
          ville,
          skills,
          cvUrl
        });
      } else if (role === 'entreprise') {
        let logoUrl: string | undefined;
        if (logoFile) {
          try {
            logoUrl = await uploadLogo(logoFile);
          } catch (storageErr: any) {
            console.error('[RegisterPage] Erreur upload logo:', storageErr);
          }
        }
        await upsertCompanyProfile(userId, {
          companyName,
          description,
          logoUrl,
          phone
        });
      }

      setSuccess(true);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold font-serif text-slate-900 mb-2">Inscription réussie !</h2>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter à votre espace.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold font-serif text-slate-900">
            {step === 1 ? 'Rejoignez Aibra Academy' : 'Création de votre compte'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {step === 1 ? 'Choisissez le type de compte qui vous correspond.' : (
              <span>
                Vous avez déjà un compte ?{' '}
                <button onClick={() => onNavigate('login')} className="font-medium text-emerald-600 hover:text-emerald-500">
                  Connectez-vous
                </button>
              </span>
            )}
          </p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Candidat Card */}
            <button
              onClick={() => handleRoleSelect('candidat')}
              className="relative flex flex-col p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group text-left"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Je cherche un emploi</h3>
              <p className="text-sm text-slate-500 flex-1">
                Créez votre profil, déposez votre CV et postulez aux meilleures offres du marché.
              </p>
            </button>

            {/* Entreprise Card */}
            <button
              onClick={() => handleRoleSelect('entreprise')}
              className="relative flex flex-col p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group text-left"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Je recrute</h3>
              <p className="text-sm text-slate-500 flex-1">
                Publiez vos offres d'emploi et trouvez les meilleurs talents pour votre entreprise.
              </p>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-700">← Retour</button>
              <span className="text-sm text-slate-300">|</span>
              <span className="text-sm font-medium text-emerald-700">
                Profil {role === 'candidat' ? 'Candidat' : 'Entreprise'}
              </span>
            </div>

            <form className="space-y-6" onSubmit={handleRegister}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 py-2.5 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {role === 'candidat' && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Nom & Prénom</label>
                      <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Ville</label>
                      <input type="text" value={ville} onChange={e => setVille(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Casablanca" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Domaine souhaité</label>
                      <select value={domaine} onChange={e => setDomaine(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option value="RH">RH</option>
                        <option value="Comptabilité">Comptabilité</option>
                        <option value="Informatique">Informatique</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Niveau d'étude</label>
                      <select value={niveauEtude} onChange={e => setNiveauEtude(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option value="Bac">Bac</option>
                        <option value="Bac+2">Bac+2</option>
                        <option value="Bac+3">Bac+3</option>
                        <option value="Bac+5">Bac+5</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Compétences (séparées par des virgules)</label>
                      <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: React, Node.js, Anglais" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Upload de CV (PDF)</label>
                      <div className="flex items-center gap-3">
                        <input type="file" id="cv-upload" accept="application/pdf" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                        <label htmlFor="cv-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          {cvFile ? 'Changer le fichier' : 'Sélectionner un fichier PDF'}
                        </label>
                        {cvFile && <span className="text-sm text-slate-500 truncate max-w-[200px]">{cvFile.name}</span>}
                      </div>
                    </div>
                  </>
                )}

                {role === 'entreprise' && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Nom de l'entreprise</label>
                      <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Téléphone de contact</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Logo de l'entreprise</label>
                      <div className="flex items-center gap-3">
                        <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                        <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          {logoFile ? 'Changer le logo' : 'Sélectionner une image'}
                        </label>
                        {logoFile && <span className="text-sm text-slate-500 truncate max-w-[200px]">{logoFile.name}</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Créer mon compte"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

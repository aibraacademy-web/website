import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserRole } from '../types';
import { Mail, Lock, User, Briefcase, Loader2, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { upsertCandidateProfile } from '../services/candidateService';
import { upsertCompanyProfile } from '../services/companyService';
import { useAuth } from '../contexts/AuthContext';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<'role' | 'form' | 'verify'>('role');
  const [role, setRole] = useState<UserRole | null>(null);

  // Common Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Candidate info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [domaine, setDomaine] = useState('RH');
  const [niveauEtude, setNiveauEtude] = useState('Bac+3');
  const [ville, setVille] = useState('Casablanca');

  // Company info
  const [companyName, setCompanyName] = useState('');

  // OTP Verification
  const [otpCode, setOtpCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<null | 'sending' | 'success' | 'error'>(null);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('form');
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

      // 2. Si l'email confirmation est désactivée et la session est active directement
      if (authData.session) {
        if (role === 'candidat') {
          await upsertCandidateProfile(userId, {
            fullName,
            phone,
            domaineSouhaite: domaine,
            niveauEtude,
            ville,
          });
        } else if (role === 'entreprise') {
          await upsertCompanyProfile(userId, {
            companyName,
            phone,
            secteur: domaine,
            ville,
            contactPerson: fullName,
          });
        }
        await refreshProfile();
        onNavigate(role === 'candidat' ? 'candidat-dashboard' : 'entreprise-dashboard');
      } else {
        // Confirmation requise -> Afficher l'écran OTP
        setVerificationEmail(email);
        setStep('verify');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Veuillez entrer le code de confirmation à 6 chiffres.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: verificationEmail,
        token: otpCode,
        type: 'signup'
      });

      if (verifyError) throw verifyError;
      if (!data.user) throw new Error('Erreur de session après vérification.');

      const userId = data.user.id;

      // 3. Créer ou mettre à jour le profil dans la base de données publique
      if (role === 'candidat') {
        await upsertCandidateProfile(userId, {
          fullName,
          phone,
          domaineSouhaite: domaine,
          niveauEtude,
          ville,
        });
      } else if (role === 'entreprise') {
        await upsertCompanyProfile(userId, {
          companyName,
          phone,
          secteur: domaine,
          ville,
          contactPerson: fullName,
        });
      }

      // Rafraîchir le contexte de l'application
      await refreshProfile();

      // Redirection vers le dashboard correspondant
      onNavigate(role === 'candidat' ? 'candidat-dashboard' : 'entreprise-dashboard');
    } catch (err: any) {
      setOtpError(err.message || 'Code de confirmation incorrect ou expiré.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('sending');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail
      });
      if (resendError) throw resendError;
      setResendStatus('success');
    } catch (err: any) {
      console.error('[RegisterPage] Error resending code:', err);
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold font-serif text-slate-900">
            {step === 'role' ? 'Rejoignez Aibra Academy' : 'Création de votre compte'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {step === 'role' ? 'Choisissez le type de compte qui vous correspond.' : (
              <span>
                Vous avez déjà un compte ?{' '}
                <button onClick={() => onNavigate('login')} className="font-medium text-emerald-600 hover:text-emerald-500">
                  Connectez-vous
                </button>
              </span>
            )}
          </p>
        </div>

        {step === 'role' && (
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

        {step === 'form' && (
          <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep('role')} className="text-sm text-slate-500 hover:text-slate-700">← Retour</button>
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
                  </>
                )}

                {role === 'entreprise' && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Nom de l'entreprise *</label>
                      <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Aibra Tech" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Nom du contact RH *</label>
                      <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Karima Benali" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Téléphone de contact</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="+212 6XX XXX XXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Secteur d'activité *</label>
                      <select value={domaine} onChange={e => setDomaine(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option value="Informatique">Informatique / Tech</option>
                        <option value="RH">Ressources Humaines</option>
                        <option value="Comptabilité">Finance & Comptabilité</option>
                        <option value="Marketing">Marketing & Communication</option>
                        <option value="Mécanique">Ingénierie & Industrie</option>
                        <option value="Administration">Administration & Services</option>
                        <option value="Agriculture">Agroalimentaire</option>
                        <option value="Autre">Autre secteur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Ville / Siège social *</label>
                      <select value={ville} onChange={e => setVille(e.target.value)} className="mt-1 block w-full py-2.5 px-3 sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                        {['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Agadir', 'Fès', 'Oujda', 'Meknès', 'El Jadida', 'Kénitra', 'Tétouan', 'Nador', 'Autre ville'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
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

        {step === 'verify' && (
          <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-10">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setStep('form')} 
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Modifier mes informations
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Vérifiez votre adresse email</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Un code de confirmation a été envoyé à l'adresse <strong className="text-slate-800">{verificationEmail}</strong>. Veuillez le saisir ci-dessous pour activer votre compte.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {otpError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 text-center mb-2">
                  Code de confirmation (6 chiffres)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="block w-full max-w-[200px] mx-auto text-center py-3 text-2xl font-bold tracking-[8px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Confirmer mon compte"
                )}
              </button>

              <div className="text-center pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-500">Vous n'avez pas reçu le code ? </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendStatus === 'sending'}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
                >
                  {resendStatus === 'sending' ? 'Envoi...' : 'Renvoyer le code'}
                </button>
                {resendStatus === 'success' && (
                  <p className="mt-2 text-xs text-emerald-600 font-medium">Un nouveau code a été envoyé !</p>
                )}
                {resendStatus === 'error' && (
                  <p className="mt-2 text-xs text-red-600 font-medium">Erreur lors de l'envoi du code. Veuillez réessayer.</p>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

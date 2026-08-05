import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AdminLoginPageProps {
  onLogin: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      console.log('--- DIAGNOSTIC SUPABASE AUTH ---');
      console.log('Email soumis :', `"${trimmedEmail}"`);
      console.log('Mot de passe soumis :', `"${trimmedPassword}"`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        console.error('Erreur Supabase Auth détaillée :', error);
        setErrorMsg('Email ou mot de passe incorrect.');
      } else if (data.session) {
        onLogin();
      }
    } catch (err: unknown) {
      setErrorMsg('Une erreur est survenue lors de la connexion.');
      console.error('Exception capturée :', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-serif">
          Espace Administrateur
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Accès sécurisé pour la gestion des offres
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-4 py-3 border ${errorMsg ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'} rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="admin@aibraacademy.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                Mot de passe
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-4 py-3 border ${errorMsg ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'} rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="••••••••"
                />
              </div>
              {errorMsg && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> {errorMsg}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all active:scale-98 items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

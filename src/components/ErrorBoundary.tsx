import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Erreur Critique</h1>
            <p className="text-slate-600 text-sm mb-6">
              L'application n'a pas pu se charger correctement. Cela est souvent dû à une configuration manquante (ex: Variables d'environnement sur Vercel).
            </p>
            <div className="bg-slate-100 text-slate-800 p-4 rounded-lg text-left text-xs font-mono overflow-auto max-h-40 break-all">
              {this.state.error?.message || 'Erreur inconnue'}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

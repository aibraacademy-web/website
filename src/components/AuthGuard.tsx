import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onRedirect: (tab: string) => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles, onRedirect }) => {
  const { profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!profile) {
        onRedirect('login');
      } else if (allowedRoles && !allowedRoles.includes(profile.role)) {
        onRedirect('home');
      }
    }
  }, [isLoading, profile, allowedRoles, onRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile || (allowedRoles && !allowedRoles.includes(profile.role))) {
    return null;
  }

  return <>{children}</>;
};

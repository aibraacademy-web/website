import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Profile, Candidate, Company } from '../types';
import { getCurrentProfile } from '../services/authService';
import { getCandidateProfile } from '../services/candidateService';
import { getCompanyProfile } from '../services/companyService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  candidate: Candidate | null;
  company: Company | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  candidate: null,
  company: null,
  isLoading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (currentSession: Session | null) => {
    setIsLoading(true);
    setSession(currentSession);
    setUser(currentSession?.user || null);

    if (currentSession?.user) {
      const p = await getCurrentProfile();
      setProfile(p);

      if (p?.role === 'candidat') {
        const c = await getCandidateProfile(currentSession.user.id);
        setCandidate(c);
        setCompany(null);
      } else if (p?.role === 'entreprise') {
        const c = await getCompanyProfile(currentSession.user.id);
        setCompany(c);
        setCandidate(null);
      } else {
        setCandidate(null);
        setCompany(null);
      }
    } else {
      setProfile(null);
      setCandidate(null);
      setCompany(null);
    }
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getSession();
    await loadUserData(data.session);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setCandidate(null);
    setCompany(null);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) loadUserData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) loadUserData(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, candidate, company, isLoading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

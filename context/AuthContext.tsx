import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (isAdmin?: boolean) => void;
  logout: () => void;
  authorizeSection: (sectionName: string) => void;
  isSectionAuthorized: (sectionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'andalus_auth_state';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse auth state", e);
      }
    }
    return {
      isAuthenticated: false,
      isAdmin: false,
      authorizedSections: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  }, [state]);

  const login = (isAdmin: boolean = false) => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      isAdmin: isAdmin,
    }));
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      isAdmin: false,
      authorizedSections: [],
    });
    localStorage.removeItem(AUTH_KEY);
  };

  const authorizeSection = (sectionName: string) => {
    setState(prev => {
      if (prev.authorizedSections.includes(sectionName)) return prev;
      return {
        ...prev,
        authorizedSections: [...prev.authorizedSections, sectionName],
      };
    });
  };

  const isSectionAuthorized = (sectionName: string) => {
    if (state.isAdmin) return true;
    return state.authorizedSections.includes(sectionName);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, authorizeSection, isSectionAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

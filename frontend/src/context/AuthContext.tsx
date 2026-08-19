import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface IUser {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isOnboarded: boolean;
  role?: 'student' | 'admin';
  onboarding?: any;
  aiProfile?: any;
  careerRecommendations?: any;
}

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: IUser, refreshToken?: string) => void;
  signup: (token: string, user: IUser, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: IUser) => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ai_mentor_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, userData: IUser, newRefreshToken?: string) => {
    localStorage.setItem('ai_mentor_token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('ai_mentor_refresh_token', newRefreshToken);
    }
    setToken(newToken);
    setUser(userData);
  };

  const signup = (newToken: string, userData: IUser, newRefreshToken?: string) => {
    localStorage.setItem('ai_mentor_token', newToken);
    if (newRefreshToken) {
      localStorage.setItem('ai_mentor_refresh_token', newRefreshToken);
    }
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('ai_mentor_token');
    localStorage.removeItem('ai_mentor_refresh_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData: IUser) => {
    setUser(updatedUserData);
  };

  const checkSession = async () => {
    const currentToken = localStorage.getItem('ai_mentor_token');
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get('/auth/me');
      if (res.data && res.data.user) {
        setUser({
          id: res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          isVerified: res.data.user.isVerified,
          isOnboarded: res.data.user.isOnboarded,
          onboarding: res.data.user.onboarding,
        });
      } else {
        logout();
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

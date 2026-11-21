import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  theme: 'light' | 'dark';
  language: string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, language?: string, wellness_goal?: string) => Promise<void>;
  logout: () => void;
  setLanguage: (lang: string) => void;
  toggleTheme: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wellness_token') || 'guest_user');
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('wellness_theme') as 'light' | 'dark') || 'light');
  const [language, setLanguageState] = useState<string>(localStorage.getItem('wellness_language') || 'en');

  // Sync theme with DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('wellness_theme', theme);
  }, [theme]);

  // Auth fetch wrapper with user ID header
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('x-user-id', token);
    }
    return fetch(url, {
      ...options,
      headers
    });
  };

  // Load initial user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user?.preferred_language) {
            setLanguageState(data.user.preferred_language);
          }
        }
      } catch (e) {
        console.error('Failed to load user info', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('wellness_token', data.token);
    if (data.user.preferred_language) {
      setLanguageState(data.user.preferred_language);
    }
  };

  const register = async (name: string, email: string, password: string, preferred_language = 'en', wellness_goal = 'Mental wellbeing') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, preferred_language, wellness_goal })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('wellness_token', data.token);
    setLanguageState(preferred_language);
  };

  const logout = () => {
    setUser(null);
    setToken('guest_user');
    localStorage.removeItem('wellness_token');
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('wellness_language', lang);
    if (user && user.id !== 'guest_user') {
      authFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_language: lang })
      }).catch(console.error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await authFetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const result = await res.json();
      setUser(result.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        language,
        login,
        register,
        logout,
        setLanguage,
        toggleTheme,
        updateProfile,
        authFetch
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

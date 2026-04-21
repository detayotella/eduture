import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { refreshSession, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshSession();
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();

    const handleAuthInvalidated = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('eduture-auth-invalidated', handleAuthInvalidated);
    return () => window.removeEventListener('eduture-auth-invalidated', handleAuthInvalidated);
  }, []);

  const saveAuth = (payload) => {
    setAccessToken(payload.access_token);
    const userPayload = {
      learner_id: payload.learner_id,
      email: payload.email,
      full_name: payload.full_name,
      avatar_url: payload.avatar_url || null,
      is_admin: Boolean(payload.is_admin),
    };
    setUser(userPayload);
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    saveAuth(response.data.data);
    return response.data.data;
  };

  const register = async (full_name, email, password) => {
    const response = await api.post('/auth/register', { full_name, email, password });
    saveAuth(response.data.data);
    return response.data.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // The local session still needs to be cleared even if revocation fails.
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

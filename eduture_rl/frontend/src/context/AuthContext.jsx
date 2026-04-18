import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('eduture_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('eduture_access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
        localStorage.setItem('eduture_user', JSON.stringify(response.data.data));
      } catch {
        setUser(null);
        localStorage.removeItem('eduture_access_token');
        localStorage.removeItem('eduture_refresh_token');
        localStorage.removeItem('eduture_user');
        localStorage.removeItem('eduture_learner_id');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const saveAuth = (payload) => {
    localStorage.setItem('eduture_access_token', payload.access_token);
    localStorage.setItem('eduture_refresh_token', payload.refresh_token);
    localStorage.setItem('eduture_learner_id', String(payload.learner_id));
    const userPayload = {
      learner_id: payload.learner_id,
      email: payload.email,
      full_name: payload.full_name,
      is_admin: Boolean(payload.is_admin),
    };
    localStorage.setItem('eduture_user', JSON.stringify(userPayload));
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

  const logout = () => {
    localStorage.removeItem('eduture_access_token');
    localStorage.removeItem('eduture_refresh_token');
    localStorage.removeItem('eduture_user');
    localStorage.removeItem('eduture_learner_id');
    setUser(null);
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

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('careeros_token'));
  const [loading, setLoading] = useState(Boolean(token));

  const applyAuth = (data) => {
    localStorage.setItem('careeros_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    const data = await authApi.login(payload);
    applyAuth(data);
  };

  const guestLogin = async () => {
    const data = await authApi.guestLogin();
    applyAuth(data);
  };

  const signup = async (payload) => {
    const data = await authApi.signup(payload);
    applyAuth(data);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('careeros_token');
    setToken(null);
    setUser(null);
  };

  const fetchMe = async () => {
    if (!localStorage.getItem('careeros_token')) {
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      localStorage.removeItem('careeros_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('careeros:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('careeros:auth-expired', handleAuthExpired);
  }, []);

  const value = useMemo(() => ({ user, token, loading, isAuthenticated: Boolean(user && token), login, guestLogin, signup, logout, fetchMe }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

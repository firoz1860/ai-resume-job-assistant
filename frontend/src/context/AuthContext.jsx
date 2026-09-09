import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'careeros_token';
const USER_KEY = 'careeros_user';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  // Rehydrate the last-known user synchronously so returning visitors are
  // authenticated instantly — no full-screen spinner while /me round-trips
  // (which can be very slow on a cold-started backend).
  const [user, setUser] = useState(() => (localStorage.getItem(TOKEN_KEY) ? readStoredUser() : null));
  // Only block the UI when we have a token but NO cached user to render yet.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)) && !readStoredUser());

  const applyAuth = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
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
    clearAuth();
  };

  // Validate/refresh the session in the background. With a cached user already
  // rendered, this never blocks the UI; it only corrects state if the token is
  // stale (401 clears it) or the user record changed server-side.
  const fetchMe = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuth();
      setLoading(false);
    };
    window.addEventListener('careeros:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('careeros:auth-expired', handleAuthExpired);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: Boolean(user && token), login, guestLogin, signup, logout, fetchMe }),
    [user, token, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

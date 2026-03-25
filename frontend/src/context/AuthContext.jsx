import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../api/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('ibr_token');
    const stored = localStorage.getItem('ibr_user');
    if (token && stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  // ✅ KEY FIX: AuthModal makes its own API call, then calls storeAuth(user, token)
  // to commit the already-resolved data to state — no second API call needed.
  const storeAuth = useCallback((user, token) => {
    if (!user || !token) return null;
    localStorage.setItem('ibr_token', token);
    localStorage.setItem('ibr_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  }, []);

  // Legacy login — makes its own API call (username/password direct login)
  const login = useCallback(async (usernameOrUser, passwordOrToken) => {
    // If called with an object (user) + string (token), just store directly
    if (typeof usernameOrUser === 'object' && typeof passwordOrToken === 'string') {
      return storeAuth(usernameOrUser, passwordOrToken);
    }
    // Otherwise do a full API call
    const res = await authAPI.login({ username: usernameOrUser, password: passwordOrToken });
    const { token, user } = res.data;
    return storeAuth(user, token);
  }, [storeAuth]);

  const register = useCallback(async (email, username, password = 'IBRpublic123') => {
    const res = await authAPI.register({ email, username, password });
    const { token, user } = res.data;
    return storeAuth(user, token);
  }, [storeAuth]);

  const requestAdminOTP = useCallback(async (phone) => {
    try {
      await authAPI.requestAdminOTP(phone);
      return true;
    } catch { return false; }
  }, []);

  const verifyAdminOTP = useCallback(async (otp) => {
    try {
      await authAPI.verifyAdminOTP(otp);
      return true;
    } catch { return false; }
  }, []);

  const createAdmin = useCallback(async (username, email) => {
    const res = await authAPI.createAdmin({ username, email });
    const { token, user } = res.data;
    return storeAuth(user, token);
  }, [storeAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('ibr_token');
    localStorage.removeItem('ibr_user');
    setCurrentUser(null);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, storeAuth, register, logout, isAdmin, requestAdminOTP, verifyAdminOTP, createAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

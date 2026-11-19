import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginStudent, validateSession, logoutStudent } from '../services/authService';
import { storage } from '../lib/storage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    validateSession()
      .then((u) => {
        if (mounted) setUser(u);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const result = await loginStudent(email, password);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    try {
      await logoutStudent();
    } finally {
      setUser(null);
      storage.clearAuth();
    }
  };

  const setIsOnboarded = useCallback((onboarded) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, isOnboarded: !!onboarded };
      storage.setUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setIsOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

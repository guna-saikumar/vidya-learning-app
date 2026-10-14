import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/auth';
import {
  DEFAULT_ADMIN,
  getStoredSession,
  getStoredToken,
  saveStoredSession,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  verifyAdminEmail,
  forgotAdminPassword,
  resetAdminPassword,
  getApiClient,
} from '../services/authService';

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  updateProfile: (updated: Partial<AdminUser>) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; department?: string }) => Promise<{ message: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ message: string }>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (data: { email: string; otp: string; newPassword: string }) => Promise<{ message: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  updateProfile: async () => {},
  login: async () => {},
  register: async () => ({ message: '' }),
  verifyEmail: async () => ({ message: '' }),
  forgotPassword: async () => ({ message: '' }),
  resetPassword: async () => ({ message: '' }),
  logout: async () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getStoredToken();
        const storedUser = await getStoredSession();
        if (storedToken && storedUser) {
          const normalized: AdminUser = { ...storedUser, role: 'Admin' };
          setUser(normalized);
          setToken(storedToken);
          getApiClient().setAuthToken(storedToken);
        } else {
          // If no stored auth, user is unauthenticated
          setUser(null);
          setToken(null);
          getApiClient().setAuthToken(null);
        }
      } catch (err) {
        console.warn('Failed to load admin auth session:', err);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { token: nextToken, user: nextUser } = await loginAdmin(email, pass);
      setToken(nextToken);
      setUser(nextUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; department?: string }) => {
    return registerAdmin(data);
  };

  const verifyEmail = async (email: string, otp: string) => {
    return verifyAdminEmail(email, otp);
  };

  const forgotPassword = async (email: string) => {
    return forgotAdminPassword(email);
  };

  const resetPassword = async (data: { email: string; otp: string; newPassword: string }) => {
    return resetAdminPassword(data);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutAdmin();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<AdminUser>) => {
    if (!user) return;
    const nextUser: AdminUser = { ...user, ...updated, role: 'Admin' };
    setUser(nextUser);
    await saveStoredSession(nextUser);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        updateProfile,
        login,
        register,
        verifyEmail,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

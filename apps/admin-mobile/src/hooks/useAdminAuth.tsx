import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/auth';
import { DEFAULT_ADMIN, getStoredSession, saveStoredSession } from '../services/authService';

interface AdminAuthContextType {
  user: AdminUser;
  loading: boolean;
  updateProfile: (updated: Partial<AdminUser>) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: DEFAULT_ADMIN,
  loading: false,
  updateProfile: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser>(DEFAULT_ADMIN);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await getStoredSession();
        const normalized: AdminUser = { ...stored, role: 'Admin' };
        setUser(normalized);
        if (stored.role !== 'Admin') {
          await saveStoredSession(normalized);
        }
      } catch (err) {
        console.warn('Failed to load admin profile on init:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateProfile = async (updated: Partial<AdminUser>) => {
    const nextUser: AdminUser = { ...user, ...updated, role: 'Admin' };
    setUser(nextUser);
    await saveStoredSession(nextUser);
  };

  const login = async () => {};
  const logout = async () => {};

  return (
    <AdminAuthContext.Provider value={{ user, loading, updateProfile, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);


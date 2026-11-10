import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { AuthUser } from '../types/auth';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginUserThunk,
  checkSessionThunk,
  logoutUserThunk,
  forceLogout,
} from '../store/slices/authSlice';
import { fetchProfileThunk } from '../store/slices/studentSlice';
import { fetchProgressThunk, fetchBookmarksThunk } from '../store/slices/progressSlice';
import { fetchNotificationsThunk } from '../store/slices/notificationsSlice';
import { resetLearningProgressCache } from './useLearningProgress';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isOnboarded, loading, error } = useAppSelector(
    (state) => state.auth
  );

  const initSession = useCallback(async () => {
    const res = await dispatch(checkSessionThunk());
    if (checkSessionThunk.fulfilled.match(res) && res.payload) {
      void Promise.allSettled([
        dispatch(fetchProfileThunk()),
        dispatch(fetchProgressThunk()),
        dispatch(fetchBookmarksThunk()),
        dispatch(fetchNotificationsThunk()),
      ]);
    }
  }, [dispatch]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const login = async (email: string, pass: string) => {
    resetLearningProgressCache();
    const result = await dispatch(loginUserThunk({ email, pass }));
    if (loginUserThunk.rejected.match(result)) {
      throw new Error((result.payload as string) || 'Login failed');
    }
    await Promise.allSettled([
      dispatch(fetchProfileThunk()),
      dispatch(fetchProgressThunk()),
      dispatch(fetchBookmarksThunk()),
      dispatch(fetchNotificationsThunk()),
    ]);
  };

  const logout = async () => {
    resetLearningProgressCache();
    dispatch(forceLogout());
    await dispatch(logoutUserThunk());
  };

  const refreshSession = async () => {
    await initSession();
  };

  const value: AuthContextType = {
    user: user as AuthUser | null,
    token,
    isAuthenticated,
    isOnboarded,
    loading,
    error,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

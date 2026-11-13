import axios from 'axios';
import { storage } from './storage';

const envBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  import.meta.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = (envBase || 'http://localhost:4000').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const isAuthEndpoint = (url) =>
  !!url && (url.includes('/api/v1/auth/login') ||
    url.includes('/api/v1/auth/refresh') ||
    url.includes('/api/v1/auth/logout'));

apiClient.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (
    config.data &&
    !(config.data instanceof FormData) &&
    !config.headers?.['Content-Type']
  ) {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefresh } = res.data;
      storage.setAccessToken(accessToken);
      storage.setRefreshToken(newRefresh);
      return accessToken;
    } catch {
      storage.clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      // redirect to login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(err) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (err.response?.status === 401) return 'Unauthorized. Please sign in again.';
    if (err.response?.status === 403) return 'You do not have permission to perform this action.';
    if (err.response?.status === 404) return 'Requested resource was not found.';
    if (err.response?.status && err.response.status >= 500) return 'Server error. Please try again later.';
    if (err.code === 'ECONNABORTED') return 'Request timed out. Is the API reachable?';
    return err.message || 'Request failed';
  }
  if (err instanceof Error) return err.message;
  return 'Request failed';
}


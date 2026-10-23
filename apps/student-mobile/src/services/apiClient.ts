import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveApiBaseUrl, hostFromExpoUri } from '@vidya/api-client';

export const AUTH_TOKEN_KEY = '@vidya_student_auth_token';
export const AUTH_REFRESH_TOKEN_KEY = '@vidya_student_refresh_token';
export const AUTH_USER_KEY = '@vidya_student_user';

const getDevHost = (): string | null => {
  try {
    const Constants = require('expo-constants').default;
    return (
      hostFromExpoUri(Constants.expoConfig?.hostUri) ||
      hostFromExpoUri(Constants.experienceUrl) ||
      null
    );
  } catch {
    return null;
  }
};

export const getApiBaseUrl = (): string => {
  return resolveApiBaseUrl({
    envUrl: process.env.EXPO_PUBLIC_API_URL,
    platformOS: Platform.OS,
    expoDevHost: getDevHost(),
  });
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach bearer token to outgoing requests
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore storage read failure
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh on 401 response
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshRes = await axios.post(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = refreshRes.data;
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        if (newRefresh) {
          await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, newRefresh);
        }

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY, AUTH_USER_KEY]);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// Typed API Endpoints for Backend Services
// -------------------------------------------------------------

export const authApi = {
  login: async (email: string, pass: string) => {
    const res = await axiosInstance.post('/api/v1/auth/login', { email, password: pass });
    return res.data;
  },
  me: async () => {
    const res = await axiosInstance.get('/api/v1/auth/me');
    return res.data;
  },
  refresh: async (refreshToken: string) => {
    const res = await axiosInstance.post('/api/v1/auth/refresh', { refreshToken });
    return res.data;
  },
  logout: async (refreshToken?: string) => {
    try {
      await axiosInstance.post('/api/v1/auth/logout', { refreshToken });
    } catch {
      // ignore logout errors
    }
  },
};

export const studentsApi = {
  getProfile: async () => {
    const res = await axiosInstance.get('/api/v1/students/me/profile');
    return res.data;
  },
  submitOnboarding: async (data: Record<string, any>) => {
    const res = await axiosInstance.put('/api/v1/students/me/onboarding', data);
    return res.data;
  },
  updateProfile: async (data: Record<string, any>) => {
    const res = await axiosInstance.patch('/api/v1/students/me/profile', data);
    return res.data;
  },
  uploadAvatar: async (uri: string, name = 'avatar.jpg', type = 'image/jpeg') => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name,
      type,
    } as any);

    const res = await axiosInstance.post('/api/v1/students/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  deleteAvatar: async () => {
    const res = await axiosInstance.delete('/api/v1/students/me/avatar');
    return res.data;
  },
  updateSettings: async (settings: { language?: 'en' | 'te'; notificationsEnabled?: boolean }) => {
    const res = await axiosInstance.patch('/api/v1/students/me/settings', settings);
    return res.data;
  },
  getProgress: async () => {
    const res = await axiosInstance.get('/api/v1/students/me/progress');
    return res.data;
  },
  updateProgress: async (
    chapterId: string,
    body: { progressPercent: number; completed: boolean; sectionId?: string }
  ) => {
    const res = await axiosInstance.put(`/api/v1/students/me/progress/${chapterId}`, body);
    return res.data;
  },
  getBookmarks: async () => {
    const res = await axiosInstance.get('/api/v1/students/me/bookmarks');
    return res.data;
  },
  addBookmark: async (body: { chapterId: string; sectionId?: string; previewText?: string }) => {
    const res = await axiosInstance.post('/api/v1/students/me/bookmarks', body);
    return res.data;
  },
  deleteBookmark: async (bookmarkId: string) => {
    const res = await axiosInstance.delete(`/api/v1/students/me/bookmarks/${bookmarkId}`);
    return res.data;
  },
  deleteBookmarkBySection: async (sectionId: string) => {
    const res = await axiosInstance.delete(`/api/v1/students/me/bookmarks/by-section/${sectionId}`);
    return res.data;
  },
};

export const schoolsApi = {
  getSchools: async (query?: string, district?: string) => {
    const params: Record<string, any> = {};
    if (query) params.q = query;
    if (district) params.district = district;
    const res = await axiosInstance.get('/api/v1/schools', { params });
    return res.data;
  },
  getSchoolById: async (id: string) => {
    const res = await axiosInstance.get(`/api/v1/schools/${id}`);
    return res.data;
  },
};

export const curriculumApi = {
  getClasses: async () => {
    const res = await axiosInstance.get('/api/v1/curriculum/classes');
    return res.data;
  },
  getSubjectsByClass: async (classId: string) => {
    const res = await axiosInstance.get(`/api/v1/curriculum/classes/${classId}/subjects`);
    return res.data;
  },
  getSubjectById: async (subjectId: string) => {
    const res = await axiosInstance.get(`/api/v1/curriculum/subjects/${subjectId}`);
    return res.data;
  },
  getChapterById: async (chapterId: string) => {
    const res = await axiosInstance.get(`/api/v1/curriculum/chapters/${chapterId}`);
    return res.data;
  },
  getSectionById: async (sectionId: string) => {
    const res = await axiosInstance.get(`/api/v1/curriculum/sections/${sectionId}`);
    return res.data;
  },
};

export const notificationsApi = {
  getNotifications: async () => {
    const res = await axiosInstance.get('/api/v1/notifications');
    return res.data;
  },
  getNotificationById: async (id: string) => {
    const res = await axiosInstance.get(`/api/v1/notifications/${id}`);
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await axiosInstance.patch(`/api/v1/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await axiosInstance.post('/api/v1/notifications/read-all');
    return res.data;
  },
};

export default axiosInstance;

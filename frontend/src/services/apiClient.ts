import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveApiBaseUrl, hostFromExpoUri } from '../api-client';

export const AUTH_TOKEN_KEY = '@vidya_student_auth_token';
export const AUTH_REFRESH_TOKEN_KEY = '@vidya_student_refresh_token';
export const AUTH_USER_KEY = '@vidya_student_user';

const getPlatformOS = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native');
    return rn?.Platform?.OS || 'web';
  } catch {
    return 'web';
  }
};

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
    platformOS: getPlatformOS(),
    expoDevHost: getDevHost(),
  });
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Converts Axios/API errors into a message that can be shown to the user. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (isRecord(data)) {
      if (Array.isArray(data.details)) {
        const first = data.details.find(
          (item) => isRecord(item) && typeof item.message === 'string' && item.message.trim()
        );
        if (first && isRecord(first) && typeof first.message === 'string') {
          return first.message;
        }
      }
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }
    if (!error.response) {
      return 'Cannot reach the server. Check your internet connection.';
    }
    if (error.response.status >= 500) {
      return 'The server could not complete the request. Please try again.';
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

/** True when the request never reached the server (offline, DNS, timeout). */
export function isOfflineError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

/** True when the server answered with a specific HTTP status. */
export function isApiStatusError(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}

export type ApiBookmarkType = 'chapter' | 'section' | 'formula';

/** Bookmark DTO returned by `GET/POST /api/v1/students/me/bookmarks`. */
export interface ApiBookmark {
  id: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  sectionId?: string | null;
  title: string;
  subtitle?: string | null;
  type: ApiBookmarkType;
  previewText?: string | null;
  dateAdded?: string;
  createdAt?: string;
}

export interface AddBookmarkBody {
  chapterId: string;
  sectionId?: string;
  type: ApiBookmarkType;
  title?: string;
  subtitle?: string;
  previewText?: string;
}

export interface BookmarkMutationResponse {
  success: boolean;
  bookmark: ApiBookmark;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let inMemoryAccessToken: string | null = null;

export const setApiAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

// Attach bearer token to outgoing requests
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = inMemoryAccessToken;
    if (!token) {
      try {
        token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) inMemoryAccessToken = token;
      } catch (e) {
        // ignore storage read failure
      }
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh on 401 response
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];
let onAuthCleared: (() => void) | null = null;

/** Wire Redux (or other) logout when refresh clears stored tokens. */
export function setOnAuthCleared(handler: (() => void) | null): void {
  onAuthCleared = handler;
}

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
    const requestUrl = (originalRequest?.url || '').toLowerCase();
    const isAuthRoute =
      requestUrl.includes('/api/v1/auth/login') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/api/v1/auth/refresh') ||
      requestUrl.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
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
        onAuthCleared?.();
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
    const isWeb = getPlatformOS() === 'web';
    if (isWeb) {
      let fileBlob: Blob;
      if (uri.startsWith('data:')) {
        const parts = uri.split(',');
        const mime = /data:(.*?);base64/.exec(parts[0])?.[1] || type;
        const binary = atob(parts[1]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        fileBlob = new Blob([bytes], { type: mime });
      } else {
        const fetchRes = await fetch(uri);
        fileBlob = await fetchRes.blob();
      }
      formData.append('file', fileBlob, name);
    } else {
      formData.append('file', {
        uri,
        name,
        type,
      } as any);
    }

    const res = await axiosInstance.post('/api/v1/students/me/avatar', formData, {
      headers: {
        'Content-Type': isWeb ? undefined : 'multipart/form-data',
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
    body: {
      progressPercent: number;
      completed: boolean;
      sectionId?: string;
      completedSections?: string[];
    }
  ) => {
    const res = await axiosInstance.put(`/api/v1/students/me/progress/${chapterId}`, body);
    return res.data;
  },
  getBookmarks: async (): Promise<ApiBookmark[]> => {
    const res = await axiosInstance.get<ApiBookmark[]>('/api/v1/students/me/bookmarks');
    return res.data;
  },
  addBookmark: async (body: AddBookmarkBody): Promise<BookmarkMutationResponse> => {
    const res = await axiosInstance.post<BookmarkMutationResponse>(
      '/api/v1/students/me/bookmarks',
      body
    );
    return res.data;
  },
  deleteBookmark: async (bookmarkId: string): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(
      `/api/v1/students/me/bookmarks/${encodeURIComponent(bookmarkId)}`
    );
    return res.data;
  },
  deleteBookmarkBySection: async (sectionId: string): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(
      `/api/v1/students/me/bookmarks/by-section/${encodeURIComponent(sectionId)}`
    );
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

export interface ComplaintPayload {
  full_name: string;
  class_grade: number;
  section?: string;
  roll_number?: string;
  email?: string;
  phone?: string;
  category: string;
  subject: string;
  message: string;
  source?: 'mobile' | 'web';
}

export interface SupportConfig {
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
}

export const supportApi = {
  getSupportConfig: async (): Promise<SupportConfig> => {
    const res = await axiosInstance.get('/api/v1/support/config');
    return res.data;
  },
  fileComplaint: async (payload: ComplaintPayload) => {
    const res = await axiosInstance.post('/api/v1/support/complaints', payload);
    return res.data;
  },
  getMyComplaints: async () => {
    const res = await axiosInstance.get('/api/v1/support/my-complaints');
    return res.data;
  },
  getComplaintByRef: async (ticketRef: string) => {
    const res = await axiosInstance.get(`/api/v1/support/complaints/${ticketRef}`);
    return res.data;
  },
};

export default axiosInstance;

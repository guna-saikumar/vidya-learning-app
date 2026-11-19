const ACCESS_TOKEN_KEY = 'vidya_access_token';
const REFRESH_TOKEN_KEY = 'vidya_refresh_token';
const USER_KEY = 'vidya_user';

export const storage = {
  getAccessToken: () => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setAccessToken: (token) => {
    try {
      if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
      else localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
  getRefreshToken: () => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setRefreshToken: (token) => {
    try {
      if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
      else localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
  clearAuth: () => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('@vidya_web_chapter_progress');
      localStorage.removeItem('@vidya_web_bookmarks');
      // Also clear any legacy keys or sessionStorage
      sessionStorage.clear();
    } catch {
      // ignore
    }
  },
};

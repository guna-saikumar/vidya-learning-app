import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authApi,
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_USER_KEY,
} from '../../services/apiClient';

export interface AuthUserState {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthState {
  user: AuthUserState | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isOnboarded: false,
  loading: true,
  error: null,
};

type StoredAuthUser = AuthUserState & { isOnboarded?: boolean };

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async ({ email, pass }: { email: string; pass: string }, { rejectWithValue }) => {
    try {
      const loginRes = await authApi.login(email, pass);
      const { accessToken, refreshToken } = loginRes;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
      }

      const meRes = await authApi.me();
      const stored: StoredAuthUser = {
        ...meRes.user,
        isOnboarded: !!meRes.isOnboarded,
      };
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(stored));

      return {
        accessToken,
        refreshToken,
        user: meRes.user,
        isOnboarded: !!meRes.isOnboarded,
      };
    } catch (err: any) {
      // Login wrote tokens before /me — clear orphans on any failure.
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY, AUTH_USER_KEY]);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Login failed';
      return rejectWithValue(typeof msg === 'string' ? msg : 'Login failed');
    }
  }
);

export const checkSessionThunk = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      return null;
    }

    const refresh = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    const storedRaw = await AsyncStorage.getItem(AUTH_USER_KEY);
    let stored: StoredAuthUser | null = null;
    try {
      stored = storedRaw ? (JSON.parse(storedRaw) as StoredAuthUser) : null;
    } catch {
      stored = null;
    }

    try {
      const meRes = await authApi.me();
      const user = meRes.user || stored;
      const isOnboarded = !!meRes.isOnboarded;
      if (user) {
        await AsyncStorage.setItem(
          AUTH_USER_KEY,
          JSON.stringify({ ...user, isOnboarded })
        );
      }

      return {
        token,
        refreshToken: refresh,
        user,
        isOnboarded,
      };
    } catch (err: any) {
      const status = err?.response?.status as number | undefined;
      // Only clear credentials on definitive auth failures — not flaky network.
      if (status === 401 || status === 403) {
        await AsyncStorage.multiRemove([
          AUTH_TOKEN_KEY,
          AUTH_REFRESH_TOKEN_KEY,
          AUTH_USER_KEY,
        ]);
        return rejectWithValue('Session expired');
      }
      if (stored) {
        return {
          token,
          refreshToken: refresh,
          user: stored,
          isOnboarded: !!stored.isOnboarded,
        };
      }
      return rejectWithValue('Session unavailable');
    }
  }
);

export const logoutUserThunk = createAsyncThunk('auth/logoutUser', async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
  } catch (e) {
    console.warn('Backend logout failed, continuing with local cleanup:', e);
  } finally {
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      AUTH_REFRESH_TOKEN_KEY,
      AUTH_USER_KEY,
      '@vidya_user_profile',
      '@vidya_chapter_progress',
    ]);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsOnboarded: (state, action: PayloadAction<boolean>) => {
      state.isOnboarded = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    /** Sync Redux after the Axios interceptor clears storage on refresh failure. */
    forceLogout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isOnboarded = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder.addCase(loginUserThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUserThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isOnboarded = action.payload.isOnboarded;
      state.error = null;
    });
    builder.addCase(loginUserThunk.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = action.payload as string;
    });

    // check session
    builder.addCase(checkSessionThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkSessionThunk.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isOnboarded = action.payload.isOnboarded;
      } else {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      }
    });
    builder.addCase(checkSessionThunk.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    });

    // logout
    builder.addCase(logoutUserThunk.pending, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isOnboarded = false;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(logoutUserThunk.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isOnboarded = false;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(logoutUserThunk.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isOnboarded = false;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { setIsOnboarded, clearAuthError, forceLogout } = authSlice.actions;
export default authSlice.reducer;

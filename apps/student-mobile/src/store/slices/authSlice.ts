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

      // Fetch fresh /api/v1/auth/me
      const meRes = await authApi.me();
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(meRes.user));

      return {
        accessToken,
        refreshToken,
        user: meRes.user,
        isOnboarded: !!meRes.isOnboarded,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

export const checkSessionThunk = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        return null;
      }
      const meRes = await authApi.me();
      const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
      const user = meRes.user || (storedUser ? JSON.parse(storedUser) : null);
      const refresh = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

      return {
        token,
        refreshToken: refresh,
        user,
        isOnboarded: !!meRes.isOnboarded,
      };
    } catch (err: any) {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY, AUTH_USER_KEY]);
      return rejectWithValue('Session expired');
    }
  }
);

export const logoutUserThunk = createAsyncThunk('auth/logoutUser', async () => {
  try {
    const refreshToken = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
  } finally {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY, AUTH_USER_KEY]);
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
    builder.addCase(logoutUserThunk.fulfilled, (state) => {
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

export const { setIsOnboarded, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PREFERENCES_STORAGE_KEY = '@vidya_user_preferences';

export type FontSizePreference = 'small' | 'medium' | 'large';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface PreferencesState {
  theme: ThemePreference;
  fontSize: FontSizePreference;
  fontScale: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  readingGuideEnabled: boolean;
  playbackSpeed: number;
  loading: boolean;
}

const initialState: PreferencesState = {
  theme: 'light',
  fontSize: 'medium',
  fontScale: 1.0,
  soundEnabled: true,
  hapticsEnabled: true,
  readingGuideEnabled: false,
  playbackSpeed: 1.0,
  loading: false,
};

const FONT_SCALE_MAP: Record<FontSizePreference, number> = {
  small: 0.9,
  medium: 1.0,
  large: 1.15,
};

export const loadPreferencesThunk = createAsyncThunk(
  'preferences/loadPreferences',
  async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as Partial<PreferencesState>;
      }
    } catch {
      // ignore storage failure
    }
    return null;
  }
);

const persistPreferences = async (state: PreferencesState) => {
  try {
    const toStore = {
      theme: state.theme,
      fontSize: state.fontSize,
      fontScale: state.fontScale,
      soundEnabled: state.soundEnabled,
      hapticsEnabled: state.hapticsEnabled,
      readingGuideEnabled: state.readingGuideEnabled,
      playbackSpeed: state.playbackSpeed,
    };
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore
  }
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemePreference>) => {
      state.theme = action.payload;
      void persistPreferences(state);
    },
    setFontSize: (state, action: PayloadAction<FontSizePreference>) => {
      state.fontSize = action.payload;
      state.fontScale = FONT_SCALE_MAP[action.payload] || 1.0;
      void persistPreferences(state);
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
      void persistPreferences(state);
    },
    setHapticsEnabled: (state, action: PayloadAction<boolean>) => {
      state.hapticsEnabled = action.payload;
      void persistPreferences(state);
    },
    setReadingGuideEnabled: (state, action: PayloadAction<boolean>) => {
      state.readingGuideEnabled = action.payload;
      void persistPreferences(state);
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
      void persistPreferences(state);
    },
    resetPreferences: () => {
      void AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY);
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPreferencesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPreferencesThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          if (action.payload.theme) state.theme = action.payload.theme;
          if (action.payload.fontSize) {
            state.fontSize = action.payload.fontSize;
            state.fontScale = FONT_SCALE_MAP[action.payload.fontSize] || 1.0;
          }
          if (typeof action.payload.soundEnabled === 'boolean') {
            state.soundEnabled = action.payload.soundEnabled;
          }
          if (typeof action.payload.hapticsEnabled === 'boolean') {
            state.hapticsEnabled = action.payload.hapticsEnabled;
          }
          if (typeof action.payload.readingGuideEnabled === 'boolean') {
            state.readingGuideEnabled = action.payload.readingGuideEnabled;
          }
          if (typeof action.payload.playbackSpeed === 'number') {
            state.playbackSpeed = action.payload.playbackSpeed;
          }
        }
      })
      .addCase(loadPreferencesThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setTheme,
  setFontSize,
  setSoundEnabled,
  setHapticsEnabled,
  setReadingGuideEnabled,
  setPlaybackSpeed,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;


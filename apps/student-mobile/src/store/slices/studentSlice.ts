import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { studentsApi, schoolsApi } from '../../services/apiClient';
import {
  normalizeProfile,
  toApiProfilePatch,
} from '../../services/profileMapper';
import { UserProfile } from '../../types/curriculum';

const USER_PROFILE_STORAGE_KEY = '@vidya_user_profile';

export interface SchoolItem {
  id: string;
  name: string;
  udiseCode: string;
  district: string;
  mandal: string;
  address?: string;
}

export interface StudentState {
  profile: UserProfile | null;
  schools: SchoolItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: StudentState = {
  profile: null,
  schools: [],
  loading: true,
  saving: false,
  error: null,
};

export const fetchProfileThunk = createAsyncThunk(
  'student/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const backendProfile = await studentsApi.getProfile();
      if (backendProfile) {
        const profile = normalizeProfile(backendProfile);
        await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
        return profile;
      }
      return null;
    } catch (err: any) {
      try {
        const cached = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (cached) {
          return normalizeProfile(JSON.parse(cached));
        }
      } catch {
        // ignore
      }
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch profile');
    }
  }
);

export const submitOnboardingThunk = createAsyncThunk(
  'student/submitOnboarding',
  async (formData: Record<string, any>, { rejectWithValue }) => {
    try {
      const res = await studentsApi.submitOnboarding(formData);
      const updatedProfile = normalizeProfile(res.profile || res);
      await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Onboarding failed';
      return rejectWithValue(msg);
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  'student/updateProfile',
  async (updates: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const res = await studentsApi.updateProfile(toApiProfilePatch(updates));
      const updated = normalizeProfile(res.profile || res);
      await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Update failed');
    }
  }
);

export const uploadAvatarThunk = createAsyncThunk(
  'student/uploadAvatar',
  async (imageUri: string, { rejectWithValue }) => {
    try {
      const filename = imageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const res = await studentsApi.uploadAvatar(imageUri, filename, type);
      return res.avatarUrl;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Upload failed');
    }
  }
);

export const removeAvatarThunk = createAsyncThunk(
  'student/removeAvatar',
  async (_, { rejectWithValue }) => {
    try {
      await studentsApi.deleteAvatar();
      return null;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Delete failed');
    }
  }
);

export const fetchSchoolsThunk = createAsyncThunk(
  'student/fetchSchools',
  async ({ query, district }: { query?: string; district?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await schoolsApi.getSchools(query, district);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load schools');
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setProfileLocal: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearStudentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetch profile
    builder.addCase(fetchProfileThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfileThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
    });
    builder.addCase(fetchProfileThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // submit onboarding
    builder.addCase(submitOnboardingThunk.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(submitOnboardingThunk.fulfilled, (state, action) => {
      state.saving = false;
      state.profile = action.payload;
      state.error = null;
    });
    builder.addCase(submitOnboardingThunk.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // update profile
    builder.addCase(updateProfileThunk.pending, (state) => {
      state.saving = true;
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, action) => {
      state.saving = false;
      state.profile = { ...(state.profile || ({} as UserProfile)), ...action.payload };
    });
    builder.addCase(updateProfileThunk.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload as string;
    });

    // upload avatar
    builder.addCase(uploadAvatarThunk.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.avatarUrl = action.payload;
      }
    });

    // remove avatar
    builder.addCase(removeAvatarThunk.fulfilled, (state) => {
      if (state.profile) {
        state.profile.avatarUrl = '';
      }
    });

    // fetch schools
    builder.addCase(fetchSchoolsThunk.fulfilled, (state, action) => {
      state.schools = action.payload || [];
    });
  },
});

export const { setProfileLocal, clearStudentError } = studentSlice.actions;
export default studentSlice.reducer;

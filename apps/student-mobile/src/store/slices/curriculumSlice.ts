import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { curriculumApi } from '../../services/apiClient';
import { CURRICULUM_DATA } from '../../data/curriculum';
import { SchoolClass, Subject, Chapter, Section } from '../../types/curriculum';

export interface CurriculumState {
  classes: SchoolClass[];
  activeClassId: string;
  selectedSubject: Subject | null;
  selectedChapter: Chapter | null;
  selectedSection: Section | null;
  loading: boolean;
  error: string | null;
}

const initialState: CurriculumState = {
  classes: CURRICULUM_DATA,
  activeClassId: 'class-8',
  selectedSubject: null,
  selectedChapter: null,
  selectedSection: null,
  loading: false,
  error: null,
};

export const fetchClassesThunk = createAsyncThunk(
  'curriculum/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const data = await curriculumApi.getClasses();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return CURRICULUM_DATA;
    } catch {
      // Offline fallback
      return CURRICULUM_DATA;
    }
  }
);

export const fetchSubjectsThunk = createAsyncThunk(
  'curriculum/fetchSubjects',
  async (classId: string, { rejectWithValue }) => {
    try {
      const data = await curriculumApi.getSubjectsByClass(classId);
      return { classId, subjects: data };
    } catch {
      const fallback = CURRICULUM_DATA.find((c) => c.id === classId)?.subjects || [];
      return { classId, subjects: fallback };
    }
  }
);

export const fetchChapterThunk = createAsyncThunk(
  'curriculum/fetchChapter',
  async (chapterId: string, { rejectWithValue }) => {
    try {
      const data = await curriculumApi.getChapterById(chapterId);
      return data;
    } catch {
      for (const cl of CURRICULUM_DATA) {
        for (const sub of cl.subjects) {
          const ch = sub.chapters.find((c) => c.id === chapterId);
          if (ch) return ch;
        }
      }
      return null;
    }
  }
);

export const fetchSectionThunk = createAsyncThunk(
  'curriculum/fetchSection',
  async (sectionId: string, { rejectWithValue }) => {
    try {
      const data = await curriculumApi.getSectionById(sectionId);
      return data;
    } catch {
      for (const cl of CURRICULUM_DATA) {
        for (const sub of cl.subjects) {
          for (const ch of sub.chapters) {
            const sec = ch.sections.find((s) => s.id === sectionId);
            if (sec) return sec;
          }
        }
      }
      return null;
    }
  }
);

const curriculumSlice = createSlice({
  name: 'curriculum',
  initialState,
  reducers: {
    setActiveClassId: (state, action: PayloadAction<string>) => {
      state.activeClassId = action.payload;
    },
    clearCurriculumSelections: (state) => {
      state.selectedSubject = null;
      state.selectedChapter = null;
      state.selectedSection = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchClassesThunk.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        state.classes = action.payload;
      }
    });
    builder.addCase(fetchChapterThunk.fulfilled, (state, action) => {
      state.selectedChapter = action.payload;
    });
    builder.addCase(fetchSectionThunk.fulfilled, (state, action) => {
      state.selectedSection = action.payload;
    });
  },
});

export const { setActiveClassId, clearCurriculumSelections } = curriculumSlice.actions;
export default curriculumSlice.reducer;

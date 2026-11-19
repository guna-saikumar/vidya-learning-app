import { apiClient } from '../lib/apiClient';

const PROGRESS_STORAGE_KEY = '@vidya_web_chapter_progress';
const BOOKMARKS_STORAGE_KEY = '@vidya_web_bookmarks';
const NOTIFICATIONS_STORAGE_KEY = '@vidya_web_notifications';

// ---------------------------------------------------------------------------
// PROGRESS
// ---------------------------------------------------------------------------

export const getStoredProgress = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Fetch student reading progress from backend PostgreSQL database.
 * Falls back to localStorage cache if offline.
 */
export const fetchProgress = async () => {
  try {
    const res = await apiClient.get('/api/v1/students/me/progress');
    const rawChapters = res.data?.chapters || {};
    const progressMap = {};

    for (const [chId, data] of Object.entries(rawChapters)) {
      progressMap[chId] = {
        chapterId: chId,
        subjectId: data?.subjectId || '',
        classId: data?.classId || '',
        progressPercent: typeof data?.progressPercent === 'number' ? data.progressPercent : 0,
        completed: Boolean(data?.completed),
        completedSections: Array.isArray(data?.completedSections) ? data.completedSections : [],
        lastAccessed: data?.lastAccessedAt ? new Date(data.lastAccessedAt).getTime() : Date.now(),
        lastSectionId: data?.lastSectionId || null,
      };
    }

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
    return {
      progressMap,
      overallPercent: typeof res.data?.overallPercent === 'number' ? res.data.overallPercent : 0,
    };
  } catch (err) {
    console.warn('API fetchProgress failed, using cached progress:', err);
    return {
      progressMap: getStoredProgress(),
      overallPercent: 0,
    };
  }
};

/**
 * Persist chapter reading progress to PostgreSQL database and local storage.
 */
export const saveChapterProgress = async (progress) => {
  const current = getStoredProgress();
  const existing = current[progress.chapterId];

  const updatedSections = progress.completedSections !== undefined
    ? progress.completedSections
    : (existing?.completedSections || []);

  const updated = {
    chapterId: progress.chapterId,
    subjectId: progress.subjectId || existing?.subjectId || '',
    classId: progress.classId || existing?.classId || '',
    progressPercent: progress.progressPercent,
    completed: progress.completed,
    completedSections: updatedSections,
    lastAccessed: Date.now(),
    lastSectionId: progress.sectionId || existing?.lastSectionId || null,
  };

  current[progress.chapterId] = updated;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(current));

  try {
    const payload = {
      progressPercent: progress.progressPercent,
      completed: progress.completed,
      completedSections: updatedSections,
    };
    if (progress.sectionId) {
      payload.sectionId = progress.sectionId;
    }

    const res = await apiClient.put(`/api/v1/students/me/progress/${progress.chapterId}`, payload);
    if (res.data?.updatedProgress) {
      const p = res.data.updatedProgress;
      current[progress.chapterId] = {
        chapterId: p.chapterId,
        subjectId: p.subjectId,
        classId: p.classId,
        progressPercent: p.progressPercent,
        completed: Boolean(p.completed),
        completedSections: Array.isArray(p.completedSections) ? p.completedSections : [],
        lastAccessed: p.lastAccessedAt ? new Date(p.lastAccessedAt).getTime() : Date.now(),
        lastSectionId: p.lastSectionId || null,
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.warn('API saveChapterProgress failed, saved locally:', err);
  }

  return current;
};

/**
 * Record a chapter visit to power synchronized "Continue Learning" across mobile & web.
 */
export const recordChapterVisit = async (classId, subjectId, chapterId) => {
  const current = getStoredProgress();
  const existing = current[chapterId];

  const updatedPercent = existing?.progressPercent ? existing.progressPercent : 20;
  const updated = {
    chapterId,
    subjectId: subjectId || existing?.subjectId || '',
    classId: classId || existing?.classId || '',
    progressPercent: updatedPercent,
    completed: Boolean(existing?.completed),
    completedSections: existing?.completedSections || [],
    lastAccessed: Date.now(),
    lastSectionId: existing?.lastSectionId || null,
  };

  current[chapterId] = updated;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(current));

  try {
    await apiClient.put(`/api/v1/students/me/progress/${chapterId}`, {
      progressPercent: updatedPercent,
      completed: Boolean(existing?.completed),
      completedSections: existing?.completedSections || [],
    });
  } catch {
    // Non-blocking visit sync
  }

  return current;
};

// ---------------------------------------------------------------------------
// BOOKMARKS
// ---------------------------------------------------------------------------

export const getStoredBookmarks = () => {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Fetch student bookmarks from backend PostgreSQL database.
 */
export const fetchBookmarks = async () => {
  try {
    const res = await apiClient.get('/api/v1/students/me/bookmarks');
    if (Array.isArray(res.data)) {
      const bookmarks = res.data.map((b) => ({
        id: b.id,
        classId: b.classId,
        chapterId: b.chapterId,
        chapterTitle: b.chapterTitle || '',
        subjectId: b.subjectId,
        subjectName: b.subjectName || '',
        sectionId: b.sectionId || null,
        sectionTitle: b.sectionTitle || null,
        title: b.title || '',
        subtitle: b.subtitle || '',
        type: b.type || (b.sectionId ? 'section' : 'chapter'),
        previewText: b.previewText || '',
        dateAdded: b.dateAdded || new Date().toISOString(),
      }));
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      return bookmarks;
    }
  } catch (err) {
    console.warn('API fetchBookmarks failed, using cached bookmarks:', err);
  }
  return getStoredBookmarks();
};

/**
 * Add bookmark in PostgreSQL database and local storage.
 */
export const addBookmark = async (item) => {
  const current = getStoredBookmarks();

  try {
    const res = await apiClient.post('/api/v1/students/me/bookmarks', {
      chapterId: item.chapterId,
      sectionId: item.sectionId || null,
      type: item.type || (item.sectionId ? 'section' : 'chapter'),
      title: item.title,
      subtitle: item.subtitle,
      previewText: item.previewText,
    });

    const saved = res.data?.bookmark;
    if (saved && saved.id) {
      const normalized = {
        id: saved.id,
        classId: saved.classId || item.classId,
        chapterId: saved.chapterId || item.chapterId,
        chapterTitle: saved.chapterTitle || '',
        subjectId: saved.subjectId || item.subjectId,
        subjectName: saved.subjectName || '',
        sectionId: saved.sectionId || item.sectionId || null,
        sectionTitle: saved.sectionTitle || null,
        title: saved.title || item.title,
        subtitle: saved.subtitle || item.subtitle,
        type: saved.type || item.type,
        previewText: saved.previewText || item.previewText || '',
        dateAdded: saved.dateAdded || new Date().toISOString(),
      };
      const updated = [
        normalized,
        ...current.filter((b) => b.id !== saved.id && (b.chapterId !== item.chapterId || (b.sectionId || null) !== (item.sectionId || null))),
      ];
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch (err) {
    console.warn('API addBookmark failed, saving locally:', err);
  }

  // Offline fallback
  const newBookmark = {
    id: `bm-${Date.now()}`,
    dateAdded: new Date().toISOString(),
    ...item,
  };
  const updated = [
    newBookmark,
    ...current.filter((b) => b.chapterId !== item.chapterId || (b.sectionId || null) !== (item.sectionId || null)),
  ];
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Remove bookmark by id from PostgreSQL database and local storage.
 */
export const removeBookmark = async (bookmarkId) => {
  const current = getStoredBookmarks();
  const updated = current.filter((b) => b.id !== bookmarkId);
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));

  try {
    await apiClient.delete(`/api/v1/students/me/bookmarks/${bookmarkId}`);
  } catch (err) {
    console.warn('API removeBookmark failed:', err);
  }

  return updated;
};

/**
 * Remove bookmark by section id from PostgreSQL database.
 */
export const removeBookmarkBySection = async (sectionId) => {
  const current = getStoredBookmarks();
  const updated = current.filter((b) => b.sectionId !== sectionId);
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));

  try {
    await apiClient.delete(`/api/v1/students/me/bookmarks/by-section/${sectionId}`);
  } catch (err) {
    console.warn('API removeBookmarkBySection failed:', err);
  }

  return updated;
};

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------

export const getStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  const initial = [
    {
      id: 'notif-1',
      title: 'Welcome to Term 2!',
      message: 'Explore your updated Class curriculum and track your daily learning goals.',
      body: 'Explore your updated Class curriculum and track your daily learning goals.',
      type: 'announcement',
      isRead: false,
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'notif-2',
      title: 'Mathematics Chapter 1 Ready',
      message: 'New practice problems and key formulas added to Real Numbers.',
      body: 'New practice problems and key formulas added to Real Numbers.',
      type: 'update',
      isRead: false,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'notif-3',
      title: 'Great Study Streak!',
      message: 'You have actively learned 5 days this week. Keep up the great work!',
      body: 'You have actively learned 5 days this week. Keep up the great work!',
      type: 'achievement',
      isRead: true,
      createdAt: Date.now() - 172800000,
    },
  ];
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const markNotificationAsRead = (id) => {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const markAllNotificationsAsRead = () => {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, isRead: true }));
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

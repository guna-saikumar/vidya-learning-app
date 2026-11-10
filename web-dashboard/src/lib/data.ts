import "server-only";
import { cache } from "react";
import { api } from "./api";
import type {
  AuthMe,
  Bookmark,
  BookmarksPageData,
  ChapterDetail,
  ChapterPageData,
  ChapterSummary,
  ClassItem,
  ClassPageData,
  DashboardData,
  LearnData,
  LearningEntry,
  MyLearningData,
  NotificationDetailData,
  NotificationItem,
  NotificationsPageData,
  Profile,
  ProfilePageData,
  ProgressChapter,
  ProgressResponse,
  SectionDetail,
  SectionPageData,
  SectionSummary,
  ShellData,
  SubjectDetail,
  SubjectPageData,
  SubjectProgress,
  SubjectSummary,
} from "./types";

// ---------------------------------------------------------------------------
// Request-scoped API readers (deduplicated across layout + page)
// ---------------------------------------------------------------------------

export const fetchMe = cache(() => api<AuthMe>("/api/v1/auth/me"));

export const fetchProfile = cache(() =>
  api<Profile>("/api/v1/students/me/profile"),
);

export const fetchProgress = cache(() =>
  api<ProgressResponse>("/api/v1/students/me/progress"),
);

export const fetchBookmarks = cache(() =>
  api<Bookmark[]>("/api/v1/students/me/bookmarks"),
);

export const fetchNotifications = cache(() =>
  api<NotificationItem[]>("/api/v1/notifications"),
);

export const fetchClasses = cache(() =>
  api<ClassItem[]>("/api/v1/curriculum/classes"),
);

export const fetchSubjectsForClass = cache((classId: string) =>
  api<SubjectSummary[]>(
    `/api/v1/curriculum/classes/${encodeURIComponent(classId)}/subjects`,
  ),
);

export const fetchSubject = cache((subjectId: string) =>
  api<SubjectDetail>(
    `/api/v1/curriculum/subjects/${encodeURIComponent(subjectId)}`,
  ),
);

export const fetchChapter = cache((chapterId: string) =>
  api<ChapterDetail>(
    `/api/v1/curriculum/chapters/${encodeURIComponent(chapterId)}`,
  ),
);

export const fetchSection = cache((sectionId: string) =>
  api<SectionDetail>(
    `/api/v1/curriculum/sections/${encodeURIComponent(sectionId)}`,
  ),
);

export const fetchNotification = cache((notificationId: string) =>
  api<NotificationItem>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}`,
  ),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const averagePercent = (chapters: ProgressChapter[]) =>
  chapters.length === 0
    ? 0
    : Math.round(
        chapters.reduce((sum, chapter) => sum + chapter.progressPercent, 0) /
          chapters.length,
      );

const progressForSubject = (
  subject: SubjectDetail,
  progress: ProgressResponse,
): SubjectProgress => {
  const tracked = subject.chapters
    .map((chapter) => progress.chapters[chapter.id])
    .filter(Boolean) as ProgressChapter[];

  return {
    id: subject.id,
    name: subject.title,
    title: subject.title,
    category: subject.category,
    icon: subject.icon,
    totalChapters: subject.totalChapters,
    completedChapters: tracked.filter((chapter) => chapter.completed).length,
    inProgressChapters: tracked.filter(
      (chapter) => !chapter.completed && chapter.progressPercent > 0,
    ).length,
    progressPercent: averagePercent(tracked),
    estimatedHours: subject.estimatedHours,
  };
};

const sortByRecent = (a: ProgressChapter, b: ProgressChapter) =>
  new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();

const activeClassFor = (profile: Profile, classes: ClassItem[]) => {
  const classId = profile.classId ?? profile.activeClassId;
  return classes.find((item) => item.id === classId) ?? null;
};

const subjectDetailsFor = async (classId: string) => {
  const subjects = await fetchSubjectsForClass(classId);
  return Promise.all(subjects.map((subject) => fetchSubject(subject.id)));
};

// ---------------------------------------------------------------------------
// Shared shell (sidebar/header data)
// ---------------------------------------------------------------------------

export const getShellData = cache(async (): Promise<ShellData> => {
  const [me, profile, classes, progress, bookmarks, notifications] =
    await Promise.all([
      fetchMe(),
      fetchProfile(),
      fetchClasses(),
      fetchProgress(),
      fetchBookmarks(),
      fetchNotifications(),
    ]);

  const activeClass = activeClassFor(profile, classes);
  const totalChapters =
    activeClass?.chaptersCount ??
    Object.keys(progress.chapters).length;
  const completedChapters = Object.values(progress.chapters).filter(
    (chapter) => chapter.completed,
  ).length;

  return {
    me,
    profile,
    classes,
    activeClass,
    overallPercent: progress.overallPercent,
    completedChapters,
    totalChapters,
    subjectsCount: activeClass?.subjectsCount ?? 0,
    bookmarksCount: bookmarks.length,
    unreadNotifications: notifications.filter((item) => !item.isRead).length,
  };
});

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const [me, profile, classes, progress, bookmarks, notifications] =
    await Promise.all([
      fetchMe(),
      fetchProfile(),
      fetchClasses(),
      fetchProgress(),
      fetchBookmarks(),
      fetchNotifications(),
    ]);

  const classId = profile.classId ?? profile.activeClassId;
  const activeClass = activeClassFor(profile, classes);
  const subjects = classId ? await subjectDetailsFor(classId) : [];

  const progressChapters = Object.values(progress.chapters);
  const subjectProgress = subjects.map((subject) =>
    progressForSubject(subject, progress),
  );

  const chaptersTotal =
    activeClass?.chaptersCount ??
    subjects.reduce((sum, subject) => sum + subject.totalChapters, 0);
  const completedChapters = progressChapters.filter(
    (chapter) => chapter.completed,
  ).length;

  const incomplete = progressChapters
    .filter((chapter) => !chapter.completed)
    .sort(sortByRecent);
  const fallback = [...progressChapters].sort(sortByRecent);
  const chosen = incomplete[0] ?? fallback[0] ?? null;

  let continueLearning: DashboardData["continueLearning"] = null;
  if (chosen) {
    const chapter = await fetchChapter(chosen.chapterId).catch(() => null);
    if (chapter) {
      const subject = subjects.find((item) => item.id === chosen.subjectId);
      continueLearning = {
        classId: chapter.classId,
        subjectId: chapter.subjectId,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        subjectName: subject?.title ?? "Unknown subject",
        progressPercent: chosen.progressPercent,
        completed: chosen.completed,
        completedSections: chosen.completedSections.length,
        totalSections: chapter.sections.length,
        durationMinutes: chapter.durationMinutes,
      };
    }
  } else if (subjects[0]?.chapters[0]) {
    const first = subjects[0].chapters[0];
    continueLearning = {
      classId: subjects[0].classId,
      subjectId: subjects[0].id,
      chapterId: first.id,
      chapterTitle: first.title,
      subjectName: subjects[0].title,
      progressPercent: 0,
      completed: false,
      completedSections: 0,
      totalSections: first.sectionCount,
      durationMinutes: first.durationMinutes,
    };
  }

  const progressByChapter = new Map(
    progressChapters.map((chapter) => [chapter.chapterId, chapter] as const),
  );
  const bookmarksWithProgress = bookmarks.map((bookmark) => ({
    ...bookmark,
    progressPercent:
      progressByChapter.get(bookmark.chapterId)?.progressPercent ?? 0,
  }));

  return {
    me,
    profile,
    activeClass,
    subjects,
    progress,
    subjectProgress,
    continueLearning,
    bookmarks: bookmarksWithProgress,
    notifications,
    stats: {
      subjects: subjects.length,
      chapters: chaptersTotal,
      completedChapters,
      overallPercent: progress.overallPercent,
    },
    unreadNotifications: notifications.filter((item) => !item.isRead).length,
  };
});

// ---------------------------------------------------------------------------
// Learn
// ---------------------------------------------------------------------------

export const getLearnData = cache(async (): Promise<LearnData> => {
  const [profile, classes, progress] = await Promise.all([
    fetchProfile(),
    fetchClasses(),
    fetchProgress(),
  ]);

  const classId = profile.classId ?? profile.activeClassId;
  const activeClass = activeClassFor(profile, classes);
  const subjects = classId ? await subjectDetailsFor(classId) : [];
  const subjectProgress = subjects.map((subject) =>
    progressForSubject(subject, progress),
  );

  return {
    profile,
    activeClass,
    classes,
    subjects,
    subjectProgress,
    stats: {
      subjects: subjects.length,
      chapters: subjects.reduce(
        (sum, subject) => sum + subject.totalChapters,
        0,
      ),
      completedChapters: progressSubjectChapters(subjects, progress).filter(
        (chapter) => chapter.completed,
      ).length,
      inProgressChapters: progressSubjectChapters(subjects, progress).filter(
        (chapter) => !chapter.completed && chapter.progressPercent > 0,
      ).length,
      overallPercent: progress.overallPercent,
    },
  };
});

const progressSubjectChapters = (
  subjects: SubjectDetail[],
  progress: ProgressResponse,
) =>
  subjects
    .flatMap((subject) => subject.chapters)
    .map((chapter) => progress.chapters[chapter.id])
    .filter(Boolean) as ProgressChapter[];

export const getClassPageData = cache(
  async (classId: string): Promise<ClassPageData> => {
    const [profile, classes, progress] = await Promise.all([
      fetchProfile(),
      fetchClasses(),
      fetchProgress(),
    ]);
    const classItem = classes.find((item) => item.id === classId) ?? null;
    const subjects = classItem ? await subjectDetailsFor(classItem.id) : [];
    return {
      profile,
      classes,
      classItem,
      subjects,
      subjectProgress: subjects.map((subject) =>
        progressForSubject(subject, progress),
      ),
      progress,
    };
  },
);

export const getSubjectPageData = cache(
  async (classId: string, subjectId: string): Promise<SubjectPageData> => {
    const [profile, classes, progress, bookmarks, subject] = await Promise.all([
      fetchProfile(),
      fetchClasses(),
      fetchProgress(),
      fetchBookmarks(),
      fetchSubject(subjectId),
    ]);

    const chapterProgress: Record<string, ProgressChapter> = {};
    let completed = 0;
    let inProgress = 0;
    for (const chapter of subject.chapters) {
      const entry = progress.chapters[chapter.id];
      if (entry) {
        chapterProgress[chapter.id] = entry;
        if (entry.completed) completed += 1;
        else if (entry.progressPercent > 0) inProgress += 1;
      }
    }

    const total = subject.chapters.length;
    return {
      profile,
      activeClass: classes.find((item) => item.id === classId) ?? null,
      subject,
      progress,
      chapterProgress,
      bookmarks,
      stats: {
        total,
        completed,
        inProgress,
        unread: total - completed - inProgress,
        percent: Math.round((completed / Math.max(1, total)) * 100),
      },
    };
  },
);

export const getChapterPageData = cache(
  async (chapterId: string): Promise<ChapterPageData> => {
    const [profile, classes, progress, bookmarks, chapter] = await Promise.all([
      fetchProfile(),
      fetchClasses(),
      fetchProgress(),
      fetchBookmarks(),
      fetchChapter(chapterId),
    ]);
    const subject = await fetchSubject(chapter.subjectId);
    const chapterIndex = subject.chapters.findIndex(
      (item) => item.id === chapter.id,
    );

    return {
      profile,
      activeClass: classes.find((item) => item.id === chapter.classId) ?? null,
      subject,
      chapter,
      progress: progress.chapters[chapter.id] ?? null,
      bookmarks,
      prevChapter:
        chapterIndex > 0 ? subject.chapters[chapterIndex - 1] : null,
      nextChapter:
        chapterIndex >= 0 && chapterIndex < subject.chapters.length - 1
          ? subject.chapters[chapterIndex + 1]
          : null,
      chapterIndex,
    };
  },
);

export const getSectionPageData = cache(
  async (sectionId: string): Promise<SectionPageData> => {
    const [profile, classes, progress, bookmarks, section] = await Promise.all([
      fetchProfile(),
      fetchClasses(),
      fetchProgress(),
      fetchBookmarks(),
      fetchSection(sectionId),
    ]);
    const [chapter, subject] = await Promise.all([
      fetchChapter(section.chapterId),
      fetchSubject(section.subjectId),
    ]);
    const sectionIndex = chapter.sections.findIndex(
      (item) => item.id === section.id,
    );

    return {
      profile,
      activeClass: classes.find((item) => item.id === section.classId) ?? null,
      subject,
      chapter,
      section,
      chapterProgress: progress.chapters[chapter.id] ?? null,
      bookmarks,
      prevSection:
        sectionIndex > 0 ? chapter.sections[sectionIndex - 1] : null,
      nextSection:
        sectionIndex >= 0 && sectionIndex < chapter.sections.length - 1
          ? chapter.sections[sectionIndex + 1]
          : null,
      sectionIndex,
    };
  },
);

// ---------------------------------------------------------------------------
// My learning
// ---------------------------------------------------------------------------

export const getMyLearningData = cache(async (): Promise<MyLearningData> => {
  const [profile, classes, progress] = await Promise.all([
    fetchProfile(),
    fetchClasses(),
    fetchProgress(),
  ]);

  const tracked = Object.values(progress.chapters).sort(sortByRecent);
  const subjectCache = new Map<string, SubjectSummary>();

  const entries = (
    await Promise.all(
      tracked.map(async (entry): Promise<LearningEntry | null> => {
        const chapter = await fetchChapter(entry.chapterId).catch(() => null);
        if (!chapter) return null;

        const subjectId = entry.subjectId ?? chapter.subjectId;
        let subject = subjectCache.get(subjectId);
        if (!subject) {
          const detail = await fetchSubject(subjectId).catch(() => null);
          if (!detail) return null;
          subject = detail;
          subjectCache.set(subjectId, detail);
        }

        const classItem =
          classes.find((item) => item.id === (entry.classId ?? chapter.classId)) ??
          null;
        if (!classItem) return null;

        return { progress: entry, chapter, subject, classItem };
      }),
    )
  ).filter(Boolean) as LearningEntry[];

  return {
    profile,
    entries,
    stats: {
      totalChapters: classes.find(
        (item) => item.id === (profile.classId ?? profile.activeClassId),
      )?.chaptersCount ?? tracked.length,
      completed: tracked.filter((entry) => entry.completed).length,
      inProgress: tracked.filter(
        (entry) => !entry.completed && entry.progressPercent > 0,
      ).length,
      overallPercent: progress.overallPercent,
    },
  };
});

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export const getBookmarksPageData = cache(
  async (): Promise<BookmarksPageData> => {
    const [profile, progress, bookmarks] = await Promise.all([
      fetchProfile(),
      fetchProgress(),
      fetchBookmarks(),
    ]);

    return {
      profile,
      bookmarks: bookmarks.map((bookmark) => ({
        ...bookmark,
        progressPercent:
          progress.chapters[bookmark.chapterId]?.progressPercent ?? 0,
      })),
    };
  },
);

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const getNotificationsPageData = cache(
  async (): Promise<NotificationsPageData> => {
    const [profile, notifications] = await Promise.all([
      fetchProfile(),
      fetchNotifications(),
    ]);
    return {
      profile,
      notifications,
      unreadCount: notifications.filter((item) => !item.isRead).length,
    };
  },
);

export const getNotificationDetailData = cache(
  async (notificationId: string): Promise<NotificationDetailData> => {
    const [profile, notification] = await Promise.all([
      fetchProfile(),
      fetchNotification(notificationId),
    ]);
    return { profile, notification };
  },
);

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const getProfilePageData = cache(
  async (): Promise<ProfilePageData> => {
    const [profile, classes, progress, bookmarks] = await Promise.all([
      fetchProfile(),
      fetchClasses(),
      fetchProgress(),
      fetchBookmarks(),
    ]);

    const tracked = Object.values(progress.chapters);
    return {
      profile,
      activeClass: activeClassFor(profile, classes),
      classes,
      progress,
      completedChapters: tracked.filter((chapter) => chapter.completed).length,
      completedTopics: tracked.reduce(
        (sum, chapter) => sum + chapter.completedSections.length,
        0,
      ),
      bookmarksCount: bookmarks.length,
    };
  },
);

export type { ChapterSummary, SectionSummary };

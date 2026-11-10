"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  API_URL,
  ApiError,
  REFRESH_COOKIE,
  api,
  apiForm,
  publicApi,
} from "@/lib/api";
import type { Bookmark, ProgressResponse } from "@/lib/types";

const ACCESS_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Enter%20your%20email%20and%20password");
  }

  try {
    const data = await publicApi<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const store = await cookies();
    store.set(ACCESS_COOKIE, data.accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_MAX_AGE,
    });
    store.set(REFRESH_COOKIE, data.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_MAX_AGE,
    });
  } catch (error) {
    const message =
      error instanceof ApiError && error.status === 401
        ? "Invalid email or password"
        : "Unable to sign in. Please try again.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect("/");
}

export async function logoutAction() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

type ToggleBookmarkInput = {
  chapterId: string;
  sectionId?: string | null;
  type: "chapter" | "section";
  title: string;
  subtitle: string;
  previewText?: string;
};

export async function toggleBookmarkAction(input: ToggleBookmarkInput) {
  try {
    const bookmarks = await api<Bookmark[]>("/api/v1/students/me/bookmarks");
    const sectionId = input.sectionId ?? null;
    const existing = bookmarks.find(
      (bookmark) =>
        bookmark.chapterId === input.chapterId &&
        (bookmark.sectionId ?? null) === sectionId &&
        bookmark.type === input.type,
    );

    if (existing) {
      await api(`/api/v1/students/me/bookmarks/${existing.id}`, {
        method: "DELETE",
      });
    } else {
      await api("/api/v1/students/me/bookmarks", {
        method: "POST",
        body: {
          chapterId: input.chapterId,
          sectionId: sectionId ?? undefined,
          type: input.type,
          title: input.title,
          subtitle: input.subtitle,
          previewText: input.previewText,
        },
      });
    }

    revalidatePath("/", "layout");
    return { ok: true as const, bookmarked: !existing };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ApiError ? error.message : "Could not update bookmark",
    };
  }
}

export async function removeBookmarkAction(bookmarkId: string) {
  try {
    await api(`/api/v1/students/me/bookmarks/${bookmarkId}`, {
      method: "DELETE",
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ApiError ? error.message : "Could not remove bookmark",
    };
  }
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function setChapterCompletedAction(
  chapterId: string,
  completed: boolean,
) {
  try {
    await api(`/api/v1/students/me/progress/${chapterId}`, {
      method: "PUT",
      body: {
        completed,
        progressPercent: completed ? 100 : 0,
      },
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ApiError ? error.message : "Could not update progress",
    };
  }
}

export async function toggleSectionCompletedAction(
  chapterId: string,
  sectionId: string,
  totalSections: number,
  completed: boolean,
) {
  try {
    const progress = await api<ProgressResponse>(
      "/api/v1/students/me/progress",
    );
    const current = progress.chapters[chapterId];
    const currentSections = current?.completedSections ?? [];
    const nextSections = completed
      ? Array.from(new Set([...currentSections, sectionId]))
      : currentSections.filter((id) => id !== sectionId);
    const percent = Math.min(
      100,
      Math.round((nextSections.length / Math.max(1, totalSections)) * 100),
    );

    await api(`/api/v1/students/me/progress/${chapterId}`, {
      method: "PUT",
      body: {
        progressPercent: percent,
        completed: percent === 100,
        sectionId,
        completedSections: nextSections,
      },
    });
    revalidatePath("/", "layout");
    return { ok: true as const, completed: percent === 100 };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ApiError ? error.message : "Could not update topic",
    };
  }
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function markNotificationReadAction(notificationId: string) {
  try {
    await api(`/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ApiError
          ? error.message
          : "Could not mark notification as read",
    };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    await api("/api/v1/notifications/read-all", { method: "POST" });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ApiError
          ? error.message
          : "Could not mark notifications as read",
    };
  }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const optional = (formData: FormData, key: string) => {
  const value = text(formData, key);
  return value.length > 0 ? value : undefined;
};

export async function updateProfileAction(formData: FormData) {
  try {
    const body: Record<string, unknown> = {
      firstName: text(formData, "firstName"),
      lastName: text(formData, "lastName"),
    };

    const gender = text(formData, "gender").toUpperCase();
    if (gender) body.gender = gender;

    const dob = text(formData, "dob");
    if (dob) body.dob = dob;

    body.district = text(formData, "district");
    body.villageCity = text(formData, "location");
    body.schoolName = text(formData, "schoolName");
    body.rollNumber = text(formData, "rollNumber");
    body.fatherName = text(formData, "fatherName");
    body.motherName = text(formData, "motherName");

    const section = text(formData, "section").toUpperCase();
    if (section) body.section = section;

    const medium = text(formData, "medium").toUpperCase();
    if (medium) body.medium = medium;

    const classId = optional(formData, "classId");
    if (classId) {
      body.classId = classId;
      const grade = classId.replace(/\D/g, "");
      if (grade) body.grade = grade;
    }

    const phone = text(formData, "parentPhone").replace(/\D/g, "");
    body.parentPhone = phone.length > 0 ? phone : undefined;

    const goal = Number(text(formData, "studyGoalMinutes"));
    if (Number.isFinite(goal) && goal > 0) body.studyGoalMinutes = goal;

    const avatar = formData.get("avatar");
    if (avatar instanceof File && avatar.size > 0) {
      const upload = new FormData();
      upload.append("file", avatar, avatar.name || "avatar.jpg");
      await apiForm("/api/v1/students/me/avatar", upload);
    }

    await api("/api/v1/students/me/profile", {
      method: "PATCH",
      body,
    });

    revalidatePath("/", "layout");
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Could not save your profile. Please try again.";
    redirect(`/profile/edit?error=${encodeURIComponent(message)}`);
  }

  redirect("/profile?updated=1");
}

export async function removeAvatarAction() {
  try {
    await api("/api/v1/students/me/avatar", { method: "DELETE" });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ApiError ? error.message : "Could not remove photo",
    };
  }
}

export async function updateMediumAction(medium: "ENGLISH" | "TELUGU") {
  try {
    await api("/api/v1/students/me/profile", {
      method: "PATCH",
      body: { medium },
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ApiError ? error.message : "Could not save medium",
    };
  }
}

export async function updateStudyGoalAction(minutes: number) {
  try {
    await api("/api/v1/students/me/profile", {
      method: "PATCH",
      body: { studyGoalMinutes: minutes },
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ApiError ? error.message : "Could not save study goal",
    };
  }
}

export async function updateNotificationsAction(enabled: boolean) {
  try {
    await api("/api/v1/students/me/settings", {
      method: "PATCH",
      body: { notificationsEnabled: enabled },
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ApiError
          ? error.message
          : "Could not save notification preference",
    };
  }
}

export async function updateLanguageAction(language: "en" | "te") {
  try {
    await api("/api/v1/students/me/settings", {
      method: "PATCH",
      body: { language },
    });
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ApiError ? error.message : "Could not save language",
    };
  }
}

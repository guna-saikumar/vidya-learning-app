import { BookmarkItem, BookmarkType, UserProfile } from '../types/curriculum';
import { getApiBaseUrl } from './apiClient';

/**
 * Ensures an avatar URL is an absolute, loadable URI.
 * Fastify backend stores avatar paths as relative URLs (e.g. `/uploads/avatars/user.jpg?v=...`),
 * which React Native <Image> cannot resolve natively without an absolute origin.
 */
export function resolveAvatarUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const base = getApiBaseUrl().replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

/** Defaults used when API/cache omit fields. */
export const DEFAULT_USER_PROFILE: UserProfile = {
  displayName: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  activeClassId: '',
  schoolName: '',
  location: '',
  district: '',
  section: '',
  rollNumber: '',
  medium: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  guardianPhone: '',
  parentPhone: '',
  academicYear: '',
  isOnboarded: false,
  streakDays: 0,
  avatarUrl: '',
  studyGoalMinutes: 0,
};

/**
 * Map API profile DTO (`classId`, `dob`, `villageCity`, `name`) onto the
 * mobile `UserProfile` shape (`activeClassId`, `dateOfBirth`, `location`,
 * `displayName`).
 */
export function normalizeProfile(api: Record<string, unknown> | null | undefined): UserProfile {
  const a = api ?? {};
  const firstName = String(a.firstName ?? '');
  const lastName = String(a.lastName ?? '');
  const name = String(a.name ?? a.displayName ?? '').trim();
  const displayName =
    name || [firstName, lastName].filter(Boolean).join(' ').trim();

  const rawClassId = String(a.activeClassId ?? a.classId ?? '');
  const normalizedClassId = rawClassId
    ? rawClassId.startsWith('class-')
      ? rawClassId
      : `class-${rawClassId.replace(/\D/g, '')}`
    : '';

  const rawMedium = String(a.medium ?? '').toUpperCase();
  const normalizedMedium = rawMedium.includes('TELUGU')
    ? 'Telugu Medium'
    : rawMedium.includes('URDU')
    ? 'Urdu Medium'
    : rawMedium.includes('ENGLISH')
    ? 'English Medium'
    : String(a.medium ?? '');

  return {
    ...DEFAULT_USER_PROFILE,
    ...(a as Partial<UserProfile>),
    displayName,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    dateOfBirth: String(a.dateOfBirth ?? a.dob ?? ''),
    activeClassId: normalizedClassId || rawClassId,
    location: String(a.location ?? a.villageCity ?? ''),
    schoolName: String(a.schoolName ?? ''),
    district: String(a.district ?? ''),
    section: String(a.section ?? '').toUpperCase(),
    rollNumber: String(a.rollNumber ?? ''),
    medium: normalizedMedium || String(a.medium ?? ''),
    fatherName: a.fatherName != null ? String(a.fatherName) : undefined,
    motherName: a.motherName != null ? String(a.motherName) : undefined,
    parentPhone: a.parentPhone != null ? String(a.parentPhone) : undefined,
    guardianPhone: a.guardianPhone != null ? String(a.guardianPhone) : undefined,
    avatarUrl: a.avatarUrl ? resolveAvatarUrl(String(a.avatarUrl)) : '',
    streakDays: Number(a.streakDays ?? 0) || 0,
    isOnboarded: Boolean(a.isOnboarded),
    gender: a.gender != null ? String(a.gender) : undefined,
    studyGoalMinutes: typeof a.studyGoalMinutes === 'number' ? a.studyGoalMinutes : (Number(a.studyGoalMinutes) || 30),
  };
}

/**
 * Map mobile profile updates to the API onboarding/PATCH body
 * (`classId`, `dob`, `villageCity`).
 */
export function toApiProfilePatch(
  updates: Partial<UserProfile> & Record<string, unknown>
): Record<string, unknown> {
  const body: Record<string, unknown> = { ...updates };

  if (updates.activeClassId !== undefined) {
    body.classId = updates.activeClassId;
    const gradeMatch = String(updates.activeClassId).match(/\d+/);
    if (gradeMatch) {
      body.grade = gradeMatch[0];
    }
    delete body.activeClassId;
  }
  if (updates.grade !== undefined) {
    const gradeMatch = String(updates.grade).match(/\d+/);
    if (gradeMatch) {
      body.grade = gradeMatch[0];
    }
  }
  if (updates.dateOfBirth !== undefined) {
    body.dob = toIsoDateOfBirth(String(updates.dateOfBirth)) || updates.dateOfBirth;
    delete body.dateOfBirth;
  }
  if (updates.location !== undefined) {
    body.villageCity = updates.location;
    delete body.location;
  }
  if (typeof updates.medium === 'string') {
    const u = updates.medium.toUpperCase();
    body.medium = u.includes('TELUGU') ? 'TELUGU' : u.includes('URDU') ? 'URDU' : 'ENGLISH';
  }
  if (typeof updates.gender === 'string') {
    body.gender = updates.gender.toUpperCase();
  }
  if (typeof updates.section === 'string') {
    const s = updates.section.trim().toUpperCase();
    const match = s.match(/[A-D]/);
    body.section = match ? match[0] : s;
  }
  if (!body.parentPhone && updates.guardianPhone) {
    body.parentPhone = updates.guardianPhone;
  }
  delete body.guardianPhone;
  if (updates.studyGoalMinutes !== undefined) {
    body.studyGoalMinutes = Number(updates.studyGoalMinutes);
  }
  // Not part of the student profile API schema
  delete body.displayName;
  delete body.academicYear;
  delete body.guardianName;
  delete body.streakDays;
  delete body.isOnboarded;
  delete body.avatarUrl;

  return body;
}

/** Convert UI DOB (`DD/MM/YYYY` or `YYYY-MM-DD` or ISO timestamp) to API `YYYY-MM-DD`, or null if invalid. */
export function toIsoDateOfBirth(raw?: string | null): string | null {
  if (!raw) return null;
  const value = String(raw).trim();
  const isoMatch = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (isoMatch) {
    const iso = isoMatch[1];
    const d = new Date(`${iso}T00:00:00Z`);
    if (!Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso) {
      return iso;
    }
  }
  const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value);
  if (match) {
    const [, dd, mm, yyyy] = match;
    const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    const d = new Date(`${iso}T00:00:00Z`);
    if (!Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso) {
      return iso;
    }
  }
  return null;
}

/** Convert any valid DOB string to DD/MM/YYYY for UI display. */
export function formatUiDateOfBirth(raw?: string | null): string {
  if (!raw) return '';
  const iso = toIsoDateOfBirth(raw);
  if (iso) {
    const [yyyy, mm, dd] = iso.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
  return String(raw);
}

export interface DobValidationResult {
  valid: boolean;
  error?: string;
  iso?: string;
  age?: number;
}

/** Comprehensive validation for Student Date of Birth (format, future date, age range). */
export function validateDateOfBirth(raw: string): DobValidationResult {
  if (!raw || !raw.trim()) {
    return { valid: false, error: 'Please enter or select a date of birth.' };
  }
  const iso = toIsoDateOfBirth(raw);
  if (!iso) {
    return { valid: false, error: 'Please enter a valid date in DD/MM/YYYY or YYYY-MM-DD format.' };
  }

  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  const dobDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dobDate.getTime() > today.getTime()) {
    return { valid: false, error: 'Date of birth cannot be in the future.' };
  }

  // Calculate age accurately
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() - (m - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    age--;
  }

  if (age < 5) {
    return { valid: false, error: 'Student must be at least 5 years old to enroll.' };
  }
  if (age > 25) {
    return { valid: false, error: 'Student age cannot exceed 25 years.' };
  }

  return { valid: true, iso, age };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

const BOOKMARK_TYPES = ['chapter', 'section', 'formula'] as const;

function isBookmarkType(value: string): value is BookmarkType {
  return (BOOKMARK_TYPES as readonly string[]).includes(value);
}

function parseBookmarkType(
  value: unknown,
  sectionId: string | undefined
): BookmarkType {
  if (value === undefined || value === null || value === '') {
    return sectionId ? 'section' : 'chapter';
  }
  if (typeof value === 'string' && isBookmarkType(value)) {
    return value;
  }
  throw new Error(`Unsupported bookmark type: ${String(value)}`);
}

/**
 * Map an API bookmark DTO onto the mobile `BookmarkItem` shape.
 *
 * This deliberately throws instead of inventing an id or converting an
 * unknown type. A bookmark without a server id must never enter Redux/cache.
 */
export function normalizeBookmark(input: unknown): BookmarkItem {
  if (!isRecord(input)) {
    throw new Error('Invalid bookmark payload');
  }

  const id = nonEmptyString(input.id);
  const chapterId = nonEmptyString(input.chapterId);
  const classId = nonEmptyString(input.classId);
  const subjectId = nonEmptyString(input.subjectId);

  if (!id) throw new Error('Bookmark payload is missing id');
  if (!chapterId) throw new Error('Bookmark payload is missing chapterId');
  if (!classId) throw new Error('Bookmark payload is missing classId');
  if (!subjectId) throw new Error('Bookmark payload is missing subjectId');

  const sectionId = nonEmptyString(input.sectionId);
  const type = parseBookmarkType(input.type, sectionId);

  if (type === 'section' && !sectionId) {
    throw new Error('Section bookmark is missing sectionId');
  }

  const createdRaw = input.dateAdded ?? input.createdAt;
  let dateAdded = Date.now();
  if (typeof createdRaw === 'number') {
    dateAdded = createdRaw;
  } else if (typeof createdRaw === 'string') {
    const parsed = Date.parse(createdRaw);
    if (!Number.isNaN(parsed)) dateAdded = parsed;
  }

  return {
    id,
    chapterId,
    sectionId,
    subjectId,
    classId,
    title:
      nonEmptyString(input.title) ??
      nonEmptyString(input.chapterTitle) ??
      nonEmptyString(input.previewText) ??
      'Bookmark',
    subtitle:
      nonEmptyString(input.subtitle) ??
      nonEmptyString(input.sectionTitle) ??
      nonEmptyString(input.subjectName) ??
      '',
    type,
    previewText: optionalString(input.previewText),
    dateAdded,
  };
}

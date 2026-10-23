import { UserProfile } from '../types/curriculum';

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

  return {
    ...DEFAULT_USER_PROFILE,
    ...(a as Partial<UserProfile>),
    displayName,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    dateOfBirth: String(a.dateOfBirth ?? a.dob ?? ''),
    activeClassId: String(a.activeClassId ?? a.classId ?? ''),
    location: String(a.location ?? a.villageCity ?? ''),
    schoolName: String(a.schoolName ?? ''),
    district: String(a.district ?? ''),
    section: String(a.section ?? ''),
    rollNumber: String(a.rollNumber ?? ''),
    medium: String(a.medium ?? ''),
    fatherName: a.fatherName != null ? String(a.fatherName) : undefined,
    motherName: a.motherName != null ? String(a.motherName) : undefined,
    parentPhone: a.parentPhone != null ? String(a.parentPhone) : undefined,
    guardianPhone: a.guardianPhone != null ? String(a.guardianPhone) : undefined,
    avatarUrl: a.avatarUrl != null ? String(a.avatarUrl) : '',
    streakDays: Number(a.streakDays ?? 0) || 0,
    isOnboarded: Boolean(a.isOnboarded),
    gender: a.gender != null ? String(a.gender) : undefined,
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
    delete body.activeClassId;
  }
  if (updates.dateOfBirth !== undefined) {
    body.dob = updates.dateOfBirth;
    delete body.dateOfBirth;
  }
  if (updates.location !== undefined) {
    body.villageCity = updates.location;
    delete body.location;
  }
  // Not part of the student profile API schema
  delete body.displayName;
  delete body.academicYear;
  delete body.studyGoalMinutes;
  delete body.guardianName;
  delete body.streakDays;
  delete body.isOnboarded;
  delete body.avatarUrl;

  return body;
}

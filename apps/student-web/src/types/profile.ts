export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dob: string | null;
  dateOfBirth: string | null;
  district: string | null;
  location: string | null;
  villageCity: string | null;
  schoolName: string | null;
  classId: string | null;
  activeClassId: string | null;
  grade: string | null;
  section: string | null;
  medium: string | null;
  rollNumber: string | null;
  fatherName: string | null;
  motherName: string | null;
  parentPhone: string | null;
  studyGoalMinutes: number;
  academicYear?: string | null;
  avatarUrl: string | null;
  streakDays: number;
  language: string;
  notificationsEnabled: boolean;
  isOnboarded: boolean;
}

export interface ProfileUpdatePayload {
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  dob?: string | null;
  dateOfBirth?: string | null;
  district?: string | null;
  villageCity?: string | null;
  location?: string | null;
  schoolName?: string | null;
  grade?: string | null;
  section?: string | null;
  medium?: string | null;
  rollNumber?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  parentPhone?: string | null;
  studyGoalMinutes?: number | null;
  classId?: string | null;
}

export interface ProfileResponse {
  success?: boolean;
  profile: StudentProfile;
}
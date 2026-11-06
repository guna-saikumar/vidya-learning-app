import { apiClient } from '../lib/apiClient';
import type { ProfileResponse, ProfileUpdatePayload, StudentProfile } from '../types/profile';

export async function getProfile(): Promise<StudentProfile> {
  const res = await apiClient.get<StudentProfile>('/api/v1/students/me/profile');
  return res.data;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<StudentProfile> {
  const res = await apiClient.patch<ProfileResponse | StudentProfile>(
    '/api/v1/students/me/profile',
    payload
  );
  const data = res.data as ProfileResponse | StudentProfile;
  if ((data as ProfileResponse).profile) {
    return (data as ProfileResponse).profile;
  }
  return data as StudentProfile;
}

export async function updateSettings(payload: {
  language?: 'en' | 'te';
  notificationsEnabled?: boolean;
}): Promise<void> {
  await apiClient.patch('/api/v1/students/me/settings', payload);
}

export async function uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post<{ success: boolean; avatarUrl: string }>(
    '/api/v1/students/me/avatar',
    formData
  );
  return res.data;
}

export async function deleteAvatar(): Promise<void> {
  await apiClient.delete('/api/v1/students/me/avatar');
}
import { apiClient } from '../lib/apiClient';

export async function getProfile() {
  const res = await apiClient.get('/api/v1/students/me/profile');
  return res.data;
}

export async function updateProfile(payload) {
  const res = await apiClient.patch('/api/v1/students/me/profile', payload);
  const data = res.data;
  if (data && data.profile) {
    return data.profile;
  }
  return data;
}

export async function updateSettings(payload) {
  await apiClient.patch('/api/v1/students/me/settings', payload);
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/api/v1/students/me/avatar', formData);
  return res.data;
}

export async function deleteAvatar() {
  await apiClient.delete('/api/v1/students/me/avatar');
}


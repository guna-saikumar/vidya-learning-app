import { useCallback, useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/profileService';
import { extractErrorMessage } from '../lib/apiClient';
import type { ProfileUpdatePayload, StudentProfile } from '../types/profile';

export function useProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (payload: ProfileUpdatePayload) => {
    const updated = await updateProfile(payload);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, error, refresh, save, setProfile };
}
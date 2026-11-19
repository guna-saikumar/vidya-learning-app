import { useMemo } from 'react';
import { useAppSelector } from '../store';
import { getCurrentUserId } from '../services/doubtService';
import type { DoubtAuthor } from '../types/doubts';

/** The signed-in student, shaped as a doubt author. */
export const useDoubtAuthor = (): DoubtAuthor => {
  const displayName = useAppSelector((state) => state.student.profile?.displayName);
  return useMemo(
    () => ({ id: getCurrentUserId(), name: displayName || 'You', role: 'student' as const }),
    [displayName]
  );
};

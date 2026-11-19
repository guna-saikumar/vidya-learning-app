import { useMemo } from 'react';
import { useAppSelector } from '../store';
import type { DoubtAuthor } from '../types/doubts';

/** The signed-in student, shaped as a doubt author. */
export const useDoubtAuthor = (): DoubtAuthor => {
  const userId = useAppSelector((state) => state.auth.user?.id) || '';
  const displayName = useAppSelector(
    (state) => state.student.profile?.displayName || state.auth.user?.name
  );
  return useMemo(
    () => ({ id: userId, name: displayName || 'You', role: 'student' as const }),
    [userId, displayName]
  );
};

import type { DoubtAnswer, DoubtFilter, DoubtStatus, DoubtSummary } from '../types/doubts';

export const DOUBT_TITLE_MAX = 120;
export const DOUBT_TITLE_MIN = 8;
export const DOUBT_BODY_MIN = 10;

export const getDoubtStatus = (
  doubt: Pick<DoubtSummary, 'isResolved' | 'hasTeacherAnswer' | 'answerCount'>
): DoubtStatus => {
  if (doubt.isResolved) return 'resolved';
  if (doubt.hasTeacherAnswer) return 'teacher_answered';
  if (doubt.answerCount > 0) return 'peer_answered';
  return 'open';
};

export const DOUBT_STATUS_LABEL: Record<DoubtStatus, string> = {
  open: 'Open',
  peer_answered: 'Peer answers',
  teacher_answered: 'Teacher answered',
  resolved: 'Resolved',
};

export const filterDoubts = (
  doubts: DoubtSummary[],
  filter: DoubtFilter,
  query: string,
  currentUserId: string
): DoubtSummary[] => {
  const needle = query.trim().toLowerCase();
  return doubts.filter((d) => {
    if (filter === 'unanswered' && d.answerCount > 0) return false;
    if (filter === 'mine' && d.author.id !== currentUserId) return false;
    if (!needle) return true;
    return d.title.toLowerCase().includes(needle) || d.preview.toLowerCase().includes(needle);
  });
};

/** Accepted answer first, then teacher answers, then most helpful, then oldest. */
export const sortAnswers = (answers: DoubtAnswer[]): DoubtAnswer[] =>
  [...answers].sort((a, b) => {
    if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
    const aTeacher = a.author.role === 'teacher';
    const bTeacher = b.author.role === 'teacher';
    if (aTeacher !== bTeacher) return aTeacher ? -1 : 1;
    if (a.helpfulCount !== b.helpfulCount) return b.helpfulCount - a.helpfulCount;
    return a.createdAt.localeCompare(b.createdAt);
  });

export const formatRelativeTime = (iso: string, now: number = Date.now()): string => {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const minutes = Math.floor((now - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(then).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatAnswerCount = (count: number): string =>
  count === 0 ? 'No answers yet' : count === 1 ? '1 answer' : `${count} answers`;

export type DoubtFormErrors = { title?: string; body?: string };

export const validateDoubtForm = (title: string, body: string): DoubtFormErrors => {
  const errors: DoubtFormErrors = {};
  const t = title.trim();
  if (t.length < DOUBT_TITLE_MIN) errors.title = `Write at least ${DOUBT_TITLE_MIN} characters.`;
  else if (t.length > DOUBT_TITLE_MAX) errors.title = `Keep the title under ${DOUBT_TITLE_MAX} characters.`;
  if (body.trim().length < DOUBT_BODY_MIN) {
    errors.body = 'Say what you tried and where you got stuck.';
  }
  return errors;
};

/** Titles of existing doubts that share meaningful words with what the student is typing. */
export const findSimilarDoubts = (
  title: string,
  doubts: DoubtSummary[],
  limit = 2
): DoubtSummary[] => {
  const words = title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  if (words.length === 0) return [];
  return doubts
    .map((d) => {
      const hay = d.title.toLowerCase();
      return { d, score: words.filter((w) => hay.includes(w)).length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.d);
};

export const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

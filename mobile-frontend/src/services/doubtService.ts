import { buildSampleDoubts, SAMPLE_CURRENT_USER_ID } from '../data/doubts';
import type {
  CreateDoubtInput,
  DoubtAnswer,
  DoubtAuthor,
  DoubtSummary,
  DoubtThread,
} from '../types/doubts';

// In-memory stand-in for the doubts API. Every function here maps to one endpoint
// in the backend issue (#72); swap the bodies for api-client calls and keep the signatures.

let threads: DoubtThread[] | null = null;
let counter = 0;

const store = (): DoubtThread[] => {
  if (!threads) threads = buildSampleDoubts();
  return threads;
};

const nextId = (prefix: string) => `${prefix}-local-${++counter}`;

const toSummary = (t: DoubtThread): DoubtSummary => ({
  id: t.id,
  chapterId: t.chapterId,
  sectionId: t.sectionId,
  title: t.title,
  preview: t.body,
  author: t.author,
  createdAt: t.createdAt,
  upvoteCount: t.upvoteCount,
  upvotedByMe: t.upvotedByMe,
  answerCount: t.answers.length,
  hasTeacherAnswer: t.answers.some((a) => a.author.role === 'teacher'),
  isResolved: t.isResolved,
});

export const getCurrentUserId = (): string => SAMPLE_CURRENT_USER_ID;

export const listDoubts = async (chapterId: string): Promise<DoubtSummary[]> =>
  store()
    .filter((t) => t.chapterId === chapterId)
    .map(toSummary)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getDoubtThread = async (doubtId: string): Promise<DoubtThread | undefined> =>
  store().find((t) => t.id === doubtId);

export const createDoubt = async (
  input: CreateDoubtInput,
  author: DoubtAuthor
): Promise<DoubtThread> => {
  const thread: DoubtThread = {
    id: nextId('d'),
    chapterId: input.chapterId,
    sectionId: input.sectionId,
    title: input.title.trim(),
    body: input.body.trim(),
    author,
    createdAt: new Date().toISOString(),
    upvoteCount: 0,
    upvotedByMe: false,
    isResolved: false,
    answers: [],
  };
  store().unshift(thread);
  return thread;
};

export const postAnswer = async (
  doubtId: string,
  body: string,
  author: DoubtAuthor
): Promise<DoubtAnswer | undefined> => {
  const thread = store().find((t) => t.id === doubtId);
  if (!thread) return undefined;
  const answer: DoubtAnswer = {
    id: nextId('a'),
    doubtId,
    author,
    body: body.trim(),
    helpfulCount: 0,
    markedHelpfulByMe: false,
    isAccepted: false,
    createdAt: new Date().toISOString(),
  };
  thread.answers.push(answer);
  return answer;
};

export const toggleDoubtUpvote = async (doubtId: string): Promise<void> => {
  const thread = store().find((t) => t.id === doubtId);
  if (!thread) return;
  thread.upvotedByMe = !thread.upvotedByMe;
  thread.upvoteCount += thread.upvotedByMe ? 1 : -1;
};

export const toggleAnswerHelpful = async (doubtId: string, answerId: string): Promise<void> => {
  const answer = store().find((t) => t.id === doubtId)?.answers.find((a) => a.id === answerId);
  if (!answer) return;
  answer.markedHelpfulByMe = !answer.markedHelpfulByMe;
  answer.helpfulCount += answer.markedHelpfulByMe ? 1 : -1;
};

export const resolveDoubt = async (doubtId: string, acceptedAnswerId?: string): Promise<void> => {
  const thread = store().find((t) => t.id === doubtId);
  if (!thread) return;
  thread.isResolved = true;
  if (acceptedAnswerId) {
    thread.answers.forEach((a) => {
      a.isAccepted = a.id === acceptedAnswerId;
    });
  }
};

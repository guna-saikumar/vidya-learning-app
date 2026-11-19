import { store } from '../store';
import { doubtsApi, getApiErrorMessage } from './apiClient';
import type {
  CreateDoubtInput,
  DoubtAnswer,
  DoubtAuthor,
  DoubtSummary,
  DoubtThread,
} from '../types/doubts';

export const getCurrentUserId = (): string => {
  return store.getState().auth.user?.id || '';
};

export const listDoubts = async (chapterId: string): Promise<DoubtSummary[]> => {
  try {
    return await doubtsApi.listDoubts(chapterId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load doubts.'));
  }
};

export const getDoubtThread = async (doubtId: string): Promise<DoubtThread | undefined> => {
  try {
    return await doubtsApi.getDoubtThread(doubtId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load doubt thread.'));
  }
};

export const createDoubt = async (
  input: CreateDoubtInput,
  _author?: DoubtAuthor
): Promise<DoubtThread> => {
  try {
    return await doubtsApi.createDoubt(input.chapterId, {
      title: input.title,
      body: input.body,
      sectionId: input.sectionId,
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to post doubt.'));
  }
};

export const postAnswer = async (
  doubtId: string,
  body: string,
  _author?: DoubtAuthor
): Promise<DoubtAnswer | undefined> => {
  try {
    return await doubtsApi.postAnswer(doubtId, { body });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to post answer.'));
  }
};

export const toggleDoubtUpvote = async (doubtId: string): Promise<void> => {
  try {
    await doubtsApi.toggleUpvote(doubtId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update upvote.'));
  }
};

export const toggleAnswerHelpful = async (doubtId: string, answerId: string): Promise<void> => {
  try {
    await doubtsApi.toggleHelpful(doubtId, answerId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update helpful vote.'));
  }
};

export const resolveDoubt = async (doubtId: string, acceptedAnswerId?: string): Promise<void> => {
  try {
    await doubtsApi.resolveDoubt(doubtId, acceptedAnswerId ? { acceptedAnswerId } : undefined);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to resolve doubt.'));
  }
};

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  filterDoubts,
  findSimilarDoubts,
  formatAnswerCount,
  formatRelativeTime,
  getDoubtStatus,
  getInitials,
  sortAnswers,
  validateDoubtForm,
} from '../src/utils/doubts';
import type { DoubtAnswer, DoubtSummary } from '../src/types/doubts';

const student = { id: 's1', name: 'Ananya R.', role: 'student' as const };
const teacher = { id: 't1', name: 'Ms. Lakshmi', role: 'teacher' as const };

const summary = (over: Partial<DoubtSummary> = {}): DoubtSummary => ({
  id: 'd1',
  chapterId: 'c10-m-ch1',
  title: 'Is 1 a prime number?',
  preview: 'Where does 1 fit in the theorem?',
  author: student,
  createdAt: '2026-11-19T00:00:00.000Z',
  upvoteCount: 0,
  upvotedByMe: false,
  answerCount: 0,
  hasTeacherAnswer: false,
  isResolved: false,
  ...over,
});

const answer = (over: Partial<DoubtAnswer> = {}): DoubtAnswer => ({
  id: 'a1',
  doubtId: 'd1',
  author: student,
  body: 'text',
  helpfulCount: 0,
  markedHelpfulByMe: false,
  isAccepted: false,
  createdAt: '2026-11-19T00:00:00.000Z',
  ...over,
});

describe('getDoubtStatus', () => {
  it('is open with no answers', () => {
    assert.equal(getDoubtStatus(summary()), 'open');
  });
  it('is peer_answered when only students answered', () => {
    assert.equal(getDoubtStatus(summary({ answerCount: 2 })), 'peer_answered');
  });
  it('is teacher_answered when a teacher answered', () => {
    assert.equal(getDoubtStatus(summary({ answerCount: 1, hasTeacherAnswer: true })), 'teacher_answered');
  });
  it('resolved wins over everything else', () => {
    assert.equal(
      getDoubtStatus(summary({ answerCount: 1, hasTeacherAnswer: true, isResolved: true })),
      'resolved'
    );
  });
});

describe('filterDoubts', () => {
  const list = [
    summary({ id: 'a', title: 'Prime numbers', answerCount: 0 }),
    summary({ id: 'b', title: 'Logarithms', preview: 'negative base', answerCount: 2 }),
    summary({ id: 'c', title: 'Irrational roots', author: { id: 'me', name: 'Me', role: 'student' } }),
  ];
  it('returns everything for all with an empty query', () => {
    assert.equal(filterDoubts(list, 'all', '  ', 'me').length, 3);
  });
  it('unanswered keeps only doubts with no answers', () => {
    assert.deepEqual(filterDoubts(list, 'unanswered', '', 'me').map((d) => d.id), ['a', 'c']);
  });
  it('mine keeps only the current user\'s doubts', () => {
    assert.deepEqual(filterDoubts(list, 'mine', '', 'me').map((d) => d.id), ['c']);
  });
  it('search matches title and preview, case-insensitively', () => {
    assert.deepEqual(filterDoubts(list, 'all', 'NEGATIVE', 'me').map((d) => d.id), ['b']);
    assert.deepEqual(filterDoubts(list, 'all', 'prime', 'me').map((d) => d.id), ['a']);
  });
});

describe('sortAnswers', () => {
  it('orders accepted, then teacher, then helpful, then oldest', () => {
    const sorted = sortAnswers([
      answer({ id: 'peer-low', helpfulCount: 1, createdAt: '2026-11-19T01:00:00.000Z' }),
      answer({ id: 'peer-high', helpfulCount: 5, createdAt: '2026-11-19T02:00:00.000Z' }),
      answer({ id: 'teacher', author: teacher, helpfulCount: 0 }),
      answer({ id: 'accepted', isAccepted: true, helpfulCount: 0 }),
    ]);
    assert.deepEqual(sorted.map((a) => a.id), ['accepted', 'teacher', 'peer-high', 'peer-low']);
  });
  it('does not mutate its input', () => {
    const input = [answer({ id: 'x', helpfulCount: 1 }), answer({ id: 'y', helpfulCount: 9 })];
    sortAnswers(input);
    assert.deepEqual(input.map((a) => a.id), ['x', 'y']);
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-11-19T12:00:00.000Z');
  it('formats minutes, hours and days', () => {
    assert.equal(formatRelativeTime('2026-11-19T11:59:40.000Z', now), 'Just now');
    assert.equal(formatRelativeTime('2026-11-19T11:30:00.000Z', now), '30 min ago');
    assert.equal(formatRelativeTime('2026-11-19T11:00:00.000Z', now), '1 hour ago');
    assert.equal(formatRelativeTime('2026-11-19T07:00:00.000Z', now), '5 hours ago');
    assert.equal(formatRelativeTime('2026-11-18T10:00:00.000Z', now), 'Yesterday');
    assert.equal(formatRelativeTime('2026-11-16T12:00:00.000Z', now), '3 days ago');
  });
  it('returns an empty string for an invalid date', () => {
    assert.equal(formatRelativeTime('not a date', now), '');
  });
});

describe('formatAnswerCount', () => {
  it('handles zero, one and many', () => {
    assert.equal(formatAnswerCount(0), 'No answers yet');
    assert.equal(formatAnswerCount(1), '1 answer');
    assert.equal(formatAnswerCount(4), '4 answers');
  });
});

describe('validateDoubtForm', () => {
  it('accepts a valid doubt', () => {
    assert.deepEqual(validateDoubtForm('Why is 1 not prime?', 'I tried 6 = 1 x 2 x 3.'), {});
  });
  it('rejects a short title and a short body', () => {
    const errors = validateDoubtForm('Why?', 'idk');
    assert.ok(errors.title);
    assert.ok(errors.body);
  });
  it('rejects a title over 120 characters', () => {
    assert.ok(validateDoubtForm('x'.repeat(121), 'long enough body text').title);
  });
});

describe('findSimilarDoubts', () => {
  const list = [
    summary({ id: 'a', title: 'Is 1 a prime number?' }),
    summary({ id: 'b', title: 'Can a logarithm be negative?' }),
  ];
  it('ranks doubts that share meaningful words', () => {
    assert.deepEqual(findSimilarDoubts('prime number question', list).map((d) => d.id), ['a']);
  });
  it('ignores short words and returns nothing for no overlap', () => {
    assert.deepEqual(findSimilarDoubts('is it a', list), []);
  });
});

describe('getInitials', () => {
  it('uses the first letters of up to two words', () => {
    assert.equal(getInitials('Ananya R.'), 'AR');
    assert.equal(getInitials('Ms. Lakshmi Devi'), 'ML');
    assert.equal(getInitials('karthik'), 'K');
  });
  it('falls back to a question mark for an empty name', () => {
    assert.equal(getInitials('   '), '?');
  });
});

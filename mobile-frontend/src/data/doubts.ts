import type { DoubtThread } from '../types/doubts';

// Placeholder content so the doubt screens can be reviewed before the API exists.
// Replace the in-memory store in services/doubtService.ts with api-client calls
// (backend issue #72) and delete this file.

export const SAMPLE_CURRENT_USER_ID = 'sample-me';

const teacher = { id: 'sample-t1', name: 'Ms. Lakshmi', role: 'teacher' as const };
const ananya = { id: 'sample-s1', name: 'Ananya R.', role: 'student' as const };
const rohit = { id: 'sample-s2', name: 'Rohit M.', role: 'student' as const };
const meera = { id: 'sample-s3', name: 'Meera S.', role: 'student' as const };
const karthik = { id: 'sample-s4', name: 'Karthik N.', role: 'student' as const };

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();

export const buildSampleDoubts = (): DoubtThread[] => [
  {
    id: 'sample-d1',
    chapterId: 'c10-m-ch1',
    sectionId: 'c10-m-ch1-s1',
    title: 'Does HCF × LCM = product also work for three numbers?',
    body:
      'In the theorem we multiply HCF and LCM of two numbers to get their product. I tried 2, 4 and 8 and it did not match. Is the rule only for two numbers?',
    author: ananya,
    createdAt: ago(120),
    upvoteCount: 12,
    upvotedByMe: false,
    isResolved: true,
    answers: [
      {
        id: 'sample-a1',
        doubtId: 'sample-d1',
        author: teacher,
        body:
          'Yes, only for two numbers. The proof compares prime powers: for each prime, the HCF takes the smaller power and the LCM takes the larger one, and smaller + larger = the sum of the two powers. That pairing breaks with three numbers. For 2, 4 and 8 the HCF is 2 and the LCM is 8, so 2 × 8 = 16, while 2 × 4 × 8 = 64.',
        helpfulCount: 9,
        markedHelpfulByMe: false,
        isAccepted: true,
        createdAt: ago(90),
      },
      {
        id: 'sample-a2',
        doubtId: 'sample-d1',
        author: karthik,
        body: 'I also got stuck here. Writing each number as a product of prime powers made it clear for me.',
        helpfulCount: 2,
        markedHelpfulByMe: false,
        isAccepted: false,
        createdAt: ago(60),
      },
    ],
  },
  {
    id: 'sample-d2',
    chapterId: 'c10-m-ch1',
    sectionId: 'c10-m-ch1-s1',
    title: 'Is 1 a prime number or a composite number?',
    body: 'The theorem says every composite number is a product of primes. Where does 1 fit?',
    author: rohit,
    createdAt: ago(300),
    upvoteCount: 7,
    upvotedByMe: false,
    isResolved: false,
    answers: [
      {
        id: 'sample-a3',
        doubtId: 'sample-d2',
        author: meera,
        body:
          'It is neither. A prime has exactly two different factors, and 1 has only one. If 1 were prime, 6 = 2 × 3 = 1 × 2 × 3 would be two different factorisations and the theorem would stop being unique.',
        helpfulCount: 4,
        markedHelpfulByMe: false,
        isAccepted: false,
        createdAt: ago(240),
      },
    ],
  },
  {
    id: 'sample-d3',
    chapterId: 'c10-m-ch1',
    title: 'How do I prove that √3 is irrational?',
    body: 'I can follow the √2 proof in the book. Can I copy the same steps for √3?',
    author: meera,
    createdAt: ago(1500),
    upvoteCount: 4,
    upvotedByMe: false,
    isResolved: false,
    answers: [],
  },
  {
    id: 'sample-d4',
    chapterId: 'c10-m-ch1',
    sectionId: 'c10-m-ch1-s2',
    title: 'Can a logarithm be negative?',
    body: 'My friend says log of a number can never be negative. Is that right?',
    author: ananya,
    createdAt: ago(2900),
    upvoteCount: 3,
    upvotedByMe: false,
    isResolved: false,
    answers: [
      {
        id: 'sample-a4',
        doubtId: 'sample-d4',
        author: teacher,
        body:
          'The logarithm can be negative, but the number inside it must be positive. For base 2, log₂(1/8) = −3 because 2⁻³ = 1/8. Log of zero or of a negative number is not defined.',
        helpfulCount: 5,
        markedHelpfulByMe: false,
        isAccepted: false,
        createdAt: ago(2800),
      },
    ],
  },
];

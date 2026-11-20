import { z } from 'zod';

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? null : v ?? null));

const genderEnum = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(z.enum(['MALE', 'FEMALE', 'OTHER']))
  .optional()
  .nullable();

const sectionEnum = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(z.enum(['A', 'B', 'C', 'D']))
  .optional()
  .nullable();

const mediumEnum = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(z.enum(['ENGLISH', 'TELUGU', 'URDU']))
  .optional()
  .nullable();

const isoDate = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => {
    if (!v) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(v);
  }, 'Expected YYYY-MM-DD');

const mobile10 = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((v) => {
    if (!v) return true;
    return /^[6-9]\d{9}$|^\d{10}$/.test(v);
  }, 'Phone number must contain exactly 10 digits and numbers only.');

export const profileEditSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must have at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Last name can only contain letters and spaces'),
  gender: genderEnum,
  dob: isoDate,
  district: optionalText(120),
  location: optionalText(120),
  schoolName: optionalText(200),
  grade: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((v) => !v || /^(?:[6-9]|10)$/.test(v), 'Grade must be 6-10'),
  section: sectionEnum,
  medium: mediumEnum,
  rollNumber: optionalText(40).refine(
    (v) => !v || /^[A-Za-z0-9\-_]+$/.test(v),
    'Roll number can only contain letters, numbers, and hyphens'
  ),
  fatherName: optionalText(80).refine(
    (v) => !v || /^[A-Za-z\s.]*$/.test(v),
    'Father name can only contain letters, spaces, and dots'
  ),
  motherName: optionalText(80).refine(
    (v) => !v || /^[A-Za-z\s.]*$/.test(v),
    'Mother name can only contain letters, spaces, and dots'
  ),
  parentPhone: mobile10,
  studyGoalMinutes: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    })
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 360), {
      message: 'Study goal must be 1-360 minutes',
    }),
});


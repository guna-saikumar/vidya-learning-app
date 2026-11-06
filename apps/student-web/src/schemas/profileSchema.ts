import { z } from 'zod';

const optionalText = (max: number) =>
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
    return /^\d{10}$/.test(v);
  }, 'Mobile number must contain exactly 10 digits.');

export const profileEditSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
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
  rollNumber: optionalText(40),
  fatherName: optionalText(120),
  motherName: optionalText(120),
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

export type ProfileEditValues = z.infer<typeof profileEditSchema>;
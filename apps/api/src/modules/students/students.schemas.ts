import { z } from "zod";

const id = z.string().trim().min(1).max(120);

/** Optional free text; `null` / empty string clears the value. */
const optText = (max: number) => z.string().trim().max(max).nullish();

/** Case-insensitive enum normalised to UPPERCASE (e.g. "male" → "MALE"). */
const upperEnum = <const T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(values as unknown as [string, ...string[]]));

const isoDate = z
  .string()
  .trim()
  .transform((v) => (v.includes("T") ? v.slice(0, 10) : v))
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
      .refine((v) => {
        const d = new Date(`${v}T00:00:00Z`);
        return (
          !Number.isNaN(d.getTime()) &&
          d.toISOString().slice(0, 10) === v &&
          d.getTime() <= Date.now()
        );
      }, "Invalid date of birth")
  );

const mobile10 = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).replace(/\D/g, "");
    return s.length === 10 ? s : s.length === 0 ? null : String(v);
  })
  .pipe(z.string().regex(/^\d{10}$/, "Must be a 10-digit mobile number").nullable());

const mediumEnum = z
  .string()
  .trim()
  .toUpperCase()
  .transform((v) => {
    if (v.includes("TELUGU")) return "TELUGU";
    if (v.includes("URDU")) return "URDU";
    if (v.includes("ENGLISH")) return "ENGLISH";
    return v;
  })
  .pipe(z.enum(["ENGLISH", "TELUGU", "URDU"]))
  .nullish();

/** Grade 6–10 (string or number on the wire). */
const grade = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .pipe(z.string().regex(/^(?:[6-9]|10)$/, "Grade must be 6-10"));

/**
 * Onboarding fields matching frontend forms exactly (4 steps):
 *  1. Personal (firstName, lastName, gender, dob)
 *  2. Location & School (district, location / villageCity, schoolName)
 *  3. Academic (classId, grade, section, medium, rollNumber)
 *  4. Parent Details (fatherName, motherName, parentPhone)
 */
const onboardingShape = {
  // Step 1 — Personal
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  gender: upperEnum(["MALE", "FEMALE", "OTHER"]),
  dob: isoDate,
  dateOfBirth: isoDate.optional(),

  // Step 2 — Location & School
  district: optText(120),
  villageCity: optText(120),
  location: optText(120),
  schoolName: optText(200),

  // Step 3 — Academic
  classId: id.nullish(),
  grade,
  section: upperEnum(["A", "B", "C", "D"]).nullish(),
  medium: mediumEnum,
  rollNumber: optText(40),

  // Step 4 — Parent Details
  fatherName: optText(120),
  motherName: optText(120),
  parentPhone: mobile10,
} as const;

export const updateOnboardingSchema = z.object(onboardingShape);

/** PATCH: every onboarding field optional. */
export const updateProfileSchema = updateOnboardingSchema.partial();

export const updateSettingsSchema = z
  .object({
    language: z.enum(["en", "te"]).optional(),
    notificationsEnabled: z.boolean().optional(),
  })
  .refine(
    (v) => v.language !== undefined || v.notificationsEnabled !== undefined,
    "Provide language and/or notificationsEnabled"
  );

export const upsertProgressSchema = z.object({
  progressPercent: z.number().int().min(0).max(100),
  completed: z.boolean(),
  sectionId: id.optional(),
});

export const createBookmarkSchema = z.object({
  chapterId: id,
  sectionId: id.nullish(),
  previewText: z.string().trim().max(2000).nullish(),
});

export type UpdateOnboardingInput = z.infer<typeof updateOnboardingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpsertProgressInput = z.infer<typeof upsertProgressSchema>;
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;

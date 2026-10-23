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
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return (
      !Number.isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === v &&
      d.getTime() <= Date.now()
    );
  }, "Invalid date of birth");

const bloodGroup = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^(A|B|AB|O)[+-]$/, "Invalid blood group");

const mobile10 = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Must be a 10-digit mobile number");

/** Grade 6–10 (string or number on the wire). */
const grade = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .pipe(z.string().regex(/^(?:[6-9]|10)$/, "Grade must be 6-10"));

/**
 * Onboarding fields (4 steps):
 *  1. Personal   2. Address   3. Academic & School   4. Parent & Guardian
 * Optional fields accept `null` to explicitly clear them.
 */
const onboardingShape = {
  // Step 1 — personal
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  gender: upperEnum(["MALE", "FEMALE", "OTHER"]),
  dob: isoDate,
  aadharNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Aadhar number must be 12 digits")
    .nullish(),
  bloodGroup: bloodGroup.nullish(),
  casteCategory: upperEnum(["OC", "BC", "SC", "ST"]).nullish(),

  // Step 2 — address
  doorNo: optText(40),
  street: optText(160),
  villageCity: optText(120),
  mandal: optText(120),
  district: optText(120),
  state: optText(120),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits")
    .nullish(),

  // Step 3 — academic & school
  schoolId: id.nullish(),
  schoolName: optText(200),
  schoolCode: optText(40),
  /** e.g. `class-8`; stored as the profile's active class. */
  classId: id.nullish(),
  grade,
  section: upperEnum(["A", "B", "C", "D"]).nullish(),
  medium: upperEnum(["ENGLISH", "TELUGU", "URDU"]).nullish(),
  rollNumber: optText(40),
  admissionNumber: optText(40),

  // Step 4 — parent & guardian
  fatherName: optText(120),
  motherName: optText(120),
  parentPhone: mobile10.nullish(),
  guardianPhone: mobile10.nullish(),
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

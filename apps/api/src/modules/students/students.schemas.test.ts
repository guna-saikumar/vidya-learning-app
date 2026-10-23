import { describe, expect, it } from "vitest";
import {
  createBookmarkSchema,
  updateOnboardingSchema,
  updateProfileSchema,
  updateSettingsSchema,
  upsertProgressSchema,
} from "./students.schemas";

const valid = {
  firstName: "Meera",
  lastName: "Iyer",
  gender: "female",
  dob: "2014-05-12",
  grade: 7,
  section: "b",
  medium: "telugu",
  parentPhone: "9876543210",
};

describe("onboarding schema", () => {
  it("normalises enums/grade", () => {
    const out = updateOnboardingSchema.parse(valid);
    expect(out).toMatchObject({
      gender: "FEMALE",
      section: "B",
      medium: "TELUGU",
      grade: "7",
    });
  });

  it.each([
    ["future dob", { dob: "2999-01-01" }],
    ["bad phone", { parentPhone: "123" }],
    ["grade out of range", { grade: 5 }],
    ["unknown medium", { medium: "FRENCH" }],
    ["unknown section", { section: "Z" }],
  ])("rejects %s", (_name, patch) => {
    expect(updateOnboardingSchema.safeParse({ ...valid, ...patch }).success).toBe(
      false
    );
  });

  it("requires first name, last name, gender, dob and grade", () => {
    expect(updateOnboardingSchema.safeParse({}).success).toBe(false);
  });
});

describe("profile patch schema", () => {
  it("accepts partial bodies and null to clear", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
    expect(updateProfileSchema.parse({ rollNumber: null, section: "c" })).toEqual({
      rollNumber: null,
      section: "C",
    });
  });
});

describe("settings / progress / bookmarks", () => {
  it("settings need at least one valid field", () => {
    expect(updateSettingsSchema.safeParse({}).success).toBe(false);
    expect(updateSettingsSchema.safeParse({ language: "fr" }).success).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ language: "te", notificationsEnabled: false })
        .success
    ).toBe(true);
  });

  it("progress needs percent + completed", () => {
    expect(upsertProgressSchema.safeParse({ progressPercent: 50 }).success).toBe(false);
    expect(
      upsertProgressSchema.safeParse({ progressPercent: 101, completed: false }).success
    ).toBe(false);
    expect(
      upsertProgressSchema.safeParse({
        progressPercent: 50,
        completed: false,
        sectionId: "s1",
      }).success
    ).toBe(true);
  });

  it("bookmark needs a chapterId", () => {
    expect(createBookmarkSchema.safeParse({}).success).toBe(false);
    expect(
      createBookmarkSchema.safeParse({ chapterId: "c1", sectionId: null }).success
    ).toBe(true);
  });
});

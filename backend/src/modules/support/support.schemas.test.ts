import { describe, expect, it } from "vitest";
import {
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "./support.schemas";

describe("Support schemas", () => {
  it("validates a complete valid complaint", () => {
    const input = {
      full_name: "Sai Kumar",
      class_grade: 8,
      section: "A",
      roll_number: "24",
      email: "sai@vidya.test",
      phone: "+91 9876543210",
      category: "textbook_access",
      subject: "Cannot open Chapter 3 PDF notes",
      message: "Whenever I click download notes, it shows network error.",
      source: "mobile",
    };
    const res = createComplaintSchema.safeParse(input);
    expect(res.success).toBe(true);
  });

  it("requires class_grade between 6 and 10", () => {
    const res5 = createComplaintSchema.safeParse({
      full_name: "Sai",
      class_grade: 5,
      email: "sai@vidya.test",
      category: "technical_issue",
      subject: "Test issue",
      message: "This is a test message for issue.",
    });
    expect(res5.success).toBe(false);

    const res11 = createComplaintSchema.safeParse({
      full_name: "Sai",
      class_grade: 11,
      email: "sai@vidya.test",
      category: "technical_issue",
      subject: "Test issue",
      message: "This is a test message for issue.",
    });
    expect(res11.success).toBe(false);
  });

  it("requires at least one contact detail", () => {
    const res = createComplaintSchema.safeParse({
      full_name: "Sai Kumar",
      class_grade: 9,
      category: "attendance",
      subject: "Attendance record missing",
      message: "My attendance for Monday is not recorded.",
    });
    expect(res.success).toBe(false);
  });

  it("validates status update schema", () => {
    expect(updateComplaintStatusSchema.safeParse({ status: "in_progress" }).success).toBe(true);
    expect(updateComplaintStatusSchema.safeParse({ status: "resolved" }).success).toBe(true);
    expect(updateComplaintStatusSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });
});

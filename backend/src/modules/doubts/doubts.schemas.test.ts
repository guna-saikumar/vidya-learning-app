import { describe, expect, it } from "vitest";
import {
  createDoubtSchema,
  listDoubtsQuerySchema,
  postAnswerSchema,
  resolveDoubtSchema,
} from "./doubts.schemas";

describe("doubts schemas", () => {
  describe("createDoubtSchema", () => {
    it("accepts valid doubt input", () => {
      const parsed = createDoubtSchema.parse({
        title: "Does HCF × LCM = product work for 3 numbers?",
        body: "I tried verifying this theorem for three numbers 2, 4 and 8.",
        sectionId: "c10-m-ch1-s1",
      });
      expect(parsed.title).toBe("Does HCF × LCM = product work for 3 numbers?");
      expect(parsed.body).toBe(
        "I tried verifying this theorem for three numbers 2, 4 and 8."
      );
      expect(parsed.sectionId).toBe("c10-m-ch1-s1");
    });

    it("trims whitespace from title and body", () => {
      const parsed = createDoubtSchema.parse({
        title: "   Why is root 2 an irrational number?   ",
        body: "   Proof by contradiction in section 1.   ",
      });
      expect(parsed.title).toBe("Why is root 2 an irrational number?");
      expect(parsed.body).toBe("Proof by contradiction in section 1.");
      expect(parsed.sectionId).toBeUndefined();
    });

    it("rejects title shorter than 8 chars", () => {
      expect(
        createDoubtSchema.safeParse({
          title: "Short?",
          body: "This body has enough length for a valid doubt.",
        }).success
      ).toBe(false);
    });

    it("rejects title longer than 120 chars", () => {
      expect(
        createDoubtSchema.safeParse({
          title: "a".repeat(121),
          body: "Valid body text with enough characters.",
        }).success
      ).toBe(false);
    });

    it("rejects body shorter than 10 chars", () => {
      expect(
        createDoubtSchema.safeParse({
          title: "Valid Title Here",
          body: "Too short",
        }).success
      ).toBe(false);
    });

    it("rejects body longer than 4000 chars", () => {
      expect(
        createDoubtSchema.safeParse({
          title: "Valid Title Here",
          body: "a".repeat(4001),
        }).success
      ).toBe(false);
    });
  });

  describe("postAnswerSchema", () => {
    it("accepts valid answer body", () => {
      const parsed = postAnswerSchema.parse({
        body: "Yes, this formula only works for two numbers.",
      });
      expect(parsed.body).toBe(
        "Yes, this formula only works for two numbers."
      );
    });

    it("trims answer body and rejects empty string", () => {
      expect(
        postAnswerSchema.safeParse({
          body: "     ",
        }).success
      ).toBe(false);
    });

    it("rejects answer body longer than 4000 chars", () => {
      expect(
        postAnswerSchema.safeParse({
          body: "a".repeat(4001),
        }).success
      ).toBe(false);
    });
  });

  describe("listDoubtsQuerySchema", () => {
    it("defaults to filter=all", () => {
      const parsed = listDoubtsQuerySchema.parse({});
      expect(parsed.filter).toBe("all");
      expect(parsed.q).toBeUndefined();
    });

    it.each(["all", "unanswered", "mine"] as const)(
      "accepts filter=%s",
      (filter) => {
        const parsed = listDoubtsQuerySchema.parse({ filter });
        expect(parsed.filter).toBe(filter);
      }
    );

    it("rejects invalid filter value", () => {
      expect(
        listDoubtsQuerySchema.safeParse({ filter: "invalid-filter" }).success
      ).toBe(false);
    });

    it("accepts search query q", () => {
      const parsed = listDoubtsQuerySchema.parse({ q: "   irrational   " });
      expect(parsed.q).toBe("irrational");
    });
  });

  describe("resolveDoubtSchema", () => {
    it("accepts empty object (resolve without accepted answer)", () => {
      expect(resolveDoubtSchema.safeParse({}).success).toBe(true);
    });

    it("accepts valid acceptedAnswerId", () => {
      const parsed = resolveDoubtSchema.parse({
        acceptedAnswerId: "ans-123",
      });
      expect(parsed.acceptedAnswerId).toBe("ans-123");
    });
  });
});

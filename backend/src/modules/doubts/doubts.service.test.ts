import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DbService } from "../../db/db.service";
import { DoubtsService } from "./doubts.service";

describe("DoubtsService", () => {
  let service: DoubtsService;
  let mockDb: {
    query: ReturnType<typeof vi.fn>;
    queryOne: ReturnType<typeof vi.fn>;
    tx: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDb = {
      query: vi.fn(),
      queryOne: vi.fn(),
      tx: vi.fn(async (callback) => {
        const client = {
          query: vi.fn().mockResolvedValue({ rows: [], rowCount: 1 }),
        };
        return callback(client as any);
      }),
    };
    service = new DoubtsService(mockDb as unknown as DbService);
  });

  describe("createDoubt", () => {
    it("fails with 400 when sectionId belongs to another chapter", async () => {
      // 1. Rate check
      mockDb.queryOne.mockResolvedValueOnce({ count: 1 });
      // 2. Chapter check
      mockDb.queryOne.mockResolvedValueOnce({ id: "c10-m-ch1" });
      // 3. Section check (belongs to chapter c10-m-ch2)
      mockDb.queryOne.mockResolvedValueOnce({
        id: "sec-other",
        chapterId: "c10-m-ch2",
      });

      await expect(
        service.createDoubt("user-1", "c10-m-ch1", {
          title: "Valid Title With Eight Chars",
          body: "Valid body text here with length",
          sectionId: "sec-other",
        })
      ).rejects.toThrow(BadRequestException);
    });

    it("fails with 404 when chapter is not found", async () => {
      mockDb.queryOne.mockResolvedValueOnce({ count: 0 }); // rate check
      mockDb.queryOne.mockResolvedValueOnce(null); // chapter check

      await expect(
        service.createDoubt("user-1", "ch-nonexistent", {
          title: "Valid Title With Eight Chars",
          body: "Valid body text here with length",
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("listDoubts", () => {
    it("lists doubts with filter=all, mine, or unanswered", async () => {
      // Chapter exists
      mockDb.queryOne.mockResolvedValueOnce({ id: "c10-m-ch1" });
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: "d-1",
            chapterId: "c10-m-ch1",
            sectionId: null,
            title: "Doubt 1",
            body: "Long body of doubt 1 text",
            isResolved: false,
            createdAt: new Date("2026-11-19T05:00:00Z"),
            authorId: "user-1",
            authorName: "Ananya",
            authorRole: "student",
            upvoteCount: 3,
            upvotedByMe: true,
            answerCount: 2,
            hasTeacherAnswer: false,
          },
        ],
        rowCount: 1,
      });

      const list = await service.listDoubts("user-1", "c10-m-ch1", {
        filter: "all",
      });
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe("d-1");
      expect(list[0].upvotedByMe).toBe(true);
      expect(list[0].hasTeacherAnswer).toBe(false);
    });
  });

  describe("toggleUpvote", () => {
    it("rejects when author attempts to upvote their own doubt with 400", async () => {
      mockDb.queryOne.mockResolvedValueOnce({ id: "d-1", userId: "user-1" });

      await expect(service.toggleUpvote("user-1", "d-1")).rejects.toThrow(
        BadRequestException
      );
    });

    it("toggles upvote on and off returning accurate counts", async () => {
      // First toggle: not upvoted yet
      mockDb.queryOne
        .mockResolvedValueOnce({ id: "d-1", userId: "author-2" }) // doubt check
        .mockResolvedValueOnce(null) // existing upvote check (none)
        .mockResolvedValueOnce({ count: 1 }); // count query

      const firstToggle = await service.toggleUpvote("user-1", "d-1");
      expect(firstToggle).toEqual({ upvoted: true, upvoteCount: 1 });

      // Second toggle: already upvoted -> removed
      mockDb.queryOne
        .mockResolvedValueOnce({ id: "d-1", userId: "author-2" })
        .mockResolvedValueOnce({ doubtId: "d-1" }) // existing upvote check (found)
        .mockResolvedValueOnce({ count: 0 }); // count query

      const secondToggle = await service.toggleUpvote("user-1", "d-1");
      expect(secondToggle).toEqual({ upvoted: false, upvoteCount: 0 });
    });
  });

  describe("toggleHelpful", () => {
    it("rejects when answerer attempts to mark their own answer helpful with 400", async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: "ans-1",
        doubtId: "d-1",
        userId: "user-1",
      });

      await expect(
        service.toggleHelpful("user-1", "d-1", "ans-1")
      ).rejects.toThrow(BadRequestException);
    });

    it("toggles helpful on and off returning accurate counts", async () => {
      // First toggle: on
      mockDb.queryOne
        .mockResolvedValueOnce({ id: "ans-1", doubtId: "d-1", userId: "author-2" })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ count: 1 });

      const first = await service.toggleHelpful("user-1", "d-1", "ans-1");
      expect(first).toEqual({ markedHelpful: true, helpfulCount: 1 });

      // Second toggle: off
      mockDb.queryOne
        .mockResolvedValueOnce({ id: "ans-1", doubtId: "d-1", userId: "author-2" })
        .mockResolvedValueOnce({ answerId: "ans-1" })
        .mockResolvedValueOnce({ count: 0 });

      const second = await service.toggleHelpful("user-1", "d-1", "ans-1");
      expect(second).toEqual({ markedHelpful: false, helpfulCount: 0 });
    });
  });

  describe("resolveDoubt", () => {
    it("rejects resolution by non-author with 403 Forbidden", async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: "d-1",
        userId: "asker-1",
        isResolved: false,
      });

      await expect(service.resolveDoubt("other-user", "d-1")).rejects.toThrow(
        ForbiddenException
      );
    });

    it("rejects resolution if already resolved with 409 Conflict", async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: "d-1",
        userId: "asker-1",
        isResolved: true,
      });

      await expect(service.resolveDoubt("asker-1", "d-1")).rejects.toThrow(
        ConflictException
      );
    });

    it("accepts answer and marks resolved for asker", async () => {
      // Doubt check
      mockDb.queryOne.mockResolvedValueOnce({
        id: "d-1",
        userId: "asker-1",
        isResolved: false,
      });
      // Answer check
      mockDb.queryOne.mockResolvedValueOnce({ id: "ans-1" });
      // getDoubtThread queries
      mockDb.queryOne.mockResolvedValueOnce({
        id: "d-1",
        chapterId: "c10-m-ch1",
        sectionId: null,
        title: "Test Doubt",
        body: "Test Body Text Here",
        isResolved: true,
        createdAt: new Date(),
        authorId: "asker-1",
        authorName: "Asker",
        authorRole: "student",
        upvoteCount: 1,
        upvotedByMe: false,
      });
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: "ans-1",
            doubtId: "d-1",
            body: "Great answer",
            isAccepted: true,
            createdAt: new Date(),
            authorId: "user-2",
            authorName: "Teacher Lakshmi",
            authorRole: "teacher",
            helpfulCount: 5,
            markedHelpfulByMe: false,
          },
        ],
        rowCount: 1,
      });

      const thread = await service.resolveDoubt("asker-1", "d-1", {
        acceptedAnswerId: "ans-1",
      });
      expect(thread.isResolved).toBe(true);
      expect(thread.answers[0].isAccepted).toBe(true);
      expect(mockDb.tx).toHaveBeenCalled();
    });
  });
});

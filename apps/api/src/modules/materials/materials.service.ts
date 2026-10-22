import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type {
  AdminMaterialFilters,
  CreateMaterialInput,
  MaterialFilters,
  UpdateMaterialInput,
} from "./materials.schemas";

type MaterialRow = Prisma.MaterialGetPayload<object>;

export const toMaterialDto = (m: MaterialRow) => ({
  id: m.id,
  title: m.title,
  description: m.description,
  materialType: m.materialType,
  classId: m.classId,
  grade: m.grade,
  subjectId: m.subjectId,
  subjectName: m.subjectName,
  chapterId: m.chapterId,
  chapterTitle: m.chapterTitle,
  sectionId: m.sectionId,
  sectionTitle: m.sectionTitle,
  language: m.language,
  displayOrder: m.displayOrder,
  status: m.status,
  fileUrl: m.fileUrl,
  fileName: m.fileName,
  fileSizeBytes: m.fileSizeBytes,
  videoUrl: m.videoUrl,
  thumbnailUrl: m.thumbnailUrl,
  notesContent: m.notesContent,
  quizData: m.quizData,
  authorId: m.authorId,
  authorName: m.authorName,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

const jsonValue = (v: unknown) =>
  v === null ? Prisma.JsonNull : (v as Prisma.InputJsonValue);

@Injectable()
export class MaterialsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listPublished(filters: MaterialFilters) {
    const rows = await this.prisma.material.findMany({
      where: { ...filters, status: "published" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return { items: rows.map(toMaterialDto), total: rows.length };
  }

  async listAdmin(filters: AdminMaterialFilters) {
    const { q, limit = 50, offset = 0, ...rest } = filters;
    const where: Prisma.MaterialWhereInput = {
      ...rest,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.material.count({ where }),
    ]);
    return { total, limit, offset, items: rows.map(toMaterialDto) };
  }

  async getAdmin(id: string) {
    return toMaterialDto(await this.require(id));
  }

  async create(
    input: CreateMaterialInput,
    author: { id: string; name: string }
  ) {
    const placement = await this.resolvePlacement(input);
    const row = await this.prisma.material.create({
      data: {
        title: input.title,
        description: input.description,
        materialType: input.materialType,
        language: input.language,
        displayOrder: input.displayOrder,
        status: input.status,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        fileSizeBytes: input.fileSizeBytes,
        videoUrl: input.videoUrl,
        thumbnailUrl: input.thumbnailUrl,
        notesContent: input.notesContent,
        quizData:
          input.quizData === undefined ? undefined : jsonValue(input.quizData),
        ...placement,
        authorId: author.id,
        authorName: author.name,
      },
    });
    return toMaterialDto(row);
  }

  async update(id: string, input: UpdateMaterialInput) {
    const existing = await this.require(id);
    const touchesPlacement =
      input.classId !== undefined ||
      input.subjectId !== undefined ||
      input.chapterId !== undefined ||
      input.sectionId !== undefined;

    const placement = touchesPlacement
      ? await this.resolvePlacement({
          classId: input.classId ?? existing.classId,
          subjectId: input.subjectId ?? existing.subjectId,
          chapterId: input.chapterId ?? existing.chapterId,
          sectionId:
            input.sectionId === undefined ? existing.sectionId : input.sectionId,
        })
      : {};

    const {
      classId: _c,
      subjectId: _s,
      chapterId: _ch,
      sectionId: _se,
      quizData,
      ...rest
    } = input;

    const row = await this.prisma.material.update({
      where: { id },
      data: {
        ...rest,
        ...(quizData === undefined ? {} : { quizData: jsonValue(quizData) }),
        ...placement,
      },
    });
    return toMaterialDto(row);
  }

  async updateStatus(id: string, status: "draft" | "published" | "archived") {
    await this.require(id);
    const row = await this.prisma.material.update({
      where: { id },
      data: { status },
    });
    return toMaterialDto(row);
  }

  async remove(id: string) {
    await this.require(id);
    await this.prisma.material.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async require(id: string) {
    const row = await this.prisma.material.findUnique({ where: { id } });
    if (!row) throw new NotFoundException({ error: "Material not found" });
    return row;
  }

  /** Validates class → subject → chapter (→ section) linkage and denormalizes names. */
  private async resolvePlacement(input: {
    classId: string;
    subjectId: string;
    chapterId: string;
    sectionId?: string | null;
  }) {
    const [cls, subject, chapter, section] = await Promise.all([
      this.prisma.schoolClass.findUnique({ where: { id: input.classId } }),
      this.prisma.subject.findUnique({ where: { id: input.subjectId } }),
      this.prisma.chapter.findUnique({ where: { id: input.chapterId } }),
      input.sectionId
        ? this.prisma.section.findUnique({ where: { id: input.sectionId } })
        : Promise.resolve(null),
    ]);
    if (!cls) throw new NotFoundException({ error: "Class not found" });
    if (!subject) throw new NotFoundException({ error: "Subject not found" });
    if (!chapter) throw new NotFoundException({ error: "Chapter not found" });
    if (input.sectionId && !section) {
      throw new NotFoundException({ error: "Section not found" });
    }
    if (
      subject.classId !== cls.id ||
      chapter.subjectId !== subject.id ||
      (section && section.chapterId !== chapter.id)
    ) {
      throw new BadRequestException({
        error: "Class, subject, chapter and section do not belong together",
      });
    }
    return {
      classId: cls.id,
      grade: cls.grade,
      subjectId: subject.id,
      subjectName: subject.name,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      sectionId: section?.id ?? null,
      sectionTitle: section?.title ?? null,
    };
  }
}

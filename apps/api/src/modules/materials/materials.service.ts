import { Inject, Injectable } from "@nestjs/common";
import { DbService } from "../../db/db.service";
import type { MaterialFilters } from "./materials.schemas";

type MaterialRow = {
  id: string;
  title: string;
  description: string | null;
  materialType: string;
  classId: string;
  grade: number;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  sectionId: string | null;
  sectionTitle: string | null;
  language: string;
  displayOrder: number;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  notesContent: string | null;
  quizData: unknown;
  authorId: string | null;
  authorName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const MATERIAL_COLUMNS = `"id", "title", "description", "materialType", "classId", "grade",
  "subjectId", "subjectName", "chapterId", "chapterTitle", "sectionId", "sectionTitle",
  "language", "displayOrder", "status", "fileUrl", "fileName", "fileSizeBytes",
  "videoUrl", "thumbnailUrl", "notesContent", "quizData", "authorId", "authorName",
  "createdAt", "updatedAt"`;

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
  quizData: m.quizData ?? null,
  authorId: m.authorId,
  authorName: m.authorName,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

@Injectable()
export class MaterialsService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  async listPublished(filters: MaterialFilters) {
    const conditions = [`"status" = 'published'`];
    const params: unknown[] = [];
    for (const key of ["classId", "subjectId", "chapterId"] as const) {
      const value = filters[key];
      if (value !== undefined) {
        params.push(value);
        conditions.push(`"${key}" = $${params.length}`);
      }
    }

    const { rows } = await this.db.query<MaterialRow>(
      `SELECT ${MATERIAL_COLUMNS}
         FROM "Material"
        WHERE ${conditions.join(" AND ")}
        ORDER BY "displayOrder" ASC, "createdAt" DESC`,
      params
    );
    return { items: rows.map(toMaterialDto), total: rows.length };
  }
}

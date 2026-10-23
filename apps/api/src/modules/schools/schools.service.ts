import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from "../../db/db.service";
import type { SchoolListQuery } from "./schools.schemas";

type SchoolRow = {
  id: string;
  name: string;
  udiseCode: string;
  district: string;
  mandal: string | null;
  address: string | null;
};

const SCHOOL_COLUMNS = `"id", "name", "udiseCode", "district", "mandal", "address"`;

export const toSchoolDto = (s: SchoolRow) => ({
  id: s.id,
  name: s.name,
  udiseCode: s.udiseCode,
  district: s.district,
  mandal: s.mandal,
  address: s.address,
});

/** Escape `%`, `_` and `\` so user input is matched literally by ILIKE. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

@Injectable()
export class SchoolsService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  async list(query: SchoolListQuery) {
    const where: string[] = [];
    const params: unknown[] = [];

    if (query.q) {
      params.push(`%${escapeLike(query.q)}%`);
      where.push(
        `("name" ILIKE $${params.length} OR "udiseCode" ILIKE $${params.length})`
      );
    }
    if (query.district) {
      params.push(query.district);
      where.push(`LOWER("district") = LOWER($${params.length})`);
    }
    params.push(query.limit);

    const { rows } = await this.db.query<SchoolRow>(
      `SELECT ${SCHOOL_COLUMNS} FROM "School"
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY "name" ASC, "id" ASC
        LIMIT $${params.length}`,
      params
    );
    return rows.map(toSchoolDto);
  }

  async getById(id: string) {
    const row = await this.db.queryOne<SchoolRow>(
      `SELECT ${SCHOOL_COLUMNS} FROM "School" WHERE "id" = $1`,
      [id]
    );
    if (!row) throw new NotFoundException({ error: "School not found" });
    return toSchoolDto(row);
  }
}

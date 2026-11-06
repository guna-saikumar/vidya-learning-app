import {
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DbService } from "../db/db.service";
import type {
  ComplaintCategory,
  ComplaintStatus,
  CreateComplaintInput,
} from "./support.schemas";

type ComplaintRow = {
  id: string;
  ticket_ref: string;
  full_name: string;
  class_grade: number;
  section: string | null;
  roll_number: string | null;
  email: string | null;
  phone: string | null;
  category: ComplaintCategory;
  subject: string;
  message: string;
  status: ComplaintStatus;
  source: string;
  created_at: Date;
  updated_at: Date;
};

const COMPLAINT_COLUMNS = `"id", "ticket_ref", "full_name", "class_grade", "section",
  "roll_number", "email", "phone", "category", "subject", "message",
  "status", "source", "created_at", "updated_at"`;

export const toComplaintDto = (row: ComplaintRow) => ({
  id: String(row.id),
  ticket_ref: row.ticket_ref,
  full_name: row.full_name,
  class_grade: Number(row.class_grade),
  section: row.section,
  roll_number: row.roll_number,
  email: row.email,
  phone: row.phone,
  category: row.category,
  subject: row.subject,
  message: row.message,
  status: row.status,
  source: row.source,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const clean = (value?: string | null) => {
  const v = value?.trim();
  return v ? v : null;
};

@Injectable()
export class SupportService {
  constructor(@Inject(DbService) private readonly db: DbService) {}

  async create(input: CreateComplaintInput) {
    const row = await this.db.queryOne<ComplaintRow>(
      `INSERT INTO contact_tickets
         (ticket_ref, full_name, class_grade, section, roll_number, email, phone,
          category, subject, message, source)
       VALUES (next_ticket_ref(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'web')
       RETURNING ${COMPLAINT_COLUMNS}`,
      [
        input.full_name,
        input.class_grade,
        clean(input.section),
        clean(input.roll_number),
        clean(input.email),
        clean(input.phone),
        input.category,
        input.subject,
        input.message,
      ]
    );
    return row ? toComplaintDto(row) : null;
  }

  async listLatest(limit = 200) {
    const { rows } = await this.db.query<ComplaintRow>(
      `SELECT ${COMPLAINT_COLUMNS}
         FROM contact_tickets
        ORDER BY created_at DESC
        LIMIT $1`,
      [Math.min(Math.max(limit, 1), 200)]
    );
    return rows.map(toComplaintDto);
  }

  async updateStatus(ticketRef: string, status: ComplaintStatus) {
    const row = await this.db.queryOne<ComplaintRow>(
      `UPDATE contact_tickets
          SET status = $1
        WHERE ticket_ref = $2
        RETURNING ${COMPLAINT_COLUMNS}`,
      [status, ticketRef]
    );
    if (!row) throw new NotFoundException({ error: "Complaint not found" });
    return toComplaintDto(row);
  }
}

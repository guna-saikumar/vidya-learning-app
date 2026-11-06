-- Vidya Complaints & Help schema
-- Database: vidya_contact  |  Role: vidya_contact (LOGIN)
-- Idempotent: safe to run multiple times.

BEGIN;

CREATE TABLE IF NOT EXISTS contact_tickets (
  id              BIGSERIAL PRIMARY KEY,
  ticket_ref      TEXT NOT NULL UNIQUE,                -- e.g. VIDYA-2026-0001
  full_name       TEXT NOT NULL,
  class_grade     SMALLINT NOT NULL CHECK (class_grade BETWEEN 6 AND 10),
  section         TEXT,
  roll_number     TEXT,
  email           TEXT,
  phone           TEXT,
  category        TEXT NOT NULL CHECK (category IN (
                    'technical_issue',
                    'textbook_access',
                    'recorded_classes',
                    'attendance',
                    'login_account',
                    'content_issue',
                    'billing_fees',
                    'feedback',
                    'other'
                  )),
  subject         TEXT NOT NULL,
  message         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
  source          TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'mobile')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_tickets_status     ON contact_tickets (status);
CREATE INDEX IF NOT EXISTS idx_contact_tickets_class      ON contact_tickets (class_grade);
CREATE INDEX IF NOT EXISTS idx_contact_tickets_created_at ON contact_tickets (created_at DESC);

-- Auto-maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contact_tickets_updated_at ON contact_tickets;
CREATE TRIGGER trg_contact_tickets_updated_at
  BEFORE UPDATE ON contact_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sequence for human-friendly ticket refs: VIDYA-<year>-<seq>
CREATE SEQUENCE IF NOT EXISTS contact_ticket_ref_seq START 1;

CREATE OR REPLACE FUNCTION next_ticket_ref() RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('contact_ticket_ref_seq');
  RETURN 'VIDYA-' || to_char(now(), 'YYYY') || '-' || lpad(seq_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Privileges for the app role
GRANT USAGE ON SCHEMA public TO vidya_contact;
GRANT SELECT, INSERT, UPDATE ON contact_tickets TO vidya_contact;
GRANT USAGE, SELECT ON SEQUENCE contact_tickets_id_seq TO vidya_contact;
GRANT USAGE, SELECT ON SEQUENCE contact_ticket_ref_seq TO vidya_contact;
GRANT EXECUTE ON FUNCTION next_ticket_ref() TO vidya_contact;

COMMIT;

-- Leads: formulario de contacto de la landing comercial
-- Idempotente: usar IF NOT EXISTS para correr múltiples veces sin error

DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "LeadEventType" AS ENUM (
    'wedding', 'quinceanera', 'graduation', 'festival', 'concert',
    'private_party', 'sports', 'corporate', 'cruise_hotel', 'university', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "LeadEventSize" AS ENUM (
    's_lt_100', 's_100_250', 's_250_500', 's_500_2k', 's_2k_10k', 's_gt_10k'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "leads" (
  "id"                 TEXT PRIMARY KEY,
  "full_name"          TEXT NOT NULL,
  "email"              TEXT NOT NULL,
  "phone"              TEXT NOT NULL,
  "company"            TEXT,
  "event_type"         "LeadEventType" NOT NULL,
  "event_type_other"   TEXT,
  "event_size"         "LeadEventSize" NOT NULL,
  "event_date"         DATE,
  "event_location"     TEXT,
  "message"            TEXT,
  "referral_source"    TEXT,
  "newsletter_opt_in"  BOOLEAN NOT NULL DEFAULT false,
  "status"             "LeadStatus" NOT NULL DEFAULT 'new',
  "source"             TEXT NOT NULL DEFAULT 'landing-main',
  "utm_source"         TEXT,
  "utm_medium"         TEXT,
  "utm_campaign"       TEXT,
  "utm_content"        TEXT,
  "utm_term"           TEXT,
  "user_agent"         TEXT,
  "ip_country"         TEXT,
  "notes"              TEXT,
  "assigned_to"        TEXT,
  "contacted_at"       TIMESTAMP(3),
  "qualified_at"       TIMESTAMP(3),
  "won_at"             TIMESTAMP(3),
  "lost_at"            TIMESTAMP(3),
  "lost_reason"        TEXT,
  "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "leads_status_idx"     ON "leads"("status");
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads"("created_at");

-- RLS: solo SUPER_ADMIN puede leer/escribir.
-- Los inserts del formulario público pasan por la API con service-role key, no por RLS.
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_super_admin_all" ON "leads";
CREATE POLICY "leads_super_admin_all" ON "leads"
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPER_ADMIN'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'SUPER_ADMIN'
  );

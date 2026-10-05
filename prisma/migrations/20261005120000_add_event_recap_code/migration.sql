-- Recap: código de acceso al portal público de recuerdos (/recuerdos/[slug])
-- Idempotente: se puede correr múltiples veces sin error

ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "recap_code" TEXT;

-- Backfill: un código de 6 caracteres (sin 0/O/1/I) para cada evento existente.
-- La referencia a e."id" dentro del subquery lo vuelve correlacionado, así que
-- se evalúa por fila y cada evento recibe un código distinto.
UPDATE "events" e
SET "recap_code" = (
  SELECT string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  FROM generate_series(1, 6 + 0 * length(e."id"))
)
WHERE e."recap_code" IS NULL;

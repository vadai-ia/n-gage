-- AlterTable
ALTER TABLE "events" ADD COLUMN "event_photos" TEXT[] DEFAULT ARRAY[]::TEXT[];

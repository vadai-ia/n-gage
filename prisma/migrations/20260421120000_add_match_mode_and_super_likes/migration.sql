-- CreateEnum
CREATE TYPE "MatchMode" AS ENUM ('swipe', 'mosaic');

-- AlterTable: add match_mode and super_likes_max to events
ALTER TABLE "events" ADD COLUMN "match_mode" "MatchMode" NOT NULL DEFAULT 'mosaic';
ALTER TABLE "events" ADD COLUMN "super_likes_max" INTEGER NOT NULL DEFAULT 1;

-- AlterTable: migrate super_like_used (bool) -> super_likes_used (int) on event_registrations
ALTER TABLE "event_registrations" ADD COLUMN "super_likes_used" INTEGER NOT NULL DEFAULT 0;
UPDATE "event_registrations" SET "super_likes_used" = 1 WHERE "super_like_used" = true;
ALTER TABLE "event_registrations" DROP COLUMN "super_like_used";

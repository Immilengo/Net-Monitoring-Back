-- CreateEnum
CREATE TYPE "StatusSource" AS ENUM ('AUTO', 'MANUAL');

-- AlterTable
ALTER TABLE "devices"
ADD COLUMN "statusSource" "StatusSource" NOT NULL DEFAULT 'AUTO';

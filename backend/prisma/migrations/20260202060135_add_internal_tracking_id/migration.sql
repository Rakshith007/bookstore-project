-- DropIndex
DROP INDEX "PackingSlip_createdAt_idx";

-- AlterTable
ALTER TABLE "PackingSlip" ADD COLUMN     "internalTrackingId" TEXT;

/*
  Warnings:

  - Added the required column `updatedAt` to the `PackingSlip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PackingSlip" ADD COLUMN     "charityAddress" JSONB,
ADD COLUMN     "markedAsPacked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qrData" TEXT,
ADD COLUMN     "securityCodeSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharedToWarehouse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationUrl" TEXT;

-- CreateIndex
CREATE INDEX "PackingSlip_createdAt_idx" ON "PackingSlip"("createdAt" DESC);

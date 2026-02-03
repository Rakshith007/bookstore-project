/*
  Warnings:

  - You are about to drop the column `internalTrackingId` on the `PackingSlip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PackingSlip" DROP COLUMN "internalTrackingId",
ADD COLUMN     "isCodeUsed" BOOLEAN NOT NULL DEFAULT false;

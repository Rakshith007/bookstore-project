-- CreateTable
CREATE TABLE "PackingSlip" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "securityCode" VARCHAR(6) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackingSlip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackingSlip_batchId_key" ON "PackingSlip"("batchId");

-- CreateIndex
CREATE INDEX "PackingSlip_batchId_idx" ON "PackingSlip"("batchId");

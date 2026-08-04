-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ComplaintStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'REOPENED';

-- CreateTable
CREATE TABLE "ComplaintStatusHistory" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL,
    "changedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintStatusHistory_complaintId_idx" ON "ComplaintStatusHistory"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintStatusHistory_createdAt_idx" ON "ComplaintStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "ComplaintStatusHistory" ADD CONSTRAINT "ComplaintStatusHistory_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintStatusHistory" ADD CONSTRAINT "ComplaintStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

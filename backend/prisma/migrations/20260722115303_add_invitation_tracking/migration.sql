-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "acceptedBy" TEXT,
ADD COLUMN     "createdBy" TEXT;

-- CreateIndex
CREATE INDEX "Invitation_societyId_idx" ON "Invitation"("societyId");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_phone_idx" ON "Invitation"("phone");

-- CreateIndex
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");

-- CreateEnum
CREATE TYPE "VendorConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'REMOVED');

-- CreateTable
CREATE TABLE "VendorConnection" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "status" "VendorConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorConnection_vendorId_idx" ON "VendorConnection"("vendorId");

-- CreateIndex
CREATE INDEX "VendorConnection_societyId_idx" ON "VendorConnection"("societyId");

-- CreateIndex
CREATE INDEX "VendorConnection_status_idx" ON "VendorConnection"("status");

-- AddForeignKey
ALTER TABLE "VendorConnection" ADD CONSTRAINT "VendorConnection_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorConnection" ADD CONSTRAINT "VendorConnection_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorConnection" ADD CONSTRAINT "VendorConnection_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

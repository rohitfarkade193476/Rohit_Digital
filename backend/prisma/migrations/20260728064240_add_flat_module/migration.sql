-- CreateEnum
CREATE TYPE "FlatStatus" AS ENUM ('VACANT', 'OCCUPIED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FlatType" AS ENUM ('ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 'PENTHOUSE');

-- CreateTable
CREATE TABLE "Flat" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "flatNumber" TEXT NOT NULL,
    "wing" TEXT,
    "floor" INTEGER NOT NULL,
    "type" "FlatType" NOT NULL,
    "status" "FlatStatus" NOT NULL DEFAULT 'VACANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flat_societyId_idx" ON "Flat"("societyId");

-- CreateIndex
CREATE UNIQUE INDEX "Flat_societyId_flatNumber_key" ON "Flat"("societyId", "flatNumber");

-- AddForeignKey
ALTER TABLE "Flat" ADD CONSTRAINT "Flat_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

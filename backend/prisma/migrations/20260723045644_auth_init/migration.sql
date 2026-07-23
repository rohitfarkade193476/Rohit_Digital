/*
  Warnings:

  - The values [RESIDENT,STAFF,VENDOR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `societyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Flat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resident` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Society` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocietyVendor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tower` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'SOCIETY_ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Flat" DROP CONSTRAINT "Flat_societyId_fkey";

-- DropForeignKey
ALTER TABLE "Flat" DROP CONSTRAINT "Flat_towerId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_acceptedById_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_societyId_fkey";

-- DropForeignKey
ALTER TABLE "Resident" DROP CONSTRAINT "Resident_flatId_fkey";

-- DropForeignKey
ALTER TABLE "Resident" DROP CONSTRAINT "Resident_societyId_fkey";

-- DropForeignKey
ALTER TABLE "Resident" DROP CONSTRAINT "Resident_userId_fkey";

-- DropForeignKey
ALTER TABLE "SocietyVendor" DROP CONSTRAINT "SocietyVendor_societyId_fkey";

-- DropForeignKey
ALTER TABLE "SocietyVendor" DROP CONSTRAINT "SocietyVendor_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_societyId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tower" DROP CONSTRAINT "Tower_societyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_societyId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "societyId";

-- DropTable
DROP TABLE "Flat";

-- DropTable
DROP TABLE "Invitation";

-- DropTable
DROP TABLE "Resident";

-- DropTable
DROP TABLE "Society";

-- DropTable
DROP TABLE "SocietyVendor";

-- DropTable
DROP TABLE "Staff";

-- DropTable
DROP TABLE "Tower";

-- DropTable
DROP TABLE "Vendor";

-- DropEnum
DROP TYPE "FlatStatus";

-- DropEnum
DROP TYPE "InvitationRole";

-- DropEnum
DROP TYPE "InvitationStatus";

-- DropEnum
DROP TYPE "SocietyStatus";

-- DropEnum
DROP TYPE "StaffDepartment";

-- DropEnum
DROP TYPE "VendorCategory";

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

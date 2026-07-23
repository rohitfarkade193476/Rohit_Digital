/*
  Warnings:

  - A unique constraint covering the columns `[registrationNumber]` on the table `Society` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactEmail]` on the table `Society` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Society_registrationNumber_key" ON "Society"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Society_contactEmail_key" ON "Society"("contactEmail");

-- CreateIndex
CREATE INDEX "Society_createdById_idx" ON "Society"("createdById");

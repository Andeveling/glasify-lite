/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `GlassType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `GlassType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `GlassType` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with nullable/optional defaults
-- AlterTable
ALTER TABLE "GlassSolution" ADD COLUMN     "isSeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seedVersion" TEXT;

-- AlterTable
ALTER TABLE "GlassSupplier" ADD COLUMN     "tenantConfigId" TEXT;

-- Step 2a: Set tenantConfigId for existing GlassSupplier records
-- Use the existing TenantConfig id (there should be only one in single-tenant setup)
UPDATE "GlassSupplier" 
SET "tenantConfigId" = (SELECT id FROM "TenantConfig" LIMIT 1)
WHERE "tenantConfigId" IS NULL;

-- AlterTable: Add code as nullable first to handle existing data
ALTER TABLE "GlassType" ADD COLUMN     "code" TEXT,
ADD COLUMN     "isSeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "seedVersion" TEXT,
ADD COLUMN     "series" TEXT;

-- Step 2: Populate code for existing records (use sku or generate from name)
-- For existing records, use SKU if available, otherwise generate from name
UPDATE "GlassType" 
SET "code" = COALESCE("sku", 'LEGACY-' || UPPER(SUBSTRING(REPLACE("name", ' ', '-'), 1, 20)) || '-' || SUBSTRING("id", 1, 8))
WHERE "code" IS NULL;

-- Step 3: Make code NOT NULL after data migration
ALTER TABLE "GlassType" ALTER COLUMN "code" SET NOT NULL;

-- CreateTable
CREATE TABLE "TenantGlassTypePrice" (
    "id" TEXT NOT NULL,
    "tenantConfigId" TEXT NOT NULL,
    "glassTypeId" TEXT NOT NULL,
    "supplierId" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantGlassTypePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantGlassTypePrice_tenantConfigId_glassTypeId_idx" ON "TenantGlassTypePrice"("tenantConfigId", "glassTypeId");

-- CreateIndex
CREATE INDEX "TenantGlassTypePrice_effectiveDate_idx" ON "TenantGlassTypePrice"("effectiveDate");

-- CreateIndex
CREATE INDEX "TenantGlassTypePrice_supplierId_idx" ON "TenantGlassTypePrice"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantGlassTypePrice_tenantConfigId_glassTypeId_supplierId__key" ON "TenantGlassTypePrice"("tenantConfigId", "glassTypeId", "supplierId", "effectiveDate");

-- CreateIndex
CREATE INDEX "GlassSolution_isSeeded_idx" ON "GlassSolution"("isSeeded");

-- CreateIndex
CREATE INDEX "GlassSupplier_tenantConfigId_idx" ON "GlassSupplier"("tenantConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "GlassType_name_key" ON "GlassType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GlassType_code_key" ON "GlassType"("code");

-- CreateIndex
CREATE INDEX "GlassType_code_idx" ON "GlassType"("code");

-- CreateIndex
CREATE INDEX "GlassType_series_idx" ON "GlassType"("series");

-- CreateIndex
CREATE INDEX "GlassType_manufacturer_idx" ON "GlassType"("manufacturer");

-- CreateIndex
CREATE INDEX "GlassType_isSeeded_idx" ON "GlassType"("isSeeded");

-- AddForeignKey
ALTER TABLE "GlassSupplier" ADD CONSTRAINT "GlassSupplier_tenantConfigId_fkey" FOREIGN KEY ("tenantConfigId") REFERENCES "TenantConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantGlassTypePrice" ADD CONSTRAINT "TenantGlassTypePrice_tenantConfigId_fkey" FOREIGN KEY ("tenantConfigId") REFERENCES "TenantConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantGlassTypePrice" ADD CONSTRAINT "TenantGlassTypePrice_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "GlassType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantGlassTypePrice" ADD CONSTRAINT "TenantGlassTypePrice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "GlassSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

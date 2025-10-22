/*
  Warnings:

  - You are about to drop the `TenantGlassTypePrice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pricePerSqm` to the `GlassType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TenantGlassTypePrice" DROP CONSTRAINT "TenantGlassTypePrice_glassTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TenantGlassTypePrice" DROP CONSTRAINT "TenantGlassTypePrice_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TenantGlassTypePrice" DROP CONSTRAINT "TenantGlassTypePrice_tenantConfigId_fkey";

-- AlterTable: Add pricePerSqm with temporary default, then remove default
-- This allows existing rows to get a value while new inserts must provide one
ALTER TABLE "GlassType" ADD COLUMN "pricePerSqm" DECIMAL(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE "GlassType" ALTER COLUMN "pricePerSqm" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."TenantGlassTypePrice";

-- CreateIndex
CREATE INDEX "GlassType_pricePerSqm_idx" ON "GlassType"("pricePerSqm");

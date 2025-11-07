/*
  Warnings:

  - You are about to drop the column `glassSupplierId` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the column `isLaminated` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the column `isLowE` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the column `isTempered` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the column `isTripleGlazed` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerSqm` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `GlassType` table. All the data in the column will be lost.
  - You are about to drop the `GlassTypePriceHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."GlassType" DROP CONSTRAINT "GlassType_glassSupplierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GlassTypePriceHistory" DROP CONSTRAINT "GlassTypePriceHistory_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."GlassTypePriceHistory" DROP CONSTRAINT "GlassTypePriceHistory_glassTypeId_fkey";

-- DropIndex
DROP INDEX "public"."GlassType_glassSupplierId_idx";

-- DropIndex
DROP INDEX "public"."GlassType_purpose_idx";

-- DropIndex
DROP INDEX "public"."GlassType_sku_idx";

-- DropIndex
DROP INDEX "public"."GlassType_sku_key";

-- AlterTable
ALTER TABLE "GlassCharacteristic" ADD COLUMN     "isSeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seedVersion" TEXT;

-- AlterTable
ALTER TABLE "GlassType" DROP COLUMN "glassSupplierId",
DROP COLUMN "isLaminated",
DROP COLUMN "isLowE",
DROP COLUMN "isTempered",
DROP COLUMN "isTripleGlazed",
DROP COLUMN "pricePerSqm",
DROP COLUMN "purpose",
DROP COLUMN "sku";

-- DropTable
DROP TABLE "public"."GlassTypePriceHistory";

-- CreateIndex
CREATE INDEX "GlassCharacteristic_isSeeded_idx" ON "GlassCharacteristic"("isSeeded");

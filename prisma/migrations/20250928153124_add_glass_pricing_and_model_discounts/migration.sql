/*
  Warnings:

  - Added the required column `pricePerSqm` to the `GlassType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."GlassType" ADD COLUMN     "isLaminated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLowE" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTempered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTripleGlazed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pricePerSqm" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "uValue" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."Model" ADD COLUMN     "glassDiscountHeightMm" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "glassDiscountWidthMm" INTEGER NOT NULL DEFAULT 0;

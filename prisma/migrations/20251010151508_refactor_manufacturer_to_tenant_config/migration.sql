/*
  Warnings:

  - You are about to drop the column `manufacturerId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PVC', 'ALUMINUM', 'WOOD', 'MIXED');

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_manufacturerId_fkey";

-- AlterTable
ALTER TABLE "GlassType" ALTER COLUMN "manufacturerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "profileSupplierId" TEXT,
ALTER COLUMN "manufacturerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "manufacturerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "manufacturerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "manufacturerId";

-- CreateTable
CREATE TABLE "TenantConfig" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "quoteValidityDays" INTEGER NOT NULL DEFAULT 15,
    "locale" VARCHAR(10) NOT NULL DEFAULT 'es-CO',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Bogota',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "businessAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileSupplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "materialType" "MaterialType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantConfig_currency_idx" ON "TenantConfig"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSupplier_name_key" ON "ProfileSupplier"("name");

-- CreateIndex
CREATE INDEX "ProfileSupplier_isActive_idx" ON "ProfileSupplier"("isActive");

-- CreateIndex
CREATE INDEX "ProfileSupplier_materialType_idx" ON "ProfileSupplier"("materialType");

-- CreateIndex
CREATE INDEX "Model_profileSupplierId_status_idx" ON "Model"("profileSupplierId", "status");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_profileSupplierId_fkey" FOREIGN KEY ("profileSupplierId") REFERENCES "ProfileSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

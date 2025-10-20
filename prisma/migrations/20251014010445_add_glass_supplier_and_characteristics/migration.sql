/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `GlassType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GlassType" ADD COLUMN     "description" TEXT,
ADD COLUMN     "glassSupplierId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastReviewDate" TIMESTAMP(3),
ADD COLUMN     "lightTransmission" DECIMAL(4,2),
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "solarFactor" DECIMAL(4,2);

-- CreateTable
CREATE TABLE "GlassSupplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "country" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlassSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlassCharacteristic" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlassCharacteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlassTypeCharacteristic" (
    "id" TEXT NOT NULL,
    "glassTypeId" TEXT NOT NULL,
    "characteristicId" TEXT NOT NULL,
    "value" TEXT,
    "certification" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlassTypeCharacteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlassTypePriceHistory" (
    "id" TEXT NOT NULL,
    "glassTypeId" TEXT NOT NULL,
    "pricePerSqm" DECIMAL(12,2) NOT NULL,
    "reason" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlassTypePriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlassSupplier_name_key" ON "GlassSupplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GlassSupplier_code_key" ON "GlassSupplier"("code");

-- CreateIndex
CREATE INDEX "GlassSupplier_isActive_idx" ON "GlassSupplier"("isActive");

-- CreateIndex
CREATE INDEX "GlassSupplier_code_idx" ON "GlassSupplier"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GlassCharacteristic_key_key" ON "GlassCharacteristic"("key");

-- CreateIndex
CREATE INDEX "GlassCharacteristic_category_idx" ON "GlassCharacteristic"("category");

-- CreateIndex
CREATE INDEX "GlassCharacteristic_isActive_idx" ON "GlassCharacteristic"("isActive");

-- CreateIndex
CREATE INDEX "GlassTypeCharacteristic_glassTypeId_idx" ON "GlassTypeCharacteristic"("glassTypeId");

-- CreateIndex
CREATE INDEX "GlassTypeCharacteristic_characteristicId_idx" ON "GlassTypeCharacteristic"("characteristicId");

-- CreateIndex
CREATE UNIQUE INDEX "GlassTypeCharacteristic_glassTypeId_characteristicId_key" ON "GlassTypeCharacteristic"("glassTypeId", "characteristicId");

-- CreateIndex
CREATE INDEX "GlassTypePriceHistory_glassTypeId_effectiveFrom_idx" ON "GlassTypePriceHistory"("glassTypeId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "GlassTypePriceHistory_createdBy_idx" ON "GlassTypePriceHistory"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "GlassType_sku_key" ON "GlassType"("sku");

-- CreateIndex
CREATE INDEX "GlassType_glassSupplierId_idx" ON "GlassType"("glassSupplierId");

-- CreateIndex
CREATE INDEX "GlassType_isActive_idx" ON "GlassType"("isActive");

-- CreateIndex
CREATE INDEX "GlassType_thicknessMm_idx" ON "GlassType"("thicknessMm");

-- CreateIndex
CREATE INDEX "GlassType_sku_idx" ON "GlassType"("sku");

-- AddForeignKey
ALTER TABLE "GlassType" ADD CONSTRAINT "GlassType_glassSupplierId_fkey" FOREIGN KEY ("glassSupplierId") REFERENCES "GlassSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlassTypeCharacteristic" ADD CONSTRAINT "GlassTypeCharacteristic_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "GlassType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlassTypeCharacteristic" ADD CONSTRAINT "GlassTypeCharacteristic_characteristicId_fkey" FOREIGN KEY ("characteristicId") REFERENCES "GlassCharacteristic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlassTypePriceHistory" ADD CONSTRAINT "GlassTypePriceHistory_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "GlassType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlassTypePriceHistory" ADD CONSTRAINT "GlassTypePriceHistory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."ModelStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('area', 'perimeter', 'fixed');

-- CreateEnum
CREATE TYPE "public"."ServiceUnit" AS ENUM ('unit', 'sqm', 'ml');

-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('draft', 'sent', 'canceled');

-- CreateEnum
CREATE TYPE "public"."AdjustmentScope" AS ENUM ('item', 'quote');

-- CreateEnum
CREATE TYPE "public"."AdjustmentSign" AS ENUM ('positive', 'negative');

-- CreateEnum
CREATE TYPE "public"."GlassPurpose" AS ENUM ('general', 'insulation', 'security', 'decorative');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "manufacturerId" TEXT;

-- CreateTable
CREATE TABLE "public"."Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "quoteValidityDays" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Model" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."ModelStatus" NOT NULL DEFAULT 'draft',
    "minWidthMm" INTEGER NOT NULL,
    "maxWidthMm" INTEGER NOT NULL,
    "minHeightMm" INTEGER NOT NULL,
    "maxHeightMm" INTEGER NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "costPerMmWidth" DECIMAL(12,4) NOT NULL,
    "costPerMmHeight" DECIMAL(12,4) NOT NULL,
    "accessoryPrice" DECIMAL(12,2),
    "compatibleGlassTypeIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlassType" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" "public"."GlassPurpose" NOT NULL,
    "thicknessMm" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlassType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ServiceType" NOT NULL,
    "unit" "public"."ServiceUnit" NOT NULL,
    "rate" DECIMAL(12,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quote" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "public"."QuoteStatus" NOT NULL DEFAULT 'draft',
    "currency" CHAR(3) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "contactPhone" TEXT,
    "contactAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "glassTypeId" TEXT NOT NULL,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "accessoryApplied" BOOLEAN NOT NULL DEFAULT false,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuoteItemService" (
    "id" TEXT NOT NULL,
    "quoteItemId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "unit" "public"."ServiceUnit" NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteItemService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Adjustment" (
    "id" TEXT NOT NULL,
    "scope" "public"."AdjustmentScope" NOT NULL,
    "concept" TEXT NOT NULL,
    "unit" "public"."ServiceUnit" NOT NULL,
    "value" DECIMAL(12,4) NOT NULL,
    "sign" "public"."AdjustmentSign" NOT NULL,
    "quoteId" TEXT,
    "quoteItemId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Manufacturer_currency_idx" ON "public"."Manufacturer"("currency");

-- CreateIndex
CREATE INDEX "Model_manufacturerId_status_idx" ON "public"."Model"("manufacturerId", "status");

-- CreateIndex
CREATE INDEX "GlassType_manufacturerId_purpose_idx" ON "public"."GlassType"("manufacturerId", "purpose");

-- CreateIndex
CREATE INDEX "Service_manufacturerId_type_idx" ON "public"."Service"("manufacturerId", "type");

-- CreateIndex
CREATE INDEX "Quote_manufacturerId_status_idx" ON "public"."Quote"("manufacturerId", "status");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "public"."QuoteItem"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteItemService_quoteItemId_serviceId_key" ON "public"."QuoteItemService"("quoteItemId", "serviceId");

-- CreateIndex
CREATE INDEX "Adjustment_quoteId_idx" ON "public"."Adjustment"("quoteId");

-- CreateIndex
CREATE INDEX "Adjustment_quoteItemId_idx" ON "public"."Adjustment"("quoteItemId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GlassType" ADD CONSTRAINT "GlassType_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteItem" ADD CONSTRAINT "QuoteItem_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteItem" ADD CONSTRAINT "QuoteItem_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "public"."GlassType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteItemService" ADD CONSTRAINT "QuoteItemService_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "public"."QuoteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuoteItemService" ADD CONSTRAINT "QuoteItemService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Adjustment" ADD CONSTRAINT "Adjustment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Adjustment" ADD CONSTRAINT "Adjustment_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "public"."QuoteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

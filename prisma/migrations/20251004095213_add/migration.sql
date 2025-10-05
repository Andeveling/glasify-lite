-- CreateEnum
CREATE TYPE "public"."CostType" AS ENUM ('fixed', 'per_mm_width', 'per_mm_height', 'per_sqm');

-- AlterTable
ALTER TABLE "public"."Model" ADD COLUMN     "costNotes" TEXT,
ADD COLUMN     "lastCostReviewDate" TIMESTAMP(3),
ADD COLUMN     "profitMarginPercentage" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "public"."ModelCostBreakdown" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "costType" "public"."CostType" NOT NULL,
    "unitCost" DECIMAL(12,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelCostBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModelPriceHistory" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "costPerMmWidth" DECIMAL(12,4) NOT NULL,
    "costPerMmHeight" DECIMAL(12,4) NOT NULL,
    "reason" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelCostBreakdown_modelId_idx" ON "public"."ModelCostBreakdown"("modelId");

-- CreateIndex
CREATE INDEX "ModelCostBreakdown_modelId_costType_idx" ON "public"."ModelCostBreakdown"("modelId", "costType");

-- CreateIndex
CREATE INDEX "ModelPriceHistory_modelId_effectiveFrom_idx" ON "public"."ModelPriceHistory"("modelId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "ModelPriceHistory_createdBy_idx" ON "public"."ModelPriceHistory"("createdBy");

-- AddForeignKey
ALTER TABLE "public"."ModelCostBreakdown" ADD CONSTRAINT "ModelCostBreakdown_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModelPriceHistory" ADD CONSTRAINT "ModelPriceHistory_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModelPriceHistory" ADD CONSTRAINT "ModelPriceHistory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

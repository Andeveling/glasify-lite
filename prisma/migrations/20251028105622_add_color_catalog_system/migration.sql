-- AlterTable
ALTER TABLE "QuoteItem" ADD COLUMN     "colorHexCode" VARCHAR(7),
ADD COLUMN     "colorId" TEXT,
ADD COLUMN     "colorName" VARCHAR(50),
ADD COLUMN     "colorSurchargePercentage" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "ralCode" VARCHAR(10),
    "hexCode" VARCHAR(7) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelColor" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "surchargePercentage" DECIMAL(5,2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Color_isActive_idx" ON "Color"("isActive");

-- CreateIndex
CREATE INDEX "Color_name_idx" ON "Color"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_hexCode_key" ON "Color"("name", "hexCode");

-- CreateIndex
CREATE INDEX "ModelColor_modelId_isDefault_idx" ON "ModelColor"("modelId", "isDefault");

-- CreateIndex
CREATE INDEX "ModelColor_colorId_idx" ON "ModelColor"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelColor_modelId_colorId_key" ON "ModelColor"("modelId", "colorId");

-- CreateIndex
CREATE INDEX "QuoteItem_colorId_idx" ON "QuoteItem"("colorId");

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelColor" ADD CONSTRAINT "ModelColor_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelColor" ADD CONSTRAINT "ModelColor_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

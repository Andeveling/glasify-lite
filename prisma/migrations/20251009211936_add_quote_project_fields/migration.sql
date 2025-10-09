/*
  Warnings:

  - Added the required column `name` to the `QuoteItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "projectCity" VARCHAR(100),
ADD COLUMN     "projectName" VARCHAR(100),
ADD COLUMN     "projectPostalCode" VARCHAR(20),
ADD COLUMN     "projectState" VARCHAR(100),
ADD COLUMN     "projectStreet" VARCHAR(200);

-- AlterTable
ALTER TABLE "QuoteItem" ADD COLUMN     "name" VARCHAR(50) NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "GlassType_manufacturerId_idx" ON "GlassType"("manufacturerId");

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");

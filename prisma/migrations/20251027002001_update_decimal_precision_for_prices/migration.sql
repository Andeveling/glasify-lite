/*
  Warnings:

  - You are about to alter the column `amount` on the `Adjustment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `pricePerSqm` on the `GlassType` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `basePrice` on the `Model` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `accessoryPrice` on the `Model` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `basePrice` on the `ModelPriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `total` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `subtotal` on the `QuoteItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `amount` on the `QuoteItemService` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.

*/
-- AlterTable
ALTER TABLE "Adjustment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "GlassType" ALTER COLUMN "pricePerSqm" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "Model" ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(12,4),
ALTER COLUMN "accessoryPrice" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "ModelPriceHistory" ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "total" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "QuoteItem" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "QuoteItemService" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,4);

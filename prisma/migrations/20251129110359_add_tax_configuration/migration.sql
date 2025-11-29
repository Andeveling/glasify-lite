-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "taxAmount" DECIMAL(12,4),
ADD COLUMN     "taxName" VARCHAR(20),
ADD COLUMN     "taxRate" DECIMAL(5,4);

-- AlterTable
ALTER TABLE "TenantConfig" ADD COLUMN     "taxDescription" VARCHAR(200),
ADD COLUMN     "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taxName" VARCHAR(20),
ADD COLUMN     "taxRate" DECIMAL(5,4);

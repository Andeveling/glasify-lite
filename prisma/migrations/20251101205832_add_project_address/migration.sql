-- AlterTable
ALTER TABLE "TenantConfig" ADD COLUMN     "transportBaseRate" DECIMAL(10,2),
ADD COLUMN     "transportPerKmRate" DECIMAL(10,2),
ADD COLUMN     "warehouseCity" VARCHAR(100),
ADD COLUMN     "warehouseLatitude" DECIMAL(10,7),
ADD COLUMN     "warehouseLongitude" DECIMAL(10,7);

-- CreateTable
CREATE TABLE "ProjectAddress" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT,
    "label" VARCHAR(100),
    "country" VARCHAR(100),
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "street" VARCHAR(200),
    "reference" VARCHAR(200),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "postalCode" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAddress_quoteId_key" ON "ProjectAddress"("quoteId");

-- CreateIndex
CREATE INDEX "ProjectAddress_quoteId_idx" ON "ProjectAddress"("quoteId");

-- CreateIndex
CREATE INDEX "ProjectAddress_city_idx" ON "ProjectAddress"("city");

-- CreateIndex
CREATE INDEX "ProjectAddress_latitude_longitude_idx" ON "ProjectAddress"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "ProjectAddress" ADD CONSTRAINT "ProjectAddress_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

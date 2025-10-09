-- CreateEnum
CREATE TYPE "PerformanceRating" AS ENUM ('basic', 'standard', 'good', 'very_good', 'excellent');

-- CreateTable
CREATE TABLE "GlassSolution" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlassSolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlassTypeSolution" (
    "id" TEXT NOT NULL,
    "glassTypeId" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "performanceRating" "PerformanceRating" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlassTypeSolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlassSolution_key_key" ON "GlassSolution"("key");

-- CreateIndex
CREATE INDEX "GlassSolution_sortOrder_idx" ON "GlassSolution"("sortOrder");

-- CreateIndex
CREATE INDEX "GlassSolution_isActive_idx" ON "GlassSolution"("isActive");

-- CreateIndex
CREATE INDEX "GlassTypeSolution_glassTypeId_idx" ON "GlassTypeSolution"("glassTypeId");

-- CreateIndex
CREATE INDEX "GlassTypeSolution_solutionId_idx" ON "GlassTypeSolution"("solutionId");

-- CreateIndex
CREATE INDEX "GlassTypeSolution_isPrimary_idx" ON "GlassTypeSolution"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "GlassTypeSolution_glassTypeId_solutionId_key" ON "GlassTypeSolution"("glassTypeId", "solutionId");

-- AddForeignKey
ALTER TABLE "GlassTypeSolution" ADD CONSTRAINT "GlassTypeSolution_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "GlassType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlassTypeSolution" ADD CONSTRAINT "GlassTypeSolution_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "GlassSolution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `GlassSolution` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `GlassSolution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add slug column with temporary default
ALTER TABLE "GlassSolution" ADD COLUMN "slug" VARCHAR(100) NOT NULL DEFAULT '';

-- Backfill slug values from key (replace underscores with hyphens)
UPDATE "GlassSolution" SET "slug" = REPLACE("key", '_', '-') WHERE "slug" = '';

-- CreateIndex
CREATE UNIQUE INDEX "GlassSolution_slug_key" ON "GlassSolution"("slug");

-- CreateIndex
CREATE INDEX "GlassSolution_slug_idx" ON "GlassSolution"("slug");

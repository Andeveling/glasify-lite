-- Add isActive field to Service model
ALTER TABLE "Service" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Create index for performance on filtered queries
CREATE INDEX "Service_isActive_idx" ON "Service"("isActive");

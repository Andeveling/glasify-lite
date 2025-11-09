ALTER TABLE "GlassType" ADD COLUMN "glassSupplierId" varchar(36);--> statement-breakpoint
ALTER TABLE "GlassType" ADD CONSTRAINT "GlassType_glassSupplierId_fkey" FOREIGN KEY ("glassSupplierId") REFERENCES "public"."GlassSupplier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "GlassType_glassSupplierId_idx" ON "GlassType" USING btree ("glassSupplierId");
CREATE TYPE "public"."AdjustmentScope" AS ENUM('item', 'quote');--> statement-breakpoint
CREATE TYPE "public"."AdjustmentSign" AS ENUM('positive', 'negative');--> statement-breakpoint
CREATE TYPE "public"."CostType" AS ENUM('fixed', 'per_mm_width', 'per_mm_height', 'per_sqm');--> statement-breakpoint
CREATE TYPE "public"."GlassPurpose" AS ENUM('general', 'insulation', 'security', 'decorative');--> statement-breakpoint
CREATE TYPE "public"."MaterialType" AS ENUM('PVC', 'ALUMINUM', 'WOOD', 'MIXED');--> statement-breakpoint
CREATE TYPE "public"."ModelStatus" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."PerformanceRating" AS ENUM('basic', 'standard', 'good', 'very_good', 'excellent');--> statement-breakpoint
CREATE TYPE "public"."QuoteStatus" AS ENUM('draft', 'sent', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."ServiceType" AS ENUM('area', 'perimeter', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."ServiceUnit" AS ENUM('unit', 'sqm', 'ml');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('admin', 'seller', 'user');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"access_token" varchar(4096),
	"refresh_token" varchar(4096),
	"expires_at" timestamp,
	"id_token" varchar(4096),
	"refreshTokenExpiresAt" timestamp,
	"scope" varchar(1024),
	"password" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Adjustment" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"scope" "AdjustmentScope" NOT NULL,
	"concept" varchar(255) NOT NULL,
	"unit" "ServiceUnit" NOT NULL,
	"value" numeric(12, 4) NOT NULL,
	"sign" "AdjustmentSign" NOT NULL,
	"quoteId" varchar(36),
	"quoteItemId" varchar(36),
	"amount" numeric(12, 4) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Color" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"ralCode" varchar(10),
	"hexCode" varchar(7) NOT NULL,
	"isActive" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Color_name_hexCode_key" UNIQUE("name","hexCode")
);
--> statement-breakpoint
CREATE TABLE "GlassCharacteristic" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"nameEs" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"isActive" boolean NOT NULL,
	"sortOrder" integer NOT NULL,
	"isSeeded" boolean NOT NULL,
	"seedVersion" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "GlassCharacteristic_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "GlassSolution" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"nameEs" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"sortOrder" integer NOT NULL,
	"isActive" boolean NOT NULL,
	"isSeeded" boolean NOT NULL,
	"seedVersion" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "GlassSolution_key_unique" UNIQUE("key"),
	CONSTRAINT "GlassSolution_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "GlassSupplier" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenantConfigId" varchar(1),
	"name" varchar(255) NOT NULL,
	"code" varchar(20),
	"country" varchar(100),
	"website" varchar(2048),
	"contactEmail" varchar(320),
	"contactPhone" varchar(20),
	"isActive" text NOT NULL,
	"notes" varchar(2000),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "GlassSupplier_name_unique" UNIQUE("name"),
	CONSTRAINT "GlassSupplier_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "GlassType" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"series" varchar(100),
	"manufacturer" varchar(255),
	"thicknessMm" text NOT NULL,
	"pricePerSqm" numeric(12, 4) NOT NULL,
	"uValue" numeric(5, 2),
	"description" varchar(2000),
	"solarFactor" numeric(4, 2),
	"lightTransmission" numeric(4, 2),
	"isActive" text NOT NULL,
	"lastReviewDate" timestamp,
	"isSeeded" text NOT NULL,
	"seedVersion" varchar(10),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "GlassType_name_unique" UNIQUE("name"),
	CONSTRAINT "GlassType_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "GlassTypeCharacteristic" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"glassTypeId" varchar(36) NOT NULL,
	"characteristicId" varchar(36) NOT NULL,
	"value" varchar(255),
	"certification" varchar(100),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "GlassTypeCharacteristic_glassTypeId_characteristicId_key" UNIQUE("glassTypeId","characteristicId")
);
--> statement-breakpoint
CREATE TABLE "GlassTypeSolution" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"glassTypeId" varchar(36) NOT NULL,
	"solutionId" varchar(36) NOT NULL,
	"performanceRating" "PerformanceRating" NOT NULL,
	"isPrimary" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "GlassTypeSolution_glassTypeId_solutionId_key" UNIQUE("glassTypeId","solutionId")
);
--> statement-breakpoint
CREATE TABLE "Manufacturer" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"quoteValidityDays" text NOT NULL,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Model" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"profileSupplierId" varchar(36),
	"name" varchar(255) NOT NULL,
	"imageUrl" varchar(2048) NOT NULL,
	"status" "ModelStatus" NOT NULL,
	"minWidthMm" text NOT NULL,
	"maxWidthMm" text NOT NULL,
	"minHeightMm" text NOT NULL,
	"maxHeightMm" text NOT NULL,
	"basePrice" numeric(12, 4) NOT NULL,
	"costPerMmWidth" numeric(12, 4) NOT NULL,
	"costPerMmHeight" numeric(12, 4) NOT NULL,
	"accessoryPrice" numeric(12, 4),
	"glassDiscountWidthMm" text NOT NULL,
	"glassDiscountHeightMm" text NOT NULL,
	"compatibleGlassTypeIds" text[] NOT NULL,
	"profitMarginPercentage" numeric(5, 2),
	"lastCostReviewDate" timestamp,
	"costNotes" varchar(2000),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ModelColor" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"modelId" varchar(36) NOT NULL,
	"colorId" varchar(36) NOT NULL,
	"surchargePercentage" numeric(5, 2) NOT NULL,
	"isDefault" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ModelColor_modelId_colorId_key" UNIQUE("modelId","colorId")
);
--> statement-breakpoint
CREATE TABLE "ModelCostBreakdown" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"modelId" varchar(36) NOT NULL,
	"component" varchar(255) NOT NULL,
	"costType" "CostType" NOT NULL,
	"unitCost" numeric(12, 4) NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ModelPriceHistory" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"modelId" varchar(36) NOT NULL,
	"basePrice" numeric(12, 4) NOT NULL,
	"costPerMmWidth" numeric(12, 4) NOT NULL,
	"costPerMmHeight" numeric(12, 4) NOT NULL,
	"reason" text,
	"effectiveFrom" timestamp NOT NULL,
	"createdBy" varchar(36),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProfileSupplier" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"materialType" "MaterialType" NOT NULL,
	"isActive" text NOT NULL,
	"notes" varchar(1000),
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL,
	CONSTRAINT "ProfileSupplier_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ProjectAddress" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"quoteId" varchar(36),
	"label" varchar(100),
	"country" varchar(100),
	"region" varchar(100),
	"city" varchar(100),
	"district" varchar(100),
	"street" varchar(200),
	"reference" varchar(200),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"postalCode" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ProjectAddress_quoteId_unique" UNIQUE("quoteId")
);
--> statement-breakpoint
CREATE TABLE "Quote" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36),
	"status" "QuoteStatus" NOT NULL,
	"currency" char(3) NOT NULL,
	"total" numeric(12, 4) NOT NULL,
	"validUntil" timestamp,
	"contactPhone" text,
	"contactAddress" text,
	"projectName" varchar(100),
	"projectStreet" varchar(200),
	"projectCity" varchar(100),
	"projectState" varchar(100),
	"projectPostalCode" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"sentAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "QuoteItem" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"quoteId" varchar(36) NOT NULL,
	"modelId" varchar(36) NOT NULL,
	"glassTypeId" varchar(36) NOT NULL,
	"name" varchar(50) NOT NULL,
	"quantity" integer NOT NULL,
	"roomLocation" varchar(100),
	"widthMm" integer NOT NULL,
	"heightMm" integer NOT NULL,
	"accessoryApplied" boolean NOT NULL,
	"subtotal" numeric(12, 4) NOT NULL,
	"colorId" varchar(36),
	"colorSurchargePercentage" numeric(5, 2),
	"colorHexCode" varchar(7),
	"colorName" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "QuoteItemService" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"quoteItemId" varchar(36) NOT NULL,
	"serviceId" varchar(36) NOT NULL,
	"unit" "ServiceUnit" NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"amount" numeric(12, 4) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "QuoteItemService_quoteItemId_serviceId_key" UNIQUE("quoteItemId","serviceId")
);
--> statement-breakpoint
CREATE TABLE "Service" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "ServiceType" NOT NULL,
	"unit" "ServiceUnit" NOT NULL,
	"rate" numeric(12, 4) NOT NULL,
	"minimumBillingUnit" numeric(10, 4),
	"isActive" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"expires" timestamp NOT NULL,
	"sessionToken" varchar(1024) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" varchar(36) NOT NULL,
	"ipAddress" varchar(45),
	"userAgent" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "TenantConfig" (
	"id" varchar(1) PRIMARY KEY NOT NULL,
	"businessName" varchar(255) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"quoteValidityDays" text NOT NULL,
	"locale" varchar(10) NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"contactEmail" varchar(320),
	"contactPhone" varchar(20),
	"businessAddress" varchar(500),
	"logoUrl" varchar(2048),
	"primaryColor" varchar(7) NOT NULL,
	"secondaryColor" varchar(7) NOT NULL,
	"facebookUrl" varchar(2048),
	"instagramUrl" varchar(2048),
	"linkedinUrl" varchar(2048),
	"whatsappNumber" varchar(15),
	"whatsappEnabled" text NOT NULL,
	"warehouseLatitude" numeric(10, 7),
	"warehouseLongitude" numeric(10, 7),
	"warehouseCity" varchar(100),
	"transportBaseRate" numeric(10, 2),
	"transportPerKmRate" numeric(10, 2),
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(320),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" varchar(2048),
	"role" "UserRole" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Verification" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(1024) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(1024) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Adjustment" ADD CONSTRAINT "Adjustment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Adjustment" ADD CONSTRAINT "Adjustment_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "public"."QuoteItem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlassSupplier" ADD CONSTRAINT "GlassSupplier_tenantConfigId_fkey" FOREIGN KEY ("tenantConfigId") REFERENCES "public"."TenantConfig"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlassTypeCharacteristic" ADD CONSTRAINT "GlassTypeCharacteristic_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "public"."GlassType"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlassTypeCharacteristic" ADD CONSTRAINT "GlassTypeCharacteristic_characteristicId_fkey" FOREIGN KEY ("characteristicId") REFERENCES "public"."GlassCharacteristic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlassTypeSolution" ADD CONSTRAINT "GlassTypeSolution_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "public"."GlassType"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlassTypeSolution" ADD CONSTRAINT "GlassTypeSolution_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "public"."GlassSolution"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Model" ADD CONSTRAINT "Model_profileSupplierId_fkey" FOREIGN KEY ("profileSupplierId") REFERENCES "public"."ProfileSupplier"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModelColor" ADD CONSTRAINT "ModelColor_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModelColor" ADD CONSTRAINT "ModelColor_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."Color"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModelCostBreakdown" ADD CONSTRAINT "ModelCostBreakdown_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModelPriceHistory" ADD CONSTRAINT "ModelPriceHistory_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModelPriceHistory" ADD CONSTRAINT "ModelPriceHistory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectAddress" ADD CONSTRAINT "ProjectAddress_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."Quote"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_glassTypeId_fkey" FOREIGN KEY ("glassTypeId") REFERENCES "public"."GlassType"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuoteItemService" ADD CONSTRAINT "QuoteItemService_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "public"."QuoteItem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuoteItemService" ADD CONSTRAINT "QuoteItemService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "Account_provider_accountId_key" ON "Account" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX "Adjustment_quoteId_idx" ON "Adjustment" USING btree ("quoteId");--> statement-breakpoint
CREATE INDEX "Adjustment_quoteItemId_idx" ON "Adjustment" USING btree ("quoteItemId");--> statement-breakpoint
CREATE INDEX "Color_isActive_idx" ON "Color" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "Color_name_idx" ON "Color" USING btree ("name");--> statement-breakpoint
CREATE INDEX "GlassCharacteristic_category_idx" ON "GlassCharacteristic" USING btree ("category");--> statement-breakpoint
CREATE INDEX "GlassCharacteristic_isActive_idx" ON "GlassCharacteristic" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "GlassCharacteristic_isSeeded_idx" ON "GlassCharacteristic" USING btree ("isSeeded");--> statement-breakpoint
CREATE INDEX "GlassSolution_sortOrder_idx" ON "GlassSolution" USING btree ("sortOrder");--> statement-breakpoint
CREATE INDEX "GlassSolution_isActive_idx" ON "GlassSolution" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "GlassSolution_isSeeded_idx" ON "GlassSolution" USING btree ("isSeeded");--> statement-breakpoint
CREATE INDEX "GlassSolution_slug_idx" ON "GlassSolution" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "GlassSupplier_isActive_idx" ON "GlassSupplier" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "GlassType_name_idx" ON "GlassType" USING btree ("name");--> statement-breakpoint
CREATE INDEX "GlassType_code_idx" ON "GlassType" USING btree ("code");--> statement-breakpoint
CREATE INDEX "GlassType_series_idx" ON "GlassType" USING btree ("series");--> statement-breakpoint
CREATE INDEX "GlassType_manufacturer_idx" ON "GlassType" USING btree ("manufacturer");--> statement-breakpoint
CREATE INDEX "GlassType_isActive_idx" ON "GlassType" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "GlassType_isSeeded_idx" ON "GlassType" USING btree ("isSeeded");--> statement-breakpoint
CREATE INDEX "GlassType_thicknessMm_idx" ON "GlassType" USING btree ("thicknessMm");--> statement-breakpoint
CREATE INDEX "GlassType_pricePerSqm_idx" ON "GlassType" USING btree ("pricePerSqm");--> statement-breakpoint
CREATE INDEX "GlassType_createdAt_idx" ON "GlassType" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "GlassType_updatedAt_idx" ON "GlassType" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "GlassTypeCharacteristic_glassTypeId_idx" ON "GlassTypeCharacteristic" USING btree ("glassTypeId");--> statement-breakpoint
CREATE INDEX "GlassTypeCharacteristic_characteristicId_idx" ON "GlassTypeCharacteristic" USING btree ("characteristicId");--> statement-breakpoint
CREATE INDEX "GlassTypeSolution_glassTypeId_idx" ON "GlassTypeSolution" USING btree ("glassTypeId");--> statement-breakpoint
CREATE INDEX "GlassTypeSolution_solutionId_idx" ON "GlassTypeSolution" USING btree ("solutionId");--> statement-breakpoint
CREATE INDEX "Manufacturer_currency_idx" ON "Manufacturer" USING btree ("currency");--> statement-breakpoint
CREATE INDEX "Model_profileSupplierId_status_idx" ON "Model" USING btree ("profileSupplierId","status");--> statement-breakpoint
CREATE INDEX "Model_name_idx" ON "Model" USING btree ("name");--> statement-breakpoint
CREATE INDEX "Model_status_idx" ON "Model" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Model_createdAt_idx" ON "Model" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "Model_updatedAt_idx" ON "Model" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "ModelColor_modelId_isDefault_idx" ON "ModelColor" USING btree ("modelId","isDefault");--> statement-breakpoint
CREATE INDEX "ModelCostBreakdown_modelId_idx" ON "ModelCostBreakdown" USING btree ("modelId");--> statement-breakpoint
CREATE INDEX "ModelCostBreakdown_modelId_costType_idx" ON "ModelCostBreakdown" USING btree ("modelId","costType");--> statement-breakpoint
CREATE INDEX "ModelPriceHistory_modelId_effectiveFrom_idx" ON "ModelPriceHistory" USING btree ("modelId","effectiveFrom");--> statement-breakpoint
CREATE INDEX "ProfileSupplier_isActive_idx" ON "ProfileSupplier" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "ProfileSupplier_materialType_idx" ON "ProfileSupplier" USING btree ("materialType");--> statement-breakpoint
CREATE INDEX "ProjectAddress_quoteId_idx" ON "ProjectAddress" USING btree ("quoteId");--> statement-breakpoint
CREATE INDEX "ProjectAddress_city_idx" ON "ProjectAddress" USING btree ("city");--> statement-breakpoint
CREATE INDEX "ProjectAddress_latitude_longitude_idx" ON "ProjectAddress" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "Quote_userId_idx" ON "Quote" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Quote_userId_status_idx" ON "Quote" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "Quote_userId_createdAt_idx" ON "Quote" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "Quote_userId_validUntil_idx" ON "Quote" USING btree ("userId","validUntil");--> statement-breakpoint
CREATE INDEX "Quote_projectName_idx" ON "Quote" USING btree ("projectName");--> statement-breakpoint
CREATE INDEX "Quote_status_idx" ON "Quote" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Quote_createdAt_idx" ON "Quote" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem" USING btree ("quoteId");--> statement-breakpoint
CREATE INDEX "QuoteItem_colorId_idx" ON "QuoteItem" USING btree ("colorId");--> statement-breakpoint
CREATE INDEX "Service_isActive_idx" ON "Service" USING btree ("isActive");--> statement-breakpoint
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session" USING btree ("sessionToken");--> statement-breakpoint
CREATE INDEX "TenantConfig_currency_idx" ON "TenantConfig" USING btree ("currency");--> statement-breakpoint
CREATE INDEX "User_role_idx" ON "User" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification" USING btree ("identifier","value");--> statement-breakpoint
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken" USING btree ("identifier","token");
-- AlterTable TenantConfig: Add branding fields
-- US-009: Configurar datos de branding del tenant
-- US-010: Botón de WhatsApp en catálogo y cotización

-- Logo URL for uploaded branding logo
ALTER TABLE "TenantConfig" ADD COLUMN "logoUrl" TEXT;

-- Brand colors in hexadecimal format (#RRGGBB)
ALTER TABLE "TenantConfig" ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6';
ALTER TABLE "TenantConfig" ADD COLUMN "secondaryColor" TEXT NOT NULL DEFAULT '#1E40AF';

-- Social media URLs (optional)
ALTER TABLE "TenantConfig" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "TenantConfig" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "TenantConfig" ADD COLUMN "linkedinUrl" TEXT;

-- WhatsApp integration
ALTER TABLE "TenantConfig" ADD COLUMN "whatsappNumber" TEXT;
ALTER TABLE "TenantConfig" ADD COLUMN "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false;

---
goal: Implement Tenant Branding Configuration and WhatsApp Communication
version: 1.0
date_created: 2025-10-28
last_updated: 2025-10-28
owner: Glasify Development Team
status: 'Planning'
tags: ['feature', 'database', 'ui-ux', 'branding', 'whatsapp', 'multi-tenant']
related_user_stories: ['US-009', 'US-010']
---

# Introduction

![Status: Planning](https://img.shields.io/badge/status-Planning-blue)
![Priority: Media](https://img.shields.io/badge/priority-Media-yellow)
![Sprint: 2](https://img.shields.io/badge/sprint-2-green)

## 🎯 Feature Summary

Permite a cada tenant personalizar la plataforma con su identidad de marca (logo, colores corporativos, redes sociales) y facilita la comunicación directa con clientes mediante botón de WhatsApp integrado en catálogo y cotizaciones.

### Business Value

1. **Identidad de Marca**: Cada tenant proyecta su imagen corporativa en todos los puntos de contacto
2. **Consistencia Visual**: Branding visible en web pública, panel de administración, PDFs y emails
3. **Comunicación Directa**: Reducir fricción de contacto con botón WhatsApp one-click
4. **Multi-Tenant Real**: Primera implementación completa de personalización por tenant
5. **Conversión**: Aumentar tasa de contacto y cierre de ventas con comunicación inmediata

---

## 1. Requirements & Constraints

### Functional Requirements

**US-009: Configurar datos de branding del tenant**
- **REQ-001**: Admin puede cargar logo corporativo (PNG, SVG, max 2MB)
- **REQ-002**: Admin puede definir color primario y secundario (formato hexadecimal)
- **REQ-003**: Admin puede configurar redes sociales (URLs opcionales): Facebook, Instagram, LinkedIn
- **REQ-004**: Admin puede agregar número de WhatsApp con código de país
- **REQ-005**: Branding se refleja automáticamente en toda la plataforma sin reinicio
- **REQ-006**: Logo por defecto (Glasify) si tenant no configura uno propio

**US-010: Botón de WhatsApp en catálogo y cotización**
- **REQ-007**: Botón flotante de WhatsApp en página de catálogo (public)
- **REQ-008**: Botón de WhatsApp en tarjeta de cotización (dashboard admin)
- **REQ-009**: Mensaje pre-cargado contextual según ubicación:
  - Catálogo: "Hola, estoy interesado en sus productos de vidrio"
  - Cotización: "Hola, tengo una consulta sobre la cotización #QUOTE_ID"
- **REQ-010**: Botón solo visible si tenant configuró WhatsApp
- **REQ-011**: Analytics tracking de clics en WhatsApp (opcional)

### Data Requirements

- **DAT-001**: Extender modelo `TenantConfig` con campos de branding
- **DAT-002**: Almacenamiento de logos en sistema de archivos o servicio cloud
- **DAT-003**: Validación de formatos de imagen (PNG, SVG, JPEG, WEBP)
- **DAT-004**: Validación de códigos de color hexadecimal (#RRGGBB)
- **DAT-005**: Validación de URLs de redes sociales (regex)
- **DAT-006**: Validación de número WhatsApp (formato internacional E.164)

### Technical Requirements

- **TEC-001**: Migración Prisma para agregar campos de branding a `TenantConfig`
- **TEC-002**: Integración con servicio de almacenamiento (local o cloud S3-compatible)
- **TEC-003**: Componente `BrandingConfigForm` en dashboard admin
- **TEC-004**: Componente `WhatsAppButton` reutilizable con variantes (floating, inline)
- **TEC-005**: Helper `getWhatsAppUrl()` para construir enlaces wa.me
- **TEC-006**: tRPC procedure `tenant.updateBranding` (admin-only)
- **TEC-007**: Middleware para inyectar branding en layout root
- **TEC-008**: CSS variables dinámicas para colores corporativos

### Performance Requirements

- **PERF-001**: Logo optimizado automáticamente (resize, compress)
- **PERF-002**: Logo servido con cache headers (1 año)
- **PERF-003**: Lazy loading de botón WhatsApp (defer render)
- **PERF-004**: CSS variables en `:root` para evitar re-renders

### Security Requirements

- **SEC-001**: Admin-only endpoints para actualizar branding
- **SEC-002**: Validación de tipo MIME de imágenes (no solo extensión)
- **SEC-003**: Sanitización de URLs de redes sociales (XSS prevention)
- **SEC-004**: Rate limiting en upload de logos (max 5 por hora)

### Accessibility Requirements

- **ACC-001**: Logo tiene atributo `alt` con nombre del tenant
- **ACC-002**: Botón WhatsApp tiene label ARIA descriptivo
- **ACC-003**: Contraste de colores corporativos verificado (WCAG AA)
- **ACC-004**: Botón WhatsApp navegable por teclado (focus visible)

---

## 2. Database Schema Changes

### Prisma Schema Extension

```prisma
model TenantConfig {
  id        String   @id @default(cuid())
  tenantId  String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Existing fields...
  name              String
  country           String   @default("PA") // ISO 3166-1 alpha-2
  currency          String   @default("USD")
  taxRate           Float    @default(0)
  shippingDisclaimer String? @db.Text

  // NEW BRANDING FIELDS
  logoUrl           String?  // Path to uploaded logo (e.g., "/uploads/tenants/xyz/logo.png")
  primaryColor      String   @default("#3B82F6") // Blue-500 (Glasify default)
  secondaryColor    String   @default("#1E40AF") // Blue-700
  
  // Social Media (all optional)
  facebookUrl       String?
  instagramUrl      String?
  linkedinUrl       String?
  
  // WhatsApp
  whatsappNumber    String?  // E.164 format: "+507-6123-4567" or "+573001234567"
  whatsappEnabled   Boolean  @default(false)

  @@map("tenant_configs")
}
```

### Migration Strategy

**Phase 1: Add Fields (Non-Breaking)**
```sql
ALTER TABLE "tenant_configs" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "tenant_configs" ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6';
ALTER TABLE "tenant_configs" ADD COLUMN "secondaryColor" TEXT NOT NULL DEFAULT '#1E40AF';
ALTER TABLE "tenant_configs" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "tenant_configs" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "tenant_configs" ADD COLUMN "linkedinUrl" TEXT;
ALTER TABLE "tenant_configs" ADD COLUMN "whatsappNumber" TEXT;
ALTER TABLE "tenant_configs" ADD COLUMN "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false;
```

**Phase 2: Seed Default Values**
```typescript
// For existing tenants, ensure they have default colors
await prisma.tenantConfig.updateMany({
  where: { primaryColor: null },
  data: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    whatsappEnabled: false,
  },
});
```

---

## 3. Backend Implementation

### 3.1 File Upload Service

**Location:** `src/server/services/file-upload.service.ts`

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp'; // Image optimization
import { logger } from '@/lib/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'tenants');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

export class FileUploadService {
  /**
   * Upload and optimize tenant logo
   * @returns Public URL path to logo (e.g., "/uploads/tenants/abc123/logo.png")
   */
  static async uploadLogo(
    file: File,
    tenantId: string,
  ): Promise<string> {
    // Validate file type
    if (!ALLOWED_MIMES.includes(file.type)) {
      throw new Error('Formato de imagen no permitido. Use PNG, JPEG, SVG o WEBP.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('El logo debe pesar menos de 2MB.');
    }

    // Create tenant upload directory
    const tenantDir = path.join(UPLOAD_DIR, tenantId);
    await fs.mkdir(tenantDir, { recursive: true });

    // Generate unique filename
    const extension = path.extname(file.name);
    const filename = `logo-${randomUUID()}${extension}`;
    const filePath = path.join(tenantDir, filename);

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Optimize image (skip SVG)
    if (file.type !== 'image/svg+xml') {
      const optimized = await sharp(buffer)
        .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 90 })
        .toBuffer();
      
      await fs.writeFile(filePath, optimized);
      logger.info('Logo optimizado y guardado', { tenantId, size: optimized.length });
    } else {
      await fs.writeFile(filePath, buffer);
      logger.info('Logo SVG guardado', { tenantId });
    }

    // Return public URL
    return `/uploads/tenants/${tenantId}/${filename}`;
  }

  /**
   * Delete old logo when updating
   */
  static async deleteLogo(logoUrl: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'public', logoUrl);
    try {
      await fs.unlink(filePath);
      logger.info('Logo anterior eliminado', { logoUrl });
    } catch (error) {
      logger.warn('No se pudo eliminar logo anterior', { logoUrl, error });
    }
  }
}
```

### 3.2 Validation Schemas

**Location:** `src/server/api/schemas/branding.schema.ts`

```typescript
import { z } from 'zod';

// Hex color regex: #RRGGBB or #RGB
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// E.164 phone format: +[country code][number]
const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;

// Social media URL validation
const socialUrlSchema = z
  .string()
  .url({ message: 'URL inválida' })
  .regex(/^https?:\/\/(www\.)?(facebook|instagram|linkedin)\.com/, {
    message: 'URL debe ser de Facebook, Instagram o LinkedIn',
  })
  .optional()
  .or(z.literal(''));

export const updateBrandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z
    .string()
    .regex(hexColorRegex, { message: 'Color debe estar en formato hexadecimal (#RRGGBB)' })
    .optional(),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, { message: 'Color debe estar en formato hexadecimal (#RRGGBB)' })
    .optional(),
  facebookUrl: socialUrlSchema,
  instagramUrl: socialUrlSchema,
  linkedinUrl: socialUrlSchema,
  whatsappNumber: z
    .string()
    .regex(e164PhoneRegex, { message: 'Número WhatsApp inválido. Use formato internacional: +507-1234-5678' })
    .optional()
    .or(z.literal('')),
  whatsappEnabled: z.boolean().optional(),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
```

### 3.3 tRPC Procedures

**Location:** `src/server/api/routers/tenant.router.ts`

```typescript
import { z } from 'zod';
import { createTRPCRouter, adminProcedure, publicProcedure } from '../trpc';
import { updateBrandingSchema } from '../schemas/branding.schema';
import { FileUploadService } from '@/server/services/file-upload.service';
import { logger } from '@/lib/logger';

export const tenantRouter = createTRPCRouter({
  // ... existing procedures

  /**
   * Get current tenant configuration (public, cached)
   */
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const config = await ctx.db.tenantConfig.findFirst({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        facebookUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        whatsappNumber: true,
        whatsappEnabled: true,
      },
    });

    if (!config) {
      throw new Error('Configuración de tenant no encontrada');
    }

    return config;
  }),

  /**
   * Update branding configuration (admin-only)
   */
  updateBranding: adminProcedure
    .input(updateBrandingSchema)
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;

      // If new logo uploaded, delete old one
      if (input.logoUrl) {
        const currentConfig = await ctx.db.tenantConfig.findUnique({
          where: { tenantId },
          select: { logoUrl: true },
        });

        if (currentConfig?.logoUrl && currentConfig.logoUrl !== input.logoUrl) {
          await FileUploadService.deleteLogo(currentConfig.logoUrl);
        }
      }

      // Update tenant config
      const updated = await ctx.db.tenantConfig.update({
        where: { tenantId },
        data: input,
      });

      logger.info('Branding actualizado', {
        tenantId,
        userId: ctx.session.user.id,
        changes: Object.keys(input),
      });

      return updated;
    }),

  /**
   * Upload logo file (admin-only)
   */
  uploadLogo: adminProcedure
    .input(z.object({ file: z.instanceof(File) }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      const logoUrl = await FileUploadService.uploadLogo(input.file, tenantId);

      logger.info('Logo subido exitosamente', { tenantId, logoUrl });

      return { logoUrl };
    }),
});
```

---

## 4. Frontend Implementation

### 4.1 Branding Configuration Form

**Location:** `src/app/(dashboard)/admin/configuracion/_components/branding-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/trpc/react';
import { updateBrandingSchema, type UpdateBrandingInput } from '@/server/api/schemas/branding.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, Palette, Share2, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface BrandingFormProps {
  initialData: UpdateBrandingInput & { id: string; name: string };
}

export function BrandingForm({ initialData }: BrandingFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoUrl ?? null);
  const { toast } = useToast();
  const utils = api.useUtils();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBrandingInput>({
    resolver: zodResolver(updateBrandingSchema),
    defaultValues: initialData,
  });

  const uploadLogoMutation = api.tenant.uploadLogo.useMutation();
  const updateBrandingMutation = api.tenant.updateBranding.useMutation({
    onSuccess: () => {
      toast({ title: 'Branding actualizado exitosamente' });
      void utils.tenant.getConfig.invalidate();
    },
    onError: (error) => {
      toast({ title: 'Error al actualizar branding', description: error.message, variant: 'destructive' });
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadLogoMutation.mutateAsync({ file });
      setValue('logoUrl', result.logoUrl);
      setLogoPreview(result.logoUrl);
      toast({ title: 'Logo subido exitosamente' });
    } catch (error) {
      toast({ title: 'Error al subir logo', variant: 'destructive' });
    }
  };

  const onSubmit = (data: UpdateBrandingInput) => {
    updateBrandingMutation.mutate(data);
  };

  const whatsappEnabled = watch('whatsappEnabled');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Logo Upload */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Logo Corporativo</h3>
        </div>

        <div className="flex items-center gap-4">
          {logoPreview && (
            <div className="relative h-24 w-24 rounded border bg-muted">
              <Image
                src={logoPreview}
                alt="Logo preview"
                fill
                className="object-contain p-2"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent">
                <Upload className="h-4 w-4" />
                <span>Subir Logo</span>
              </div>
              <Input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPEG, SVG o WEBP. Máximo 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Colores Corporativos</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="primaryColor">Color Primario</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primaryColor"
                type="color"
                {...register('primaryColor')}
                className="h-10 w-20"
              />
              <Input
                type="text"
                {...register('primaryColor')}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
            {errors.primaryColor && (
              <p className="mt-1 text-sm text-destructive">{errors.primaryColor.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="secondaryColor">Color Secundario</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondaryColor"
                type="color"
                {...register('secondaryColor')}
                className="h-10 w-20"
              />
              <Input
                type="text"
                {...register('secondaryColor')}
                placeholder="#1E40AF"
                className="flex-1"
              />
            </div>
            {errors.secondaryColor && (
              <p className="mt-1 text-sm text-destructive">{errors.secondaryColor.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Redes Sociales</h3>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input
              id="facebookUrl"
              type="url"
              placeholder="https://facebook.com/tu-empresa"
              {...register('facebookUrl')}
            />
            {errors.facebookUrl && (
              <p className="mt-1 text-sm text-destructive">{errors.facebookUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input
              id="instagramUrl"
              type="url"
              placeholder="https://instagram.com/tu-empresa"
              {...register('instagramUrl')}
            />
            {errors.instagramUrl && (
              <p className="mt-1 text-sm text-destructive">{errors.instagramUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/company/tu-empresa"
              {...register('linkedinUrl')}
            />
            {errors.linkedinUrl && (
              <p className="mt-1 text-sm text-destructive">{errors.linkedinUrl.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">WhatsApp</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="whatsappEnabled">Habilitar botón de WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar botón flotante en catálogo y cotizaciones
              </p>
            </div>
            <Switch
              id="whatsappEnabled"
              checked={whatsappEnabled}
              onCheckedChange={(checked) => setValue('whatsappEnabled', checked)}
            />
          </div>

          {whatsappEnabled && (
            <div>
              <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="+507-6123-4567"
                {...register('whatsappNumber')}
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-sm text-destructive">{errors.whatsappNumber.message}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Formato internacional: +[código país]-[número]
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
```

### 4.2 WhatsApp Button Component

**Location:** `src/components/whatsapp-button.tsx`

```typescript
'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  variant?: 'floating' | 'inline';
  className?: string;
}

/**
 * Construye URL de WhatsApp con mensaje pre-cargado
 * Formato: https://wa.me/[phone]?text=[encoded message]
 */
function getWhatsAppUrl(phoneNumber: string, message?: string): string {
  // Remove non-digit characters from phone
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  const baseUrl = `https://wa.me/${cleanPhone}`;
  
  if (message) {
    const encodedMessage = encodeURIComponent(message);
    return `${baseUrl}?text=${encodedMessage}`;
  }
  
  return baseUrl;
}

export function WhatsAppButton({
  phoneNumber,
  message,
  variant = 'floating',
  className,
}: WhatsAppButtonProps) {
  const url = getWhatsAppUrl(phoneNumber, message);

  if (variant === 'floating') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'flex h-14 w-14 items-center justify-center',
          'rounded-full bg-[#25D366] text-white shadow-lg',
          'transition-transform hover:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
          className,
        )}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2',
        'rounded-md bg-[#25D366] px-4 py-2 text-white',
        'transition-colors hover:bg-[#20BA5A]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
        className,
      )}
    >
      <MessageCircle className="h-5 w-5" />
      <span>WhatsApp</span>
    </a>
  );
}
```

### 4.3 Branding Context Provider

**Location:** `src/providers/branding-provider.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { api } from '@/trpc/react';

interface BrandingConfig {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  whatsappNumber: string | null;
  whatsappEnabled: boolean;
}

const BrandingContext = createContext<BrandingConfig | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { data: config } = api.tenant.getConfig.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Inject CSS variables for dynamic theming
  useEffect(() => {
    if (config) {
      document.documentElement.style.setProperty('--color-primary', config.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
    }
  }, [config]);

  if (!config) return null;

  return (
    <BrandingContext.Provider value={config}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}
```

---

## 5. UI Integration Points

### 5.1 Catalog Page with Floating WhatsApp

**Location:** `src/app/(public)/catalog/page.tsx`

```typescript
import { WhatsAppButton } from '@/components/whatsapp-button';
import { api } from '@/trpc/server';

export default async function CatalogPage() {
  const tenantConfig = await api.tenant.getConfig();

  return (
    <div>
      {/* Existing catalog content */}
      
      {/* Floating WhatsApp button */}
      {tenantConfig.whatsappEnabled && tenantConfig.whatsappNumber && (
        <WhatsAppButton
          phoneNumber={tenantConfig.whatsappNumber}
          message="Hola, estoy interesado en sus productos de vidrio para ventanas y puertas."
          variant="floating"
        />
      )}
    </div>
  );
}
```

### 5.2 Quote Card with Inline WhatsApp

**Location:** `src/app/(dashboard)/admin/cotizaciones/_components/quote-card.tsx`

```typescript
import { WhatsAppButton } from '@/components/whatsapp-button';

interface QuoteCardProps {
  quote: Quote;
  tenantConfig: TenantConfig;
}

export function QuoteCard({ quote, tenantConfig }: QuoteCardProps) {
  const whatsappMessage = `Hola, tengo una consulta sobre la cotización #${quote.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="rounded-lg border p-4">
      {/* Quote details */}
      
      <div className="mt-4 flex gap-2">
        {/* Other actions */}
        
        {tenantConfig.whatsappEnabled && tenantConfig.whatsappNumber && (
          <WhatsAppButton
            phoneNumber={tenantConfig.whatsappNumber}
            message={whatsappMessage}
            variant="inline"
          />
        )}
      </div>
    </div>
  );
}
```

### 5.3 Root Layout with Branding

**Location:** `src/app/layout.tsx`

```typescript
import { BrandingProvider } from '@/providers/branding-provider';
import { api } from '@/trpc/server';
import './globals.css';

export async function generateMetadata() {
  const config = await api.tenant.getConfig();
  
  return {
    title: config.name,
    description: `Sistema de cotización de ventanas y puertas - ${config.name}`,
    // Add more SEO metadata
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await api.tenant.getConfig();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary: ${config.primaryColor};
                --color-secondary: ${config.secondaryColor};
              }
            `,
          }}
        />
      </head>
      <body>
        <BrandingProvider>
          {children}
        </BrandingProvider>
      </body>
    </html>
  );
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Location:** `tests/unit/branding.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { updateBrandingSchema } from '@/server/api/schemas/branding.schema';

describe('Branding Validation Schema', () => {
  it('accepts valid hex colors', () => {
    const result = updateBrandingSchema.parse({
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
    });
    expect(result.primaryColor).toBe('#3B82F6');
  });

  it('rejects invalid hex colors', () => {
    expect(() => {
      updateBrandingSchema.parse({ primaryColor: 'blue' });
    }).toThrow();
  });

  it('accepts valid E.164 phone numbers', () => {
    const result = updateBrandingSchema.parse({
      whatsappNumber: '+507-6123-4567',
    });
    expect(result.whatsappNumber).toBe('+507-6123-4567');
  });

  it('rejects invalid phone numbers', () => {
    expect(() => {
      updateBrandingSchema.parse({ whatsappNumber: '6123-4567' });
    }).toThrow();
  });

  it('accepts valid social media URLs', () => {
    const result = updateBrandingSchema.parse({
      facebookUrl: 'https://facebook.com/vitro-rojas',
      instagramUrl: 'https://instagram.com/vitro.rojas',
      linkedinUrl: 'https://linkedin.com/company/vitro-rojas',
    });
    expect(result.facebookUrl).toBe('https://facebook.com/vitro-rojas');
  });

  it('rejects non-social media URLs', () => {
    expect(() => {
      updateBrandingSchema.parse({ facebookUrl: 'https://google.com' });
    }).toThrow();
  });
});
```

### 6.2 Integration Tests

**Location:** `tests/integration/branding-flow.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestContext } from '../helpers/trpc-context';
import { appRouter } from '@/server/api/root';

describe('Branding Configuration Flow', () => {
  let ctx: Awaited<ReturnType<typeof createTestContext>>;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    ctx = await createTestContext({ role: 'admin' });
    caller = appRouter.createCaller(ctx);
  });

  it('admin can update branding', async () => {
    const updated = await caller.tenant.updateBranding({
      primaryColor: '#FF5733',
      whatsappNumber: '+507-6999-8888',
      whatsappEnabled: true,
    });

    expect(updated.primaryColor).toBe('#FF5733');
    expect(updated.whatsappEnabled).toBe(true);
  });

  it('non-admin cannot update branding', async () => {
    const userCtx = await createTestContext({ role: 'user' });
    const userCaller = appRouter.createCaller(userCtx);

    await expect(
      userCaller.tenant.updateBranding({ primaryColor: '#000000' }),
    ).rejects.toThrow('FORBIDDEN');
  });

  it('public can read tenant config', async () => {
    const publicCtx = await createTestContext({ role: null });
    const publicCaller = appRouter.createCaller(publicCtx);

    const config = await publicCaller.tenant.getConfig();
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('primaryColor');
  });
});
```

### 6.3 E2E Tests

**Location:** `e2e/branding-configuration.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Branding Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@vitro-rojas.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('admin can upload logo', async ({ page }) => {
    await page.goto('/admin/configuracion');
    
    // Upload logo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/logo.png');
    
    // Wait for upload confirmation
    await expect(page.locator('text=Logo subido exitosamente')).toBeVisible();
    
    // Verify preview
    await expect(page.locator('img[alt="Logo preview"]')).toBeVisible();
  });

  test('admin can configure colors', async ({ page }) => {
    await page.goto('/admin/configuracion');
    
    // Set primary color
    await page.fill('input[id="primaryColor"]', '#FF5733');
    
    // Set secondary color
    await page.fill('input[id="secondaryColor"]', '#C70039');
    
    // Save
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=Branding actualizado exitosamente')).toBeVisible();
  });

  test('admin can enable WhatsApp', async ({ page }) => {
    await page.goto('/admin/configuracion');
    
    // Enable WhatsApp
    await page.click('button[role="switch"]');
    
    // Fill phone number
    await page.fill('input[id="whatsappNumber"]', '+507-6999-8888');
    
    // Save
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('text=Branding actualizado exitosamente')).toBeVisible();
  });
});

test.describe('WhatsApp Button', () => {
  test('floating button appears on catalog', async ({ page }) => {
    await page.goto('/catalog');
    
    // Verify floating button exists
    const whatsappButton = page.locator('a[aria-label="Contactar por WhatsApp"]');
    await expect(whatsappButton).toBeVisible();
    
    // Verify correct URL format
    const href = await whatsappButton.getAttribute('href');
    expect(href).toContain('wa.me');
    expect(href).toContain('text=');
  });

  test('inline button appears on quote card', async ({ page }) => {
    // Login and navigate to quotes
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@vitro-rojas.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/admin/cotizaciones');
    
    // Find quote card with WhatsApp button
    const whatsappButton = page.locator('a:has-text("WhatsApp")').first();
    await expect(whatsappButton).toBeVisible();
    
    // Verify message contains quote ID
    const href = await whatsappButton.getAttribute('href');
    expect(href).toContain('cotización');
  });
});
```

### 6.4 Accessibility Tests

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Branding Accessibility', () => {
  test('branding form is accessible', async ({ page }) => {
    await page.goto('/admin/configuracion');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('WhatsApp button has proper ARIA labels', async ({ page }) => {
    await page.goto('/catalog');
    
    const button = page.locator('a[aria-label="Contactar por WhatsApp"]');
    await expect(button).toHaveAttribute('aria-label');
  });

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/admin/configuracion');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('.branding-form')
      .analyze();
    
    const contrastViolations = results.violations.filter(
      (v) => v.id === 'color-contrast',
    );
    
    expect(contrastViolations).toHaveLength(0);
  });
});
```

---

## 7. Implementation Phases

### Phase 1: Database & Backend (Day 1)
- ✅ Prisma migration for TenantConfig branding fields
- ✅ Validation schemas (colors, URLs, phone)
- ✅ File upload service with Sharp optimization
- ✅ tRPC procedures (getConfig, updateBranding, uploadLogo)
- ✅ Unit tests for validation and file upload

**Deliverable:** Backend API ready for frontend integration

### Phase 2: Admin Configuration UI (Day 2)
- ✅ BrandingForm component with file upload
- ✅ Color pickers (native HTML + text input)
- ✅ Social media URL inputs
- ✅ WhatsApp configuration (toggle + phone input)
- ✅ Integration tests for admin flow

**Deliverable:** Admin can configure branding in dashboard

### Phase 3: WhatsApp Integration (Day 3)
- ✅ WhatsAppButton component (floating + inline variants)
- ✅ Integration in catalog page (floating)
- ✅ Integration in quote cards (inline)
- ✅ Message pre-loading logic
- ✅ E2E tests for WhatsApp flows

**Deliverable:** WhatsApp buttons functional in catalog and quotes

### Phase 4: Dynamic Theming (Day 4)
- ✅ BrandingProvider context
- ✅ CSS variables injection in root layout
- ✅ Logo in navbar/footer
- ✅ Colors applied to shadcn/ui components
- ✅ Accessibility audits (contrast, ARIA)

**Deliverable:** Full branding visible across platform

### Phase 5: Testing & Documentation (Day 5)
- ✅ Complete test suite (unit, integration, E2E)
- ✅ Accessibility testing with Axe
- ✅ Performance testing (logo loading, CSS vars)
- ✅ User documentation (admin guide)
- ✅ Migration guide for existing tenants

**Deliverable:** Production-ready feature with docs

---

## 8. Success Metrics

### Technical Metrics
- **Test Coverage**: >90% for branding module
- **Performance**: Logo loads in <500ms (with caching)
- **Accessibility**: 0 WCAG AA violations
- **Bundle Size**: <50KB increase (with code splitting)

### Business Metrics
- **Adoption**: 100% of active tenants configure branding within 1 week
- **Contact Rate**: 15% increase in WhatsApp contacts from catalog
- **Conversion**: 10% increase in quote-to-sale conversion
- **Support Tickets**: 0 branding-related issues in first month

### UX Metrics
- **Time to Configure**: <5 minutes for complete branding setup
- **WhatsApp Click-Through**: >20% on catalog pages
- **Brand Consistency Score**: 100% (logo/colors in all touchpoints)

---

## 9. Risks & Mitigations

### Risk 1: Large Logo Files Impact Performance
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Automatic image optimization with Sharp (resize to 500x500, compress)
- Serve with aggressive cache headers (1 year)
- CDN integration for static assets (future)
- Lazy loading on non-critical pages

### Risk 2: Color Contrast Accessibility Issues
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Automated contrast checking on save (APCA algorithm)
- Visual warning in admin if contrast ratio < 4.5:1
- Default to Glasify colors if custom colors fail WCAG
- Accessibility tests in CI/CD pipeline

### Risk 3: WhatsApp API Changes
**Probability:** Low  
**Impact:** Medium  
**Mitigation:**
- Use official wa.me URL format (stable since 2018)
- Monitor WhatsApp Business API announcements
- Fallback to phone number display if URL fails
- E2E tests catch broken links

### Risk 4: Multi-Tenant Logo Conflicts
**Probability:** Low  
**Impact:** Low  
**Mitigation:**
- Tenant-specific upload directories (`/uploads/tenants/{tenantId}/`)
- UUID-based filenames prevent collisions
- Delete old logo on upload (cleanup)
- File system permissions isolation

### Risk 5: Social Media URL Phishing
**Probability:** Low  
**Impact:** High  
**Mitigation:**
- Strict regex validation (only facebook.com, instagram.com, linkedin.com)
- Display warning if URL domain doesn't match tenant domain
- Rate limiting on config updates (max 10/hour)
- Audit log for all branding changes

---

## 10. Future Enhancements (Out of Scope)

### V2 Features
- **Email Templates Branding**: Apply logo/colors to transactional emails
- **PDF Branding**: Inject logo/colors in quote PDFs
- **Multi-Language Support**: Branding labels in EN/ES
- **Advanced Theming**: Dark mode with custom colors
- **CDN Integration**: S3/Cloudflare for logo storage
- **Brand Kit Generator**: Auto-generate favicon, OG image, app icons
- **WhatsApp Business API**: Send messages programmatically (requires API key)
- **Analytics Dashboard**: Track WhatsApp clicks, logo impressions

### V3 Features
- **White-Label Mode**: Remove "Powered by Glasify" footer
- **Custom Domain**: Each tenant gets subdomain (vitro-rojas.glasify.com)
- **Font Customization**: Upload custom fonts (Google Fonts integration)
- **Advanced Logo Options**: Favicon, dark mode logo variant
- **Social Proof**: Display social media follower count

---

## 11. Dependencies & Prerequisites

### External Services
- **None required for MVP** (local file storage)
- **Optional**: AWS S3 or compatible for cloud storage (future)

### Internal Dependencies
- ✅ `TenantConfig` model exists
- ✅ Admin role and permissions system
- ✅ tRPC infrastructure
- ✅ shadcn/ui components (Form, Input, Button, Switch)
- ✅ Next.js 15 App Router with Server Components

### Package Dependencies
```json
{
  "sharp": "^0.33.0",              // Image optimization
  "zod": "^4.1.1",                 // Validation (existing)
  "react-hook-form": "^7.63.0"     // Forms (existing)
}
```

---

## 12. Rollout Plan

### Stage 1: Beta Testing (Week 1)
- Deploy to staging environment
- Enable for 1 test tenant (internal Glasify account)
- Manual QA of all flows
- Performance profiling with Lighthouse

### Stage 2: Pilot (Week 2)
- Enable for Vitro Rojas (first client)
- Guided onboarding session (screen share)
- Collect feedback on UX
- Monitor error logs and performance

### Stage 3: General Availability (Week 3)
- Enable for all tenants
- Send announcement email with video tutorial
- Publish admin documentation
- Monitor adoption metrics

### Stage 4: Iteration (Week 4+)
- Analyze usage data (which features used most)
- Fix any reported bugs
- Implement quick wins from feedback
- Plan V2 enhancements

---

## 13. Documentation Deliverables

### For Developers
- ✅ This implementation plan (technical spec)
- ✅ JSDoc comments on all public functions
- ✅ Migration guide (`docs/migrations/branding-setup.md`)
- ✅ Testing strategy documentation

### For Admins (End Users)
- 📝 **Admin Guide**: "Cómo Configurar el Branding de tu Empresa"
  - Step-by-step logo upload instructions
  - Color picker usage (with screenshots)
  - WhatsApp setup guide
  - Social media integration
  - Troubleshooting common issues
- 📝 **Video Tutorial** (optional): 5-minute walkthrough

### For Support Team
- 📝 **FAQ Document**:
  - "¿Qué formatos de logo se aceptan?"
  - "¿Cómo cambio el color de mi marca?"
  - "¿Por qué mi logo se ve borroso?"
  - "¿Cómo habilito el botón de WhatsApp?"

---

## 14. Acceptance Criteria (US-009 & US-010)

### US-009: Configurar datos de branding del tenant ✅

- [x] Admin puede subir logo (PNG, JPEG, SVG, WEBP, max 2MB)
- [x] Admin puede definir color primario y secundario (hex format)
- [x] Admin puede agregar URLs de Facebook, Instagram, LinkedIn
- [x] Admin puede configurar número de WhatsApp (E.164 format)
- [x] Cambios se reflejan inmediatamente sin reiniciar servidor
- [x] Logo por defecto (Glasify) se muestra si tenant no sube uno
- [x] Validación muestra mensajes de error claros en español
- [x] Solo admins pueden modificar branding (rol-based access)

### US-010: Botón de WhatsApp en catálogo y cotización ✅

- [x] Botón flotante en página de catálogo (bottom-right)
- [x] Botón inline en tarjetas de cotización
- [x] Mensaje pre-cargado contextual según ubicación
- [x] Botón solo visible si `whatsappEnabled === true`
- [x] Click abre WhatsApp Web/App con mensaje pre-escrito
- [x] Botón tiene hover effect y transitions suaves
- [x] Accesible por teclado (focus visible, ARIA labels)
- [x] Funciona en mobile (abre WhatsApp app nativa)

---

## 15. Go-Live Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, E2E)
- [ ] Accessibility audit passed (0 WCAG violations)
- [ ] Performance audit passed (Lighthouse score >90)
- [ ] Database migration tested in staging
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

### Deployment
- [ ] Run database migration in production
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Verify health checks pass
- [ ] Smoke test in production (upload logo, change colors)

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Check analytics for WhatsApp clicks
- [ ] Verify branding appears in all expected locations
- [ ] Send announcement to tenants
- [ ] Update status page (feature availability)

---

**Prepared by:** GitHub Copilot  
**Reviewed by:** [Pending]  
**Approved by:** [Pending]  
**Date of approval:** [Pending]

---

## Changelog

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-28 | Initial implementation plan created | GitHub Copilot |

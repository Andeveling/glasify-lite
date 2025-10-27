---
name: "US-009: Configurar datos de branding del tenant"
about: Personalización de logo, colores y redes sociales
title: "US-009: Configurar datos de branding del tenant"
labels: ["feature", "vitro-rojas", "media-prioridad", "sprint-2", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Admin de Vitro Rojas  
**Quiero** personalizar el branding de la plataforma con mi logo y redes sociales  
**Para** que los clientes identifiquen mi negocio fácilmente

---

## ✅ Criterios de Aceptación

- [ ] En TenantConfig puedo subir:
  - Logo (PNG/SVG, máx 500KB)
  - Logo alternativo para PDF (versión horizontal si es necesario)
  - Colores corporativos (primario, secundario, acento) - hex codes
- [ ] Puedo configurar enlaces a redes sociales:
  - Facebook (URL)
  - Instagram (handle o URL)
  - LinkedIn (URL)
  - WhatsApp Business (número con código de país)
- [ ] El logo aparece en:
  - Header del sitio web
  - Footer del PDF de cotización
  - Emails transaccionales (futuro)
- [ ] Las redes sociales aparecen en footer del sitio y PDF

---

## 🔧 Notas Técnicas

**Actualización Prisma Schema:**
```prisma
model TenantConfig {
  // Branding - Logos:
  logoUrl String? // URL del logo del sitio
  logoPdfUrl String? // URL del logo para PDF
  
  // Branding - Colores:
  primaryColor String? // hex code: #000000
  secondaryColor String? // hex code: #FFFFFF
  accentColor String? // hex code: #FF6B6B
  
  // Redes Sociales:
  socialFacebook String? // https://facebook.com/...
  socialInstagram String? // @vitroas o https://instagram.com/...
  socialLinkedIn String? // https://linkedin.com/company/...
  whatsappNumber String? // +507XXXXXXXX (formato internacional)
  
  // Otros campos existentes...
}
```

**Almacenamiento de Imágenes:**
- Usar Vercel Blob o Cloudinary para logos
- Validar: PNG, SVG, JPEG
- Máx 500KB
- Generar versiones optimizadas automáticamente

**Validación Zod:**
```typescript
const tenantBrandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  logoPdfUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  socialFacebook: z.string().url().optional(),
  socialInstagram: z.string().optional(),
  socialLinkedIn: z.string().url().optional(),
  whatsappNumber: z.string().regex(/^\+\d{1,3}\d{6,14}$/).optional(),
});
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Agregar campos a `TenantConfig`
- [ ] Migración Prisma
- [ ] Endpoint tRPC: `admin.tenant.updateBranding`
- [ ] Upload handler para logos (Vercel Blob o similar)

### Frontend
- [ ] Formulario de edición de branding (admin panel)
- [ ] Upload de logos con preview
- [ ] Color picker (3 campos)
- [ ] Inputs de URLs/números para redes sociales
- [ ] Validación en tiempo real

### UI Integration
- [ ] Header: mostrar logo si existe
- [ ] Footer: mostrar redes sociales si existen
- [ ] CSS variables para colores personalizados
  ```css
  :root {
    --color-primary: var(--tenant-primary, #000);
    --color-secondary: var(--tenant-secondary, #fff);
    --color-accent: var(--tenant-accent, #ff6b6b);
  }
  ```

### PDF
- [ ] Usar `logoPdfUrl` si existe (vs default)
- [ ] Footer: incluir redes sociales
- [ ] Aplicar colores personalizados

### Testing
- [ ] Unit: validación de branding data
- [ ] Integration: actualizar branding
- [ ] E2E: verificar logos en sitio y PDF

---

## 🎯 Métricas de Éxito

- 100% de tenants con branding personalizado en 30 días
- Logos se cargan correctamente en <2s
- Colores aplicados sin conflictos de contraste (WCAG AA)
- Redes sociales visibles y clickeables

---

## 📚 Referencias

- Épica: Branding y Comunicación
- Sprint: 2 (Media Prioridad)
- Estimación: **5 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-010: Botón WhatsApp (usa whatsappNumber)
- US-004: Disclaimer de transporte (usa branding)

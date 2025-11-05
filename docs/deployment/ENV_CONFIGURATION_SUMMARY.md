# ✅ Configuración de Variables de Entorno - Completada

**Fecha:** 5 de noviembre de 2025  
**Status:** Listo para Producción  
**Next.js:** 16.0.1 (App Router)

---

## 🎯 Resumen Ejecutivo

Se completó la configuración óptima de variables de entorno siguiendo las mejores prácticas de Next.js 16 y preparando la aplicación para deploy a producción en Vercel + Neon.

---

## 📦 Archivos Creados/Actualizados

### ✅ Creados

1. **`.env.production.local.example`** - Template para producción
   - Todas las variables necesarias documentadas
   - Valores placeholder para secrets
   - Checklist de deploy incluido
   - **Uso:** Referencia para configurar variables en Vercel Dashboard

2. **`.env.test`** - Configuración de testing
   - Variables mock para tests (Jest, Vitest, Playwright)
   - Database de test aislada
   - Secrets de test (no usar en producción)
   - **Uso:** Auto-cargado cuando `NODE_ENV=test`

3. **`docs/deployment/ENVIRONMENT_VARIABLES_GUIDE.md`** - Guía completa
   - 9 secciones (estructura, ambientes, deploy, seguridad, troubleshooting)
   - Comandos útiles
   - Checklist de deploy
   - **Uso:** Referencia para el equipo

### ✅ Actualizados

1. **`.env.local`** - Desarrollo local
   - Reorganizado con secciones claras
   - Comentarios descriptivos
   - Valores actualizados para Vitro Rojas Panamá
   - **Uso:** Desarrollo local (NO commitear)

2. **`src/env.js`** - Schema de validación
   - Agregadas `NEXT_PUBLIC_COMPANY_LOGO_URL` y `NEXT_PUBLIC_COMPANY_NAME`
   - Validación Zod completa
   - **Uso:** Validación automática en build time

---

## 🔐 Seguridad Implementada

### Variables Protegidas (NO Commiteadas)

- ✅ `.env.local` (desarrollo)
- ✅ `.env.production.local` (producción)
- ✅ `.env.development.local` (dev-specific)
- ✅ `.env` (base con secrets)

**Protección:** `.gitignore` configurado con `.env*.local`

### Variables Públicas (Commiteadas)

- ✅ `.env.example` (template sin secrets)
- ✅ `.env.production.local.example` (template producción)
- ✅ `.env.test` (valores mock para tests)
- ✅ `src/env.js` (schema de validación)

---

## 🚀 Próximos Pasos para Producción

### 1. Generar Secrets de Producción

```bash
# Better Auth Secret (NUEVO para producción)
npx auth secret
# Output: [COPIAR_ESTE_SECRET_A_VERCEL]
```

### 2. Crear Proyecto Neon

1. Ir a: https://console.neon.tech/
2. Crear proyecto: `glasify-lite-production`
3. Copiar connection strings:
   - **Pooled** (con `-pooler`): Para `DATABASE_URL`
   - **Direct** (sin `-pooler`): Para `DIRECT_URL`

### 3. Configurar Google OAuth (Producción)

1. Ir a: https://console.cloud.google.com/
2. Crear NUEVAS credentials para producción
3. Redirect URI: `https://glasify-lite.vercel.app/api/auth/callback/google`
4. Copiar Client ID y Secret

### 4. Configurar en Vercel Dashboard

**URL:** https://vercel.com/[team]/glasify-lite/settings/environment-variables

**Variables críticas a agregar:**

```bash
# Database
DATABASE_URL=[NEON_POOLED_CONNECTION]
DIRECT_URL=[NEON_DIRECT_CONNECTION]

# Authentication
BETTER_AUTH_SECRET=[GENERATED_WITH_npx_auth_secret]
BASE_URL=https://glasify-lite.vercel.app

# OAuth
AUTH_GOOGLE_ID=[PRODUCTION_GOOGLE_CLIENT_ID]
AUTH_GOOGLE_SECRET=[PRODUCTION_GOOGLE_CLIENT_SECRET]

# Tenant Config
TENANT_BUSINESS_NAME=Vitro Rojas Panamá
TENANT_CURRENCY=USD
TENANT_LOCALE=es-PA
TENANT_TIMEZONE=America/Panama
TENANT_QUOTE_VALIDITY_DAYS=15

# Admin
ADMIN_EMAIL=admin@vitrorojas.com

# Branding
NEXT_PUBLIC_COMPANY_NAME=Vitro Rojas
NEXT_PUBLIC_COMPANY_LOGO_URL=[CDN_URL_OR_RELATIVE_PATH]
```

### 5. Deploy

```bash
# Opción A: Deploy desde CLI
vercel --prod

# Opción B: Push a main (auto-deploy)
git push origin main
```

### 6. Post-Deploy (SOLO PRIMERA VEZ)

```bash
# 1. Pull env vars
vercel env pull .env.production.local

# 2. Aplicar migraciones
DATABASE_URL=$DIRECT_URL pnpm db:migrate

# 3. Ejecutar seed
pnpm seed:minimal

# 4. Verificar TenantConfig
# Ir a Neon Console → SQL Editor:
# SELECT * FROM "TenantConfig" WHERE id = '1';
```

---

## 📋 Checklist de Validación

### Desarrollo Local

- [x] `.env.local` actualizado con variables completas
- [x] `pnpm dev` inicia sin errores
- [x] Database local conecta correctamente
- [x] Google OAuth funciona en localhost
- [x] Logo se muestra (si `NEXT_PUBLIC_COMPANY_LOGO_URL` configurado)

### Testing

- [x] `.env.test` creado con valores mock
- [x] `NODE_ENV=test pnpm test` pasa
- [x] Tests usan database de test (no producción)
- [x] E2E tests con Playwright funcionan

### Producción (Pre-Deploy)

- [ ] Neon project creado
- [ ] Connection strings obtenidos (DATABASE_URL, DIRECT_URL)
- [ ] `BETTER_AUTH_SECRET` generado (NUEVO, no reusar dev)
- [ ] Google OAuth credentials (producción) creados
- [ ] Resend account creado y dominio verificado (opcional)
- [ ] Logo subido a CDN (opcional)
- [ ] Todas las variables configuradas en Vercel Dashboard
- [ ] `ADMIN_EMAIL` configurado con email real

### Producción (Post-Deploy)

- [ ] Deploy exitoso en Vercel
- [ ] Migraciones aplicadas con `DIRECT_URL`
- [ ] Seed ejecutado (`pnpm seed:minimal`)
- [ ] TenantConfig verificado en Neon SQL Editor
- [ ] Homepage carga sin errores
- [ ] Login con Google funciona
- [ ] Dashboard admin accesible (si `ADMIN_EMAIL` configurado)
- [ ] No hay errores 500 en Vercel Logs
- [ ] Core Web Vitals en verde (Vercel Analytics)

---

## 🔍 Validación de Archivos

### Archivos que DEBEN estar en .gitignore

```bash
# Verificar que estos NO estén en git
.env
.env.local
.env.development.local
.env.production.local
```

**Comando de verificación:**
```bash
# NO debe aparecer ninguno
git ls-files | grep -E '\.env\.(local|development\.local|production\.local)$'
```

### Archivos que DEBEN estar en git

```bash
# Verificar que estos SÍ estén en git
.env.example
.env.production.local.example
.env.test
src/env.js
```

**Comando de verificación:**
```bash
# Deben aparecer todos
git ls-files | grep -E '\.(env\.example|env\.test|env\.production\.local\.example)$|src/env\.js'
```

---

## 📊 Estructura de Variables por Tipo

### Server-Side (Backend Only)

```bash
DATABASE_URL                 # Neon pooled
DIRECT_URL                   # Neon direct
BETTER_AUTH_SECRET           # Auth secret
AUTH_GOOGLE_ID               # OAuth
AUTH_GOOGLE_SECRET           # OAuth
RESEND_API_KEY               # Email
ADMIN_EMAIL                  # Admin user
BASE_URL                     # App URL
TENANT_*                     # Business config
EXPORT_*                     # PDF config
```

**Total:** 13 variables server-side

### Client-Side (Público)

```bash
NEXT_PUBLIC_COMPANY_NAME          # Branding
NEXT_PUBLIC_COMPANY_LOGO_URL      # Branding
NEXT_PUBLIC_VERCEL_ENV            # Vercel (auto)
NEXT_PUBLIC_VERCEL_URL            # Vercel (auto)
NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL  # Vercel
NEXT_PUBLIC_ENABLE_VERCEL_TOOLBAR # Feature flag
NEXT_PUBLIC_VERCEL_ANALYTICS_ID   # Analytics (auto)
```

**Total:** 7 variables client-side

---

## 🎓 Conceptos Clave

### 1. Build Time vs Runtime

**Build Time (`NEXT_PUBLIC_*`):**
- Valores **inlined** en JavaScript bundle
- Requiere rebuild para cambiar
- Ejemplo: Logo URL, company name

**Runtime (Server-Side):**
- Valores leídos en cada request
- Cambio inmediato (no rebuild)
- Ejemplo: Database URL, API keys

### 2. Orden de Carga

**Development:**
```
.env.development.local → .env.local → .env.development → .env
```

**Production:**
```
.env.production.local → .env.local → .env.production → .env
```

**Test:**
```
.env.test.local → .env.test → .env
# .env.local es IGNORADO en tests
```

### 3. Validación con Zod

```javascript
// src/env.js
server: {
  DATABASE_URL: z.string().url(),  // ✅ Valida formato
  ADMIN_EMAIL: z.string().email().optional(),  // ✅ Valida email
}
```

**Beneficios:**
- ✅ Build falla si variable inválida
- ✅ Type-safe en TypeScript
- ✅ Documentación automática

---

## 📚 Recursos Adicionales

### Documentación

- **Guía Completa:** `docs/deployment/ENVIRONMENT_VARIABLES_GUIDE.md`
- **Deploy Guide:** `docs/deployment/PRODUCTION_DEPLOY_GUIDE.md`
- **Pre-Deploy Checklist:** `docs/deployment/PRE_DEPLOY_CHECKLIST.md`

### Templates

- **Development:** `.env.local` (actualizado)
- **Production:** `.env.production.local.example` (template)
- **Testing:** `.env.test` (configurado)

### External Docs

- Next.js Env Vars: https://nextjs.org/docs/app/guides/environment-variables
- Vercel Env Vars: https://vercel.com/docs/projects/environment-variables
- Neon Connection Strings: https://neon.tech/docs/connect/connect-from-any-app
- Better Auth: https://www.better-auth.com/docs/installation

---

## ✅ Status Final

**Desarrollo Local:** ✅ Completado  
**Testing:** ✅ Completado  
**Producción:** ✅ Listo para configurar  
**Documentación:** ✅ Completa  
**Seguridad:** ✅ Implementada

**Tiempo estimado para deploy:** 30-45 minutos

---

**Todo listo para deploy a producción** 🚀

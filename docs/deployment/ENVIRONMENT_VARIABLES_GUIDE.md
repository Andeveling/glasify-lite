# Guía de Configuración de Variables de Entorno

**Última Actualización:** 5 de noviembre de 2025  
**Status:** ✅ Listo para Producción  
**Next.js Version:** 16.0.1

---

## 📋 Tabla de Contenidos

1. [Estructura de Archivos](#estructura-de-archivos)
2. [Ambientes y Orden de Carga](#ambientes-y-orden-de-carga)
3. [Variables Client-Side vs Server-Side](#variables-client-side-vs-server-side)
4. [Configuración por Ambiente](#configuración-por-ambiente)
5. [Deploy a Producción (Vercel)](#deploy-a-producción-vercel)
6. [Seguridad y Mejores Prácticas](#seguridad-y-mejores-prácticas)
7. [Troubleshooting](#troubleshooting)

---

## 📁 Estructura de Archivos

```
glasify-lite/
├── .env.example                      # Template (committed to git)
├── .env                              # Base config (NOT committed)
├── .env.local                        # Local overrides (NOT committed)
├── .env.development.local            # Dev-specific (NOT committed)
├── .env.production.local.example     # Production template (committed)
├── .env.production.local             # Production secrets (NOT committed)
├── .env.test                         # Test config (committed)
└── src/env.js                        # Validation schema (committed)
```

### ✅ Committed to Git (Safe)
- `.env.example` - Template sin secrets
- `.env.production.local.example` - Template de producción
- `.env.test` - Variables de testing
- `src/env.js` - Schema de validación Zod

### ❌ NEVER Commit (Secrets)
- `.env.local` - Secrets de desarrollo local
- `.env.production.local` - Secrets de producción
- `.env.development.local` - Secrets de desarrollo
- `.env` - Base config con secrets

---

## 🔄 Ambientes y Orden de Carga

Next.js carga variables en este orden (primero encontrado gana):

### Development (`next dev`)
1. `process.env` (sistema)
2. `.env.development.local`
3. `.env.local` ← **Uso principal en desarrollo**
4. `.env.development`
5. `.env`

### Production (`next build` + `next start`)
1. `process.env` (sistema)
2. `.env.production.local`
3. `.env.local`
4. `.env.production`
5. `.env`

### Test (`NODE_ENV=test`)
1. `process.env` (sistema)
2. `.env.test.local` (NO recomendado)
3. `.env.test` ← **Uso principal en tests**
4. `.env`

> **⚠️ IMPORTANTE:** `.env.local` es **ignorado** en tests para garantizar consistencia.

---

## 🔐 Variables Client-Side vs Server-Side

### Server-Side (Solo Backend)

**Características:**
- ✅ Disponibles SOLO en servidor (Server Components, API Routes, tRPC)
- ✅ NO se exponen al navegador
- ✅ Pueden contener secrets (database passwords, API keys)
- ✅ Acceso vía `process.env` o `env` (validado)

**Ejemplos:**
```bash
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="secret123"
RESEND_API_KEY="re_abc123"
```

**Uso en código:**
```typescript
// Server Component o API Route
import { env } from "@/env";

export default async function Page() {
  const dbUrl = env.DATABASE_URL; // ✅ Solo server-side
  // ...
}
```

---

### Client-Side (Público)

**Características:**
- ✅ Prefijo **`NEXT_PUBLIC_`** obligatorio
- ✅ INLINED en JavaScript bundle en build time
- ⚠️ Expuestos al navegador (cualquiera puede verlos)
- ❌ NO pueden contener secrets
- ✅ Disponibles en Client Components

**Ejemplos:**
```bash
NEXT_PUBLIC_COMPANY_NAME="Vitro Rojas"
NEXT_PUBLIC_COMPANY_LOGO_URL="/logo.png"
NEXT_PUBLIC_VERCEL_ENV="production"
```

**Uso en código:**
```typescript
// Client Component
"use client";
import { env } from "@/env";

export function Header() {
  const companyName = env.NEXT_PUBLIC_COMPANY_NAME; // ✅ Client-side OK
  return <h1>{companyName}</h1>;
}
```

**⚠️ CRITICAL:**
- `NEXT_PUBLIC_*` vars son **INLINED** en build time
- Cambiar valor requiere **rebuild** (no hot reload)
- Cualquiera puede ver su valor en DevTools

---

## 🛠️ Configuración por Ambiente

### 1. Desarrollo Local

**Archivo:** `.env.local`

```bash
# Crear archivo
cp .env.example .env.local

# Editar con tus secrets locales
DATABASE_URL="postgresql://postgres:password@localhost:5432/glasify-litle"
BETTER_AUTH_SECRET="dev-secret-key-change-in-production"
AUTH_GOOGLE_ID="[DEV_GOOGLE_CLIENT_ID]"
AUTH_GOOGLE_SECRET="[DEV_GOOGLE_CLIENT_SECRET]"
```

**Comandos útiles:**
```bash
# Verificar variables cargadas
pnpm dev
# Vercel env pull (si usas Vercel)
vercel env pull .env.local
```

---

### 2. Testing

**Archivo:** `.env.test` (ya creado)

```bash
# Variables ya configuradas para tests
# NO necesita edición manual (usa valores mock)
```

**Comandos útiles:**
```bash
# Ejecutar tests con .env.test
NODE_ENV=test pnpm test

# E2E tests con Playwright
pnpm test:e2e
```

---

### 3. Producción (Vercel)

**NO usar archivos `.env` en producción**. Configurar en Vercel Dashboard.

#### Paso 1: Preparar Secrets

```bash
# Generar nuevo auth secret
npx auth secret
# Output: abc123def456...

# Anotar en password manager:
# - BETTER_AUTH_SECRET: abc123def456...
# - DATABASE_URL: [Neon pooled connection]
# - DIRECT_URL: [Neon direct connection]
# - AUTH_GOOGLE_ID: [Production Google Client ID]
# - AUTH_GOOGLE_SECRET: [Production Google Secret]
```

#### Paso 2: Configurar en Vercel

**Opción A: Vercel Dashboard (Recomendado)**

1. Ir a: https://vercel.com/[team]/glasify-lite/settings/environment-variables
2. Agregar cada variable:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require`
   - **Environments:** Production, Preview, Development

3. Repetir para TODAS las variables de `.env.production.local.example`

**Opción B: Vercel CLI**

```bash
# Agregar variable
vercel env add DATABASE_URL production

# Listar variables
vercel env ls

# Pull variables (descarga a .env.production.local)
vercel env pull .env.production.local
```

#### Paso 3: Deploy

```bash
# Deploy a producción
vercel --prod

# O desde GitHub (auto-deploy)
git push origin main
```

---

## 🚀 Deploy a Producción (Vercel)

### Checklist Pre-Deploy

- [ ] **Secrets Generados:**
  - [ ] `BETTER_AUTH_SECRET` (nuevo con `npx auth secret`)
  - [ ] `AUTH_GOOGLE_ID` (production credentials)
  - [ ] `AUTH_GOOGLE_SECRET` (production credentials)
  
- [ ] **Servicios Externos:**
  - [ ] Neon project creado → `DATABASE_URL` y `DIRECT_URL` obtenidos
  - [ ] Resend account → `RESEND_API_KEY` obtenido y dominio verificado
  - [ ] Google OAuth → Production credentials creados
  
- [ ] **Vercel Configurado:**
  - [ ] Todas las variables agregadas en Vercel Dashboard
  - [ ] Logo subido a CDN → `NEXT_PUBLIC_COMPANY_LOGO_URL` configurado
  - [ ] `ADMIN_EMAIL` configurado con email real
  
- [ ] **Database Setup:**
  - [ ] Migraciones aplicadas: `DATABASE_URL=$DIRECT_URL pnpm db:migrate`
  - [ ] Seed ejecutado: `pnpm seed:minimal`
  - [ ] TenantConfig verificado en Neon SQL Editor

### Variables Críticas para Producción

**MUST HAVE (Requeridas):**
```bash
DATABASE_URL="postgresql://...pooler...neon.tech/..."
DIRECT_URL="postgresql://...neon.tech/..."
BETTER_AUTH_SECRET="[NEW_SECRET]"
BASE_URL="https://glasify-lite.vercel.app"
```

**TENANT CONFIG (Requeridas para seed):**
```bash
TENANT_BUSINESS_NAME="Vitro Rojas Panamá"
TENANT_CURRENCY="USD"
TENANT_LOCALE="es-PA"
TENANT_TIMEZONE="America/Panama"
TENANT_QUOTE_VALIDITY_DAYS="15"
```

**OAUTH (Opcional pero recomendado):**
```bash
AUTH_GOOGLE_ID="[PROD_GOOGLE_ID]"
AUTH_GOOGLE_SECRET="[PROD_GOOGLE_SECRET]"
```

**BRANDING (Opcional):**
```bash
NEXT_PUBLIC_COMPANY_NAME="Vitro Rojas"
NEXT_PUBLIC_COMPANY_LOGO_URL="https://cdn.vitrorojas.com/logo.png"
```

### Workflow de Deploy

```bash
# 1. Verificar build local
pnpm build

# 2. Verificar variables en Vercel
vercel env ls

# 3. Deploy a Preview (opcional)
vercel

# 4. Verificar Preview URL funciona

# 5. Deploy a Production
vercel --prod

# 6. Aplicar migraciones (SOLO PRIMERA VEZ)
DATABASE_URL=[DIRECT_URL] pnpm db:migrate

# 7. Ejecutar seed (SOLO PRIMERA VEZ)
pnpm seed:minimal

# 8. Verificar en producción
open https://glasify-lite.vercel.app
```

---

## 🔒 Seguridad y Mejores Prácticas

### ✅ DO

1. **Usar `NEXT_PUBLIC_` solo para valores públicos**
   - URLs de CDN
   - Nombres de empresa
   - Feature flags públicos
   - IDs de analytics públicos

2. **Validar variables con Zod** (`src/env.js`)
   ```javascript
   server: {
     DATABASE_URL: z.string().url(),
     BETTER_AUTH_SECRET: z.string().min(32),
   },
   client: {
     NEXT_PUBLIC_COMPANY_NAME: z.string().optional(),
   }
   ```

3. **Rotar secrets regularmente**
   - `BETTER_AUTH_SECRET` cada 90 días
   - OAuth credentials si hay breach
   - API keys según política del proveedor

4. **Usar diferentes secrets por ambiente**
   - Development: secrets simples (dev-secret-123)
   - Production: secrets fuertes (generados con `npx auth secret`)

5. **Documentar variables en `.env.example`**
   - Comentar propósito de cada variable
   - Incluir ejemplos de formato
   - Listar opciones válidas

### ❌ DON'T

1. **NO commitear archivos `.env.local`**
   - ❌ `.env.local` (secrets de dev)
   - ❌ `.env.production.local` (secrets de prod)
   - ✅ Solo `.env.example` y `.env.test`

2. **NO usar `NEXT_PUBLIC_` para secrets**
   ```bash
   ❌ NEXT_PUBLIC_DATABASE_PASSWORD="secret123"
   ✅ DATABASE_PASSWORD="secret123"
   ```

3. **NO hardcodear valores**
   ```typescript
   ❌ const apiKey = "abc123";
   ✅ const apiKey = env.RESEND_API_KEY;
   ```

4. **NO reusar secrets entre ambientes**
   ```bash
   ❌ Production: BETTER_AUTH_SECRET="dev-secret"
   ✅ Production: BETTER_AUTH_SECRET="[GENERATED_WITH_npx_auth_secret]"
   ```

5. **NO usar lookups dinámicos con `NEXT_PUBLIC_`**
   ```typescript
   ❌ const key = process.env[`NEXT_PUBLIC_${varName}`];
   ✅ const key = env.NEXT_PUBLIC_COMPANY_NAME;
   ```

---

## 🐛 Troubleshooting

### Problema: Variable no cargada

**Síntomas:**
```
ReferenceError: process.env.DATABASE_URL is undefined
```

**Soluciones:**
1. ✅ Verificar que variable existe en `.env.local`
2. ✅ Reiniciar dev server (`pnpm dev`)
3. ✅ Verificar que variable está en `src/env.js` → `runtimeEnv`
4. ✅ Verificar tipeo correcto (case-sensitive)

---

### Problema: `NEXT_PUBLIC_` variable no actualiza

**Síntomas:**
```typescript
// Cambié NEXT_PUBLIC_COMPANY_NAME pero sigue mostrando valor antiguo
```

**Soluciones:**
1. ✅ **Rebuild** obligatorio: `pnpm build`
2. ✅ Hard refresh en navegador (Ctrl+Shift+R)
3. ✅ Clear `.next` folder: `rm -rf .next && pnpm dev`
4. ✅ Verificar que no hay cache de Vercel

**Razón:** `NEXT_PUBLIC_*` vars son **inlined** en build time.

---

### Problema: Error de validación Zod

**Síntomas:**
```
❌ Invalid environment variables:
  DATABASE_URL: Invalid url
```

**Soluciones:**
1. ✅ Verificar formato de URL:
   ```bash
   ✅ postgresql://user:pass@host:5432/db
   ❌ user:pass@host:5432/db  # Falta protocolo
   ```
2. ✅ Verificar que variable no esté vacía
3. ✅ Verificar schema en `src/env.js` es correcto
4. ✅ Usar `SKIP_ENV_VALIDATION=1` solo para debugging (NO en producción)

---

### Problema: Variables de Vercel no funcionan

**Síntomas:**
```
App deployed pero database connection falla
```

**Soluciones:**
1. ✅ Verificar variables en Vercel Dashboard → Settings → Environment Variables
2. ✅ Verificar que variables están en ambiente correcto (Production, Preview, Development)
3. ✅ Redeploy después de cambiar variables: `vercel --prod --force`
4. ✅ Verificar logs de Vercel: https://vercel.com/[team]/glasify-lite/logs
5. ✅ Pull variables localmente para verificar: `vercel env pull`

---

### Problema: Tests fallan por variables

**Síntomas:**
```
❌ Test failed: DATABASE_URL is undefined
```

**Soluciones:**
1. ✅ Verificar que `.env.test` existe
2. ✅ Ejecutar tests con `NODE_ENV=test`: `NODE_ENV=test pnpm test`
3. ✅ NO usar `.env.local` en tests (es ignorado por diseño)
4. ✅ Agregar variable a `.env.test`

---

## 📝 Comandos Útiles

```bash
# Desarrollo
pnpm dev                              # Carga .env.local
vercel env pull .env.local            # Pull de Vercel (dev)

# Build
pnpm build                            # Valida env vars
SKIP_ENV_VALIDATION=1 pnpm build      # Skip validation (debugging)

# Vercel
vercel env add [NAME] [ENV]           # Agregar variable
vercel env ls                         # Listar variables
vercel env pull [FILE]                # Pull variables
vercel env rm [NAME] [ENV]            # Remover variable

# Testing
NODE_ENV=test pnpm test               # Tests con .env.test
pnpm test:e2e                         # E2E tests

# Database
DATABASE_URL=$DIRECT_URL pnpm db:migrate     # Aplicar migraciones
pnpm db:studio                        # Abrir Prisma Studio
pnpm seed:minimal                     # Seed mínimo (TenantConfig)

# Debugging
echo $DATABASE_URL                    # Ver variable en shell
node -e "console.log(process.env.DATABASE_URL)"  # Ver variable en Node
```

---

## 🔗 Referencias

- **Next.js Env Vars:** https://nextjs.org/docs/app/guides/environment-variables
- **Vercel Env Vars:** https://vercel.com/docs/projects/environment-variables
- **T3 Env:** https://env.t3.gg/
- **Neon Connection Strings:** https://neon.tech/docs/connect/connect-from-any-app
- **Better Auth:** https://www.better-auth.com/docs/installation

---

## ✅ Status Final

- ✅ `.env.local` actualizado (desarrollo)
- ✅ `.env.production.local.example` creado (template producción)
- ✅ `.env.test` creado (testing)
- ✅ `.gitignore` verificado (secrets protegidos)
- ✅ `src/env.js` actualizado (validación Zod)
- ✅ Documentación completa incluida

**Todo listo para deploy a producción** 🚀

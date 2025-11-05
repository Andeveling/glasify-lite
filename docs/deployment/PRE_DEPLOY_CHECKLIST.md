# ✅ Pre-Deploy Checklist - Glasify Lite MVP

**Fecha de Deploy Planeado:** _____________________  
**Responsable:** _____________________  
**Versión:** 1.0.0-mvp

---

## 📋 Antes de Deploy

### 1. Código y Repositorio

- [ ] **Branch `main` actualizado** con últimos cambios de `develop`
- [ ] **Todos los tests pasan** (`pnpm test` + `pnpm test:e2e`)
- [ ] **No hay errores de TypeScript** (`pnpm typecheck`)
- [ ] **Linter pasa** (`pnpm lint`)
- [ ] **Build local exitoso** (`pnpm build`)
- [ ] **No hay console.logs** olvidados en producción
- [ ] **No hay TODOs críticos** sin resolver
- [ ] **CHANGELOG.md actualizado** con features del MVP

### 2. Base de Datos (Neon)

- [ ] **Proyecto Neon creado** (`glasify-lite-production`)
- [ ] **DATABASE_URL obtenida** (pooled con `-pooler`)
- [ ] **DIRECT_URL obtenida** (direct sin `-pooler`)
- [ ] **Connection strings guardadas** en password manager
- [ ] **Region seleccionada** (cerca de usuarios - ej: US East o EU)
- [ ] **Auto-suspend configurado** (5min para staging, deshabilitado para producción)
- [ ] **Backups habilitados** (Neon automático diario)

### 3. Vercel

- [ ] **Proyecto importado** desde GitHub
- [ ] **Framework detectado** (Next.js)
- [ ] **Build settings correctos** (`pnpm build`, `pnpm install`)
- [ ] **Root directory** es `./`
- [ ] **Deploy only `main`** configurado en `vercel.json`

### 4. Variables de Entorno en Vercel

#### Base de Datos
- [ ] `DATABASE_URL` (pooled)
- [ ] `DIRECT_URL` (direct)

#### Autenticación
- [ ] `AUTH_SECRET` (generado con `npx auth secret`)
- [ ] `NEXTAUTH_URL` (`https://glasify-lite.vercel.app`)
- [ ] `AUTH_TRUST_HOST=true`
- [ ] `AUTH_GOOGLE_ID` (opcional - si usas Google OAuth)
- [ ] `AUTH_GOOGLE_SECRET` (opcional)

#### Configuración de Negocio (Tenant)
- [ ] `TENANT_BUSINESS_NAME`
- [ ] `TENANT_CURRENCY` (ej: `COP`)
- [ ] `TENANT_LOCALE` (ej: `es-CO`)
- [ ] `TENANT_TIMEZONE` (ej: `America/Bogota`)
- [ ] `TENANT_QUOTE_VALIDITY_DAYS` (ej: `15`)
- [ ] `TENANT_CONTACT_EMAIL` (opcional)
- [ ] `TENANT_CONTACT_PHONE` (opcional)
- [ ] `TENANT_BUSINESS_ADDRESS` (opcional)

#### Email (Opcional - Resend)
- [ ] `RESEND_API_KEY` (si usas email notifications)
- [ ] `FROM_EMAIL` (ej: `noreply@glasify-lite.vercel.app`)

#### Admin
- [ ] `ADMIN_EMAIL` (opcional - email del usuario admin)

#### Export/PDF
- [ ] `NEXT_PUBLIC_COMPANY_NAME` (opcional - para PDFs)
- [ ] `NEXT_PUBLIC_COMPANY_LOGO_URL` (opcional)
- [ ] `EXPORT_PDF_PAGE_SIZE=A4` (opcional)
- [ ] `EXPORT_MAX_ITEMS=100` (opcional)

### 5. Migraciones y Seed

- [ ] **Migraciones aplicadas** con `DATABASE_URL=$DIRECT_URL pnpm db:migrate`
- [ ] **Schema verificado** con `prisma db pull`
- [ ] **Seed mínimo ejecutado** con `pnpm seed:minimal`
- [ ] **TenantConfig verificado** en Neon SQL Editor:
  ```sql
  SELECT * FROM "TenantConfig" WHERE id = '1';
  ```

### 6. Seguridad

- [ ] **`.env` en `.gitignore`** (verificar)
- [ ] **Secrets rotados** (auth secret, API keys)
- [ ] **CORS configurado** (si aplica)
- [ ] **Rate limiting** considerado (Vercel edge config o Upstash)
- [ ] **CSP headers** configurados en `next.config.ts` (opcional)

### 7. Performance

- [ ] **Images optimizadas** (usando `next/image`)
- [ ] **Fonts optimizadas** (usando `next/font`)
- [ ] **Bundle size** verificado (`pnpm build` - debe ser <500KB First Load JS)
- [ ] **Database indexes** creados para queries frecuentes
- [ ] **Neon connection pooling** habilitado (ya incluido con `-pooler`)

### 8. Monitoring

- [ ] **Vercel Analytics** habilitado (opcional)
- [ ] **Neon Monitoring** configurado (alertas de CPU/memoria)
- [ ] **Error tracking** configurado (Sentry - opcional)
- [ ] **Uptime monitoring** (Vercel + Neon built-in)

---

## 🚀 Durante el Deploy

### 1. Deploy a Vercel

```bash
# Opción A: Desde Vercel Dashboard
# Push a main → Auto-deploy

# Opción B: Desde CLI
vercel --prod
```

- [ ] **Build exitoso** (sin errores)
- [ ] **Deployment URL** asignada (`https://glasify-lite-xxx.vercel.app`)
- [ ] **Production URL** actualizada (`https://glasify-lite.vercel.app`)

### 2. Verificar Migraciones

```bash
# Pull env vars
vercel env pull .env.production

# Verificar migraciones
DATABASE_URL=$DIRECT_URL pnpm prisma migrate status

# Si falta alguna, aplicar
DATABASE_URL=$DIRECT_URL pnpm db:migrate
```

- [ ] **Todas las migraciones aplicadas**
- [ ] **Sin pending migrations**

### 3. Verificar Seed

```bash
# Verificar TenantConfig
DATABASE_URL=$DATABASE_URL pnpm db:studio:prod
```

- [ ] **TenantConfig existe** (id: '1')
- [ ] **Datos de negocio correctos** (nombre, moneda, locale)

---

## ✅ Post-Deploy Verification

### 1. Smoke Tests

- [ ] **Homepage carga** (`https://glasify-lite.vercel.app`)
- [ ] **Sign in funciona** (`/sign-in`)
- [ ] **Dashboard carga** (`/admin` - si ADMIN_EMAIL configurado)
- [ ] **Crear cotización** (`/my-quotes`)
- [ ] **Catálogo público** (`/catalog`)
- [ ] **Carrito funciona** (agregar item, ver carrito)
- [ ] **WhatsApp button** visible (si tenant.whatsappEnabled)

### 2. Database Health

En Neon Console → SQL Editor:

```sql
-- Verificar tablas creadas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar TenantConfig
SELECT * FROM "TenantConfig" WHERE id = '1';

-- Verificar migraciones
SELECT migration_name, finished_at 
FROM _prisma_migrations 
ORDER BY finished_at DESC 
LIMIT 5;

-- Verificar usuarios (si hay seed)
SELECT COUNT(*) FROM "User";
```

- [ ] **30+ tablas** creadas
- [ ] **TenantConfig** existe
- [ ] **Últimas 5 migraciones** aplicadas
- [ ] **0 usuarios** (producción limpia)

### 3. Performance Check

En Vercel Dashboard → Deployment → **Functions**:

- [ ] **Tiempo de carga inicial** <3s
- [ ] **Time to First Byte (TTFB)** <500ms
- [ ] **Largest Contentful Paint (LCP)** <2.5s
- [ ] **First Input Delay (FID)** <100ms
- [ ] **Cumulative Layout Shift (CLS)** <0.1

En Neon Dashboard → **Monitoring**:

- [ ] **Query latency** <100ms promedio
- [ ] **Conexiones activas** <10
- [ ] **CPU usage** <50%
- [ ] **Memory usage** <200MB

### 4. Logs Check

En Vercel → **Logs** (últimos 15 minutos):

- [ ] **No errores de conexión** a DB
- [ ] **No errores 500**
- [ ] **No warnings críticos**
- [ ] **Requests exitosos** (200, 304)

### 5. SEO & Metadata

- [ ] **Favicon visible** en browser tab
- [ ] **Meta title** correcto en homepage
- [ ] **Meta description** presente
- [ ] **Open Graph tags** (si aplica)

---

## 🎯 Opcional (Mejoras Post-MVP)

### Custom Domain
- [ ] Dominio comprado (ej: `glasify.app`)
- [ ] DNS configurado en Vercel
- [ ] SSL certificado generado (automático)
- [ ] `NEXTAUTH_URL` actualizado

### Email Notifications
- [ ] Resend account creado
- [ ] Domain verificado
- [ ] Email templates creados
- [ ] Test email enviado

### Analytics
- [ ] Vercel Analytics habilitado
- [ ] Google Analytics configurado (opcional)
- [ ] Mixpanel/Amplitude (opcional)

### Error Tracking
- [ ] Sentry proyecto creado
- [ ] Sentry DSN configurado
- [ ] Source maps habilitados

---

## 🚨 Rollback Plan

Si algo falla:

### Opción 1: Revert en Vercel
```bash
vercel rollback [deployment-url]
```

### Opción 2: Rollback de Migraciones
```bash
# En Neon SQL Editor
BEGIN;
-- Ejecutar down.sql de última migración
ROLLBACK; -- o COMMIT si es correcto
```

### Opción 3: Restaurar Backup de Neon
1. Neon Console → **Backups**
2. Seleccionar backup pre-deploy
3. **Restore**

---

## 📞 Contactos de Emergencia

- **Vercel Support:** support@vercel.com
- **Neon Support:** support@neon.tech
- **Team Lead:** _____________________
- **DevOps:** _____________________

---

## ✅ Sign-Off

**Deploy Completado:**

- Fecha/Hora: _____________________
- Deploy URL: _____________________
- Deployed by: _____________________
- Verified by: _____________________
- Status: ⬜ Success  ⬜ Partial  ⬜ Failed
- Notes: _____________________

---

**¡MVP en Producción! 🎉**

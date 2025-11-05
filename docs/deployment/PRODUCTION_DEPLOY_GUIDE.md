# 🚀 Guía de Despliegue a Producción - Glasify Lite

**Stack:** Next.js 16 + Prisma + Neon (PostgreSQL) + Vercel  
**Fecha:** Noviembre 2025  
**Versión:** MVP 1.0

---

## 📋 Pre-requisitos

- [ ] Cuenta de [Vercel](https://vercel.com) (conectada a GitHub)
- [ ] Cuenta de [Neon](https://console.neon.tech) (PostgreSQL serverless)
- [ ] Repositorio en GitHub con código actualizado
- [ ] Variables de entorno configuradas localmente (`.env`)

---

## 🗄️ Paso 1: Configurar Base de Datos en Neon

### 1.1 Crear Proyecto en Neon

1. Ve a [Neon Console](https://console.neon.tech)
2. Click en **"New Project"**
3. Configura:
   - **Project name:** `glasify-lite-production`
   - **Database name:** `glasify_prod`
   - **Region:** Selecciona la más cercana a tus usuarios (ej: `US East (N. Virginia)` o `Europe (Frankfurt)`)
   - **PostgreSQL version:** 17 (latest)
4. Click **"Create Project"**

### 1.2 Obtener Connection Strings

Una vez creado el proyecto, ve a **Dashboard → Connect**:

#### ✅ **Pooled Connection** (para aplicación)
```
postgresql://[user]:[password]@ep-xxx-pooler.region.aws.neon.tech/glasify_prod?sslmode=require
```
- **Uso:** Queries desde tu aplicación (Next.js Server Components, API Routes, tRPC)
- **Beneficio:** Connection pooling automático vía PgBouncer
- **Variable:** `DATABASE_URL`

#### ✅ **Direct Connection** (para migraciones)
```
postgresql://[user]:[password]@ep-xxx.region.aws.neon.tech/glasify_prod?sslmode=require
```
- **Uso:** SOLO para migraciones de Prisma (`migrate deploy`, `db push`)
- **Beneficio:** Conexión directa sin pooler
- **Variable:** `DIRECT_URL`

> **⚠️ IMPORTANTE:** 
> - Guarda ambas connection strings en un lugar seguro (1Password, Bitwarden, etc)
> - **NUNCA** las compartas en Slack, correo o commits de Git
> - Neon rota contraseñas periódicamente - actualiza cuando sea necesario

---

## ☁️ Paso 2: Configurar Proyecto en Vercel

### 2.1 Importar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New → Project"**
3. Selecciona tu repositorio de GitHub: `Andeveling/glasify-lite`
4. Configura:
   - **Framework Preset:** Next.js (auto-detectado)
   - **Root Directory:** `./` (default)
   - **Build Command:** `pnpm build` (auto-detectado desde `vercel.json`)
   - **Install Command:** `pnpm install` (auto-detectado)

### 2.2 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes:

#### **Base de Datos (Neon)**
```env
DATABASE_URL=postgresql://[user]:[password]@ep-xxx-pooler.region.aws.neon.tech/glasify_prod?sslmode=require
DIRECT_URL=postgresql://[user]:[password]@ep-xxx.region.aws.neon.tech/glasify_prod?sslmode=require
```

#### **Autenticación (Better Auth)**
```env
AUTH_SECRET=<genera con: npx auth secret>
NEXTAUTH_URL=https://glasify-lite.vercel.app
AUTH_TRUST_HOST=true
```

#### **Google OAuth (si usas autenticación con Google)**
```env
AUTH_GOOGLE_ID=<tu-google-client-id>
AUTH_GOOGLE_SECRET=<tu-google-client-secret>
```

#### **Configuración de Negocio (Tenant)**
```env
TENANT_BUSINESS_NAME=Glasify Solutions
TENANT_CURRENCY=COP
TENANT_LOCALE=es-CO
TENANT_TIMEZONE=America/Bogota
TENANT_QUOTE_VALIDITY_DAYS=15
TENANT_CONTACT_EMAIL=contacto@glasify.com
TENANT_CONTACT_PHONE=+57 300 123 4567
TENANT_BUSINESS_ADDRESS=Calle 123 #45-67, Bogotá, Colombia
```

#### **Email (Resend - opcional)**
```env
RESEND_API_KEY=<tu-resend-api-key>
FROM_EMAIL=noreply@glasify-lite.vercel.app
```

#### **Admin User (opcional)**
```env
ADMIN_EMAIL=admin@glasify.com
```

#### **Vercel (auto-configuradas, no agregar)**
```env
# Estas ya están configuradas automáticamente por Vercel:
# NEXT_PUBLIC_VERCEL_ENV
# NEXT_PUBLIC_VERCEL_URL
# NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
```

> **💡 Tip:** Para todas las variables, selecciona los entornos:
> - ✅ Production
> - ✅ Preview (opcional, para ramas de staging)
> - ❌ Development (NO - usa tu `.env` local)

### 2.3 Deploy Inicial

1. Click **"Deploy"**
2. Vercel clonará el repo, instalará dependencias y ejecutará `pnpm build`
3. **Espera 2-5 minutos** para el primer deploy

---

## 🔄 Paso 3: Ejecutar Migraciones de Base de Datos

### 3.1 Método Recomendado: Vercel CLI

Desde tu terminal local:

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
pnpm add -g vercel

# 2. Login en Vercel
vercel login

# 3. Link al proyecto
vercel link

# 4. Pull de variables de entorno de producción
vercel env pull .env.production

# 5. Ejecutar migraciones con DIRECT_URL
DATABASE_URL=$DIRECT_URL pnpm prisma migrate deploy

# 6. Verificar schema
DATABASE_URL=$DIRECT_URL pnpm prisma db push --accept-data-loss
```

### 3.2 Alternativa: Desde Neon SQL Editor

Si prefieres ejecutar SQL directo:

1. Ve a Neon Console → **SQL Editor**
2. Copia el contenido de `prisma/migrations/[latest-migration]/migration.sql`
3. Pega y ejecuta en el editor
4. Verifica con: `SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;`

---

## 🌱 Paso 4: Seed de Datos Iniciales

### 4.1 Seed Mínimo (Configuración Base)

```bash
# Usando Vercel CLI con env de producción
DATABASE_URL=$DIRECT_URL pnpm seed:minimal
```

Esto crea:
- ✅ TenantConfig (configuración de negocio)
- ✅ Tipos de vidrio base
- ✅ Soluciones de vidrio
- ✅ Características

### 4.2 Seed Demo (Para Testing)

Si quieres datos de prueba en producción:

```bash
DATABASE_URL=$DIRECT_URL pnpm seed:demo
```

> **⚠️ NO RECOMENDADO** para producción real. Solo para staging/preview.

---

## ✅ Paso 5: Verificación Post-Deploy

### 5.1 Health Check

Visita tu app en producción y verifica:

- [ ] **Homepage carga:** `https://glasify-lite.vercel.app`
- [ ] **Login funciona:** `/sign-in`
- [ ] **Dashboard admin:** `/admin` (si tienes ADMIN_EMAIL configurado)
- [ ] **Crear cotización:** `/my-quotes`
- [ ] **Catálogo público:** `/catalog`

### 5.2 Verificar Base de Datos

En Neon Console → **Tables**:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar tenant config
SELECT * FROM "TenantConfig" WHERE id = '1';

-- Verificar migraciones aplicadas
SELECT migration_name, finished_at, rolled_back_at 
FROM _prisma_migrations 
ORDER BY finished_at DESC 
LIMIT 10;
```

### 5.3 Logs y Monitoring

En Vercel Dashboard → **Logs**:
- Verifica que no haya errores de conexión a DB
- Revisa latencia de queries (debe ser <200ms)
- Chequea uso de memoria (debe ser <512MB)

---

## 🔧 Paso 6: Configuraciones Avanzadas (Opcional)

### 6.1 Custom Domain

1. Ve a Vercel → **Settings → Domains**
2. Agrega tu dominio: `app.glasify.com`
3. Actualiza DNS según instrucciones de Vercel
4. Actualiza variables:
   ```env
   NEXTAUTH_URL=https://app.glasify.com
   FROM_EMAIL=noreply@app.glasify.com
   ```

### 6.2 Optimización de Neon

En Neon Console → **Settings → Compute**:
- **Autoscaling:** Min 0.25 vCPU → Max 2 vCPU (ajusta según tráfico)
- **Auto-suspend:** 5 minutos de inactividad (gratis para desarrollo)
- **Branching:** Crea branch para staging/preview deploys

### 6.3 Vercel Edge Config (para feature flags)

```bash
# Crear Edge Config
vercel edge-config create glasify-feature-flags

# Agregar flag
vercel edge-config update glasify-feature-flags --set enableNewUI=false
```

---

## 🚨 Troubleshooting

### Error: "Can't reach database server"

**Causa:** Neon compute está suspendido o DIRECT_URL usada para queries  
**Solución:**
```bash
# Despierta compute con query simple
DATABASE_URL=$DATABASE_URL pnpm prisma db execute --stdin <<< "SELECT 1;"
```

### Error: "Prepared statement already exists"

**Causa:** Connection pooling con PgBouncer en modo transaction  
**Solución:** Ya estás usando `-pooler` en DATABASE_URL, verifica que no uses `pgbouncer=true` en query params

### Error: "Migration failed to apply"

**Causa:** Usando DATABASE_URL (pooled) en vez de DIRECT_URL  
**Solución:**
```bash
# Siempre usa DIRECT_URL para migraciones
DATABASE_URL=$DIRECT_URL pnpm prisma migrate deploy
```

### Prisma Client out of sync

**Causa:** Schema local no coincide con producción  
**Solución:**
```bash
# Re-generar client con schema de producción
DATABASE_URL=$DIRECT_URL pnpm prisma generate
DATABASE_URL=$DIRECT_URL pnpm prisma db pull  # Pull schema desde Neon
```

---

## 📊 Monitoreo y Métricas

### Neon Monitoring

- **Dashboard → Monitoring:** CPU, memoria, IOPS, conexiones activas
- **Dashboard → Query insights:** Queries lentas, más frecuentes
- **Dashboard → Logs:** Errores de conexión, alertas

### Vercel Analytics

```bash
# Instalar Vercel Analytics
pnpm add @vercel/analytics

# En src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🔄 Workflow de Deploy Continuo

```mermaid
graph LR
    A[Push to main] --> B[Vercel Auto-Deploy]
    B --> C[Build Next.js]
    C --> D[Run Tests]
    D --> E{Tests Pass?}
    E -->|Yes| F[Deploy to Production]
    E -->|No| G[Cancel Deploy]
    F --> H[Run Migrations]
    H --> I[Invalidate Cache]
    I --> J[Live!]
```

### Configuración en `vercel.json`

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": false  // Solo main va a producción
    }
  }
}
```

---

## 📚 Referencias

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Prisma with Neon](https://www.prisma.io/docs/guides/deployment/neon)
- [Better Auth](https://www.better-auth.com/docs)

---

## ✅ Checklist Final

Antes de marcar como "Deployed to Production":

- [ ] DATABASE_URL y DIRECT_URL configurados en Vercel
- [ ] Migraciones ejecutadas con `prisma migrate deploy`
- [ ] Seed mínimo ejecutado (`seed:minimal`)
- [ ] AUTH_SECRET generado y configurado
- [ ] Google OAuth configurado (si aplica)
- [ ] TENANT_* variables configuradas
- [ ] Custom domain configurado (opcional)
- [ ] Monitoreo habilitado (Analytics, Logs)
- [ ] Health check pasado (todas las rutas funcionan)
- [ ] Backup strategy configurado en Neon
- [ ] Team notificado del deploy

---

**¡Felicidades! 🎉 Glasify Lite está en producción.**

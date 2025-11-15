# Variables de Entorno para Vercel - Glasify Lite

## 🔴 CRÍTICAS - Requeridas para el Build

Estas variables **DEBEN** estar configuradas en Vercel, de lo contrario el build fallará:

### 1. Tenant Configuration (Build-Time)

```bash
NEXT_PUBLIC_TENANT_BUSINESS_NAME="Vitro Rojas Panamá"
NEXT_PUBLIC_TENANT_CURRENCY="USD"
NEXT_PUBLIC_TENANT_LOCALE="es-PA"
NEXT_PUBLIC_TENANT_TIMEZONE="America/Panama"
NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS="15"
```

### 2. Database Connection (Supabase)

```bash
# Pooled connection for serverless (Vercel) - Port 6543
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"

# Direct connection for migrations - Port 5432
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
```

**⚠️ IMPORTANTE**: Obtén estos valores de tu Supabase Dashboard → Settings → Database → Connection String

### 3. Authentication (Better Auth)

```bash
# Generate with: npx auth secret
BETTER_AUTH_SECRET="YOUR_RANDOM_SECRET_HERE"

# Base URL - Vercel lo configurará automáticamente
BASE_URL="https://glasify-lite.vercel.app"
```

**⚠️ IMPORTANTE**: Genera un nuevo secreto con `npx auth secret` para producción

### 4. OAuth Providers (Google)

```bash
# Get from: https://console.cloud.google.com/
AUTH_GOOGLE_ID="YOUR_GOOGLE_CLIENT_ID"
AUTH_GOOGLE_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

**⚠️ IMPORTANTE**: Obtén estos valores de Google Cloud Console

### 5. Admin User

```bash
ADMIN_EMAIL="ventas@vitrorojas.com"
```

---

## 🟡 OPCIONALES - Mejoran la Funcionalidad

### Email Service (Resend)

```bash
RESEND_API_KEY=""
FROM_EMAIL="noreply@glasify-lite.vercel.app"
```

### Branding

```bash
NEXT_PUBLIC_COMPANY_NAME="Vitro Rojas"
NEXT_PUBLIC_COMPANY_LOGO_URL=""
```

### Export Configuration

```bash
EXPORT_PDF_PAGE_SIZE="A4"
EXPORT_MAX_ITEMS="100"
```

---

## 📋 Pasos para Configurar en Vercel

### Opción 1: Dashboard Web (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/andres-parras-projects-441e8949/glasify-lite
2. Click en **Settings** → **Environment Variables**
3. Para cada variable:
   - Pega el nombre (ejemplo: `NEXT_PUBLIC_TENANT_BUSINESS_NAME`)
   - Pega el valor (ejemplo: `Vitro Rojas Panamá`)
   - Selecciona entornos: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**
4. Después de agregar todas, haz un **Redeploy** desde el tab **Deployments**

### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI si no lo tienes
pnpm add -g vercel

# Login
vercel login

# Link al proyecto
vercel link

# Agregar variables (ejemplo)
vercel env add NEXT_PUBLIC_TENANT_BUSINESS_NAME
# Pega el valor cuando te lo pida: Vitro Rojas Panamá
# Selecciona: Production, Preview, Development

# Repetir para cada variable...

# Redeploy
vercel --prod
```

### Opción 3: Copiar desde .env.local

1. Abre tu archivo `.env.local` local
2. Copia cada variable **MANUALMENTE** a Vercel Dashboard
3. **NO subas** `.env.local` a Git ni uses "Import" con el archivo completo (contiene secretos)

---

## ⚠️ Seguridad y Buenas Prácticas

### Secretos que DEBES cambiar en Producción:

1. **`BETTER_AUTH_SECRET`**: Genera uno nuevo con `npx auth secret`
2. **`DATABASE_URL`**: Considera usar una base de datos separada para producción
3. **`AUTH_GOOGLE_SECRET`**: Verifica que los Authorized redirect URIs incluyan tu dominio de producción

### Variables Públicas (NEXT_PUBLIC_*)

- ⚠️ Estas variables se **incrustan en el bundle JavaScript** y son visibles en el cliente
- ✅ Es seguro exponer: nombres, locales, URLs públicas
- ❌ NUNCA expongas: API keys, secretos, tokens, credenciales

---

## 🔍 Verificación

Después de configurar y redeplegar, verifica:

1. **Build exitoso**: Check verde en Vercel Dashboard
2. **Variables cargadas**: Las variables `NEXT_PUBLIC_*` están disponibles en el cliente
3. **App funcional**: Navega a todas las páginas principales
4. **Base de datos**: Verifica que las consultas funcionen correctamente

---

## 🐛 Troubleshooting

### Error: "Invalid environment variables"

- Verifica que **todas** las variables `NEXT_PUBLIC_TENANT_*` estén configuradas
- Asegúrate de que no haya espacios extra ni comillas incorrectas
- Formato correcto: `USD` (3 caracteres), `es-PA` (locale válido)

### Error: "Can't reach database server"

- Verifica que `DATABASE_URL` esté configurada correctamente
- Confirma que el puerto 6543 (PgBouncer) esté habilitado en Supabase
- Prueba la conexión localmente con el mismo string
- En Supabase Dashboard, ve a Settings → Database → Connection Pooling

### Error: "Prerender error on /cart"

- ✅ **SOLUCIONADO**: Footer ahora usa Suspense (commit 25185f40f)
- Si persiste, verifica que `DATABASE_URL` esté en las variables de entorno

### Build se queda "Building..." por mucho tiempo

- El build puede tardar 1-2 minutos en la primera vez
- Verifica los logs en tiempo real en Vercel Dashboard
- Si tarda más de 5 minutos, cancela y verifica las variables

---

## 📚 Referencias

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Better Auth Configuration](https://better-auth.com/docs/configuration)
- [Google OAuth Setup](https://console.cloud.google.com/)

---

## 🎯 Quick Checklist

Antes de hacer push, verifica que en Vercel Dashboard tengas:

- [ ] `NEXT_PUBLIC_TENANT_BUSINESS_NAME`
- [ ] `NEXT_PUBLIC_TENANT_CURRENCY`
- [ ] `NEXT_PUBLIC_TENANT_LOCALE`
- [ ] `NEXT_PUBLIC_TENANT_TIMEZONE`
- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL` (opcional, solo para migrations)
- [ ] `BETTER_AUTH_SECRET`
- [ ] `BASE_URL`
- [ ] `AUTH_GOOGLE_ID`
- [ ] `AUTH_GOOGLE_SECRET`
- [ ] `ADMIN_EMAIL`

Todas las variables deben estar en los 3 entornos: Production, Preview, Development.

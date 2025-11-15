# Configuración de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Deploy Fallará Sin Estas Variables

El build en Vercel **fallará** si no configuras las variables de entorno requeridas.

## 📋 Variables Requeridas

### Base de Datos (Supabase PostgreSQL)

#### 1. DATABASE_URL
- **Valor**: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true`
- **Descripción**: Conexión pooled para queries (usa puerto 6543 con pgbouncer)
- **Ejemplo**: `postgresql://postgres:O5ep6fFa4OMwGuK5@db.fedbbwcyuzyqhnhiawqv.supabase.co:6543/postgres?pgbouncer=true`

#### 2. DIRECT_URL
- **Valor**: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- **Descripción**: Conexión directa para migraciones Prisma (puerto 5432)
- **Ejemplo**: `postgresql://postgres:O5ep6fFa4OMwGuK5@db.fedbbwcyuzyqhnhiawqv.supabase.co:5432/postgres`

### Autenticación (Better Auth)

#### 3. BETTER_AUTH_SECRET
- **Valor**: Genera con `npx auth secret` o string aleatorio de 32+ caracteres
- **Descripción**: Secret key para JWT y cookies de sesión
- **Ejemplo**: `G6hOx1KjZ8OMezokPR74Kh4mKJ5kSx92`

#### 4. BETTER_AUTH_URL
- **Valor**: `https://glasify-lite.vercel.app`
- **Descripción**: URL base de la aplicación (cambia según tu dominio)

### Configuración de Tenant (Vitro Rojas Panamá)

#### 5. NEXT_PUBLIC_TENANT_BUSINESS_NAME
- **Valor**: `Vitro Rojas Panamá`
- **Descripción**: Nombre del negocio

#### 6. NEXT_PUBLIC_TENANT_CURRENCY  
- **Valor**: `USD`
- **Descripción**: Código de moneda (ISO 4217, 3 letras)

#### 7. NEXT_PUBLIC_TENANT_LOCALE
- **Valor**: `es-PA`  
- **Descripción**: Locale (formato: idioma-PAÍS)

#### 8. NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS
- **Valor**: `15`
- **Descripción**: Días de validez de cotizaciones

#### 9. NEXT_PUBLIC_TENANT_TIMEZONE
- **Valor**: `America/Panama`
- **Descripción**: Zona horaria (IANA identifier)

## 🚀 Pasos en Vercel Dashboard

1. Ve a: https://vercel.com/andeveling/glasify-lite/settings/environment-variables
2. Click en "Add New" 
3. Para cada variable:
   - **Name**: Copia el nombre exacto (ej: `DATABASE_URL`)
   - **Value**: Pega el valor correspondiente
   - **Environments**: Selecciona **Production, Preview, Development**
4. Click "Save"
5. Repite para las 9 variables

## 🔐 Obtener Credenciales de Supabase

1. Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/settings/database
2. En "Connection string" → "URI" copia el string de conexión
3. Para `DATABASE_URL`: Cambia el puerto de `5432` a `6543` y agrega `?pgbouncer=true`
4. Para `DIRECT_URL`: Usa la URL con puerto `5432` sin parámetros adicionales

## ✅ Verificación

Después de agregar todas las variables:
- Vercel hará **auto-redeploy** del último commit
- El build debería completarse exitosamente
- Revisa los logs: https://vercel.com/andeveling/glasify-lite/deployments

Para verificar que todas las variables están configuradas, ejecuta localmente:
```bash
pnpm tsx scripts/check-env.ts
```

## 🔄 Cambiar Configuración de Tenant

Si necesitas cambiar el nombre del negocio, moneda, etc:
1. Edita las variables en Vercel Dashboard
2. Click "Redeploy" → Se rebuildeará la app con la nueva config

## ❓ Troubleshooting

**Error**: `Can't reach database server at db.*.supabase.co:6543`
- **Causa**: Variable `DATABASE_URL` no está configurada en Vercel o tiene formato incorrecto
- **Solución**: Verifica que agregaste `DATABASE_URL` con puerto `6543` y `?pgbouncer=true`

**Error**: `Failed to initialize Winston logger: ENOENT: no such file or directory, mkdir '/var/task/logs'`
- **Causa**: Winston intentaba crear carpeta de logs en filesystem read-only de Vercel
- **Solución**: ✅ Ya resuelto, Winston usa solo console en producción

**Error**: `ZodError: Required at "NEXT_PUBLIC_TENANT_BUSINESS_NAME"`
- **Solución**: Falta agregar esa variable en Vercel

**Cambié una variable pero no se refleja**
- **Solución**: Necesitas hacer re-deploy manual en Vercel Dashboard

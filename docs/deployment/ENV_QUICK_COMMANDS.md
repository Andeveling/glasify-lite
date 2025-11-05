# Variables de Entorno - Comandos Rápidos

**Referencia rápida de comandos para gestionar variables de entorno**

---

## 📦 Desarrollo Local

```bash
# Crear .env.local desde template
cp .env.example .env.local

# Editar variables locales
code .env.local

# Iniciar dev server (carga .env.local automáticamente)
pnpm dev

# Verificar que variables se cargan
pnpm dev | grep "DATABASE_URL"
```

---

## 🧪 Testing

```bash
# Ejecutar tests (carga .env.test automáticamente)
NODE_ENV=test pnpm test

# Ejecutar E2E tests
pnpm test:e2e

# Verificar variables de test
cat .env.test
```

---

## 🚀 Deploy a Vercel

### Setup Inicial (Una sola vez)

```bash
# 1. Generar auth secret para producción
npx auth secret
# Copiar output a Vercel Dashboard

# 2. Listar variables actuales en Vercel
vercel env ls

# 3. Agregar variable individual
vercel env add DATABASE_URL production

# 4. Pull todas las variables de Vercel
vercel env pull .env.production.local
```

### Deploy

```bash
# Deploy a Preview (staging)
vercel

# Deploy a Production
vercel --prod

# Force deploy (skip cache)
vercel --prod --force
```

### Post-Deploy (Primera vez)

```bash
# 1. Pull env vars de producción
vercel env pull .env.production.local

# 2. Aplicar migraciones (USAR DIRECT_URL)
DATABASE_URL=$DIRECT_URL pnpm db:migrate

# 3. Ejecutar seed
pnpm seed:minimal

# 4. Verificar logs
vercel logs https://glasify-lite.vercel.app
```

---

## 🗄️ Database

```bash
# Aplicar migraciones (local)
pnpm db:migrate

# Aplicar migraciones (producción - usar DIRECT_URL)
DATABASE_URL=$DIRECT_URL pnpm db:migrate

# Abrir Prisma Studio (local)
pnpm db:studio

# Abrir Prisma Studio (producción)
DATABASE_URL=$DATABASE_URL pnpm db:studio:prod

# Seed TenantConfig
pnpm seed:minimal

# Reset database (⚠️ BORRA TODO)
pnpm db:reset
```

---

## 🔍 Debugging

```bash
# Ver variable específica (shell)
echo $DATABASE_URL

# Ver variable en Node.js
node -e "console.log(process.env.DATABASE_URL)"

# Ver todas las variables cargadas
node -e "console.log(process.env)" | grep "DATABASE"

# Verificar schema de env.js
cat src/env.js

# Build sin validación (debugging - NO usar en producción)
SKIP_ENV_VALIDATION=1 pnpm build

# Ver variables en runtime (dev)
# Agregar en src/app/page.tsx:
# console.log("DB URL:", process.env.DATABASE_URL); // Server
# console.log("Company:", env.NEXT_PUBLIC_COMPANY_NAME); // Client
```

---

## 🛠️ Vercel CLI - Gestión de Variables

### Listar Variables

```bash
# Todas las variables
vercel env ls

# Solo producción
vercel env ls production

# Solo development
vercel env ls development

# Solo preview
vercel env ls preview
```

### Agregar Variables

```bash
# Agregar a producción
vercel env add DATABASE_URL production

# Agregar a todos los ambientes
vercel env add NEXT_PUBLIC_COMPANY_NAME production preview development

# Agregar desde stdin
echo "secret-value" | vercel env add MY_SECRET production --stdin
```

### Remover Variables

```bash
# Remover de producción
vercel env rm DATABASE_URL production

# Remover de todos los ambientes
vercel env rm TEMP_VAR production preview development
```

### Pull Variables

```bash
# Pull de producción
vercel env pull .env.production.local

# Pull de development
vercel env pull .env.development.local

# Pull de preview
vercel env pull .env.preview.local
```

---

## 🔐 Generar Secrets

```bash
# Better Auth Secret (32+ caracteres aleatorios)
npx auth secret

# Alternativa con OpenSSL
openssl rand -base64 32

# Alternativa con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📋 Validación

### Verificar Archivos en Git

```bash
# Archivos que NO deben estar en git (debe estar vacío)
git ls-files | grep -E '\.env\.(local|development\.local|production\.local)$'

# Archivos que SÍ deben estar en git (deben aparecer)
git ls-files | grep -E '\.env\.(example|test|production\.local\.example)$'

# Verificar .gitignore
cat .gitignore | grep "\.env"
```

### Verificar Build

```bash
# Build local
pnpm build

# Build y verificar tamaño
pnpm build && du -sh .next

# Build con análisis de bundle
ANALYZE=true pnpm build
```

### Verificar Variables en Runtime

```bash
# Development
pnpm dev
# Ir a: http://localhost:3000
# Abrir DevTools → Console
# Ejecutar: console.log(process.env)  // Solo NEXT_PUBLIC_* visibles

# Production
vercel --prod
# Ir a deployment URL
# Verificar en Vercel Logs que variables se cargan
```

---

## 🧹 Limpieza

```bash
# Limpiar .next folder
rm -rf .next

# Limpiar node_modules
rm -rf node_modules && pnpm install

# Limpiar cache de Vercel
vercel --prod --force

# Limpiar variables locales (⚠️ Cuidado)
rm .env.local .env.production.local .env.development.local
```

---

## 📊 Monitoreo en Producción

```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de deployment específico
vercel logs [DEPLOYMENT_URL]

# Ver logs de producción (últimos 100)
vercel logs https://glasify-lite.vercel.app --limit 100

# Filtrar logs por tipo
vercel logs --filter "error"
vercel logs --filter "warn"
```

---

## 🔄 Workflow Completo de Deploy

```bash
# 1. Verificar cambios locales
git status
pnpm typecheck
pnpm lint
pnpm build

# 2. Commit y push
git add .
git commit -m "feat: add feature X"
git push origin main

# 3. Verificar variables en Vercel
vercel env ls production

# 4. Deploy (auto-deploy desde GitHub o manual)
vercel --prod

# 5. Aplicar migraciones (solo si hay cambios en schema)
vercel env pull .env.production.local
DATABASE_URL=$DIRECT_URL pnpm db:migrate

# 6. Verificar deployment
open https://glasify-lite.vercel.app
vercel logs --follow

# 7. Smoke tests
# - Homepage carga
# - Login funciona
# - Dashboard accesible (si admin)
# - No errores en console
# - No errores en Vercel logs
```

---

## 🆘 Troubleshooting Rápido

### Variable no cargada

```bash
# 1. Verificar archivo existe
ls -la .env.local

# 2. Reiniciar dev server
pnpm dev

# 3. Verificar variable en archivo
cat .env.local | grep DATABASE_URL

# 4. Verificar en src/env.js
cat src/env.js | grep DATABASE_URL
```

### Build falla por variables

```bash
# 1. Ver error completo
pnpm build

# 2. Verificar schema en src/env.js
code src/env.js

# 3. Skip validación temporalmente (debugging)
SKIP_ENV_VALIDATION=1 pnpm build

# 4. Agregar variable faltante
echo 'MISSING_VAR="value"' >> .env.local
```

### NEXT_PUBLIC_ no actualiza

```bash
# 1. Rebuild completo
rm -rf .next && pnpm build

# 2. Hard refresh en navegador
# Ctrl+Shift+R (Chrome/Firefox)
# Cmd+Shift+R (macOS)

# 3. Verificar valor en bundle
pnpm build
cat .next/static/**/*.js | grep "NEXT_PUBLIC_COMPANY_NAME"
```

### Vercel deployment falla

```bash
# 1. Ver logs de build
vercel logs [DEPLOYMENT_URL]

# 2. Verificar variables en Vercel
vercel env ls production

# 3. Redeploy con force
vercel --prod --force

# 4. Verificar en local con env de prod
vercel env pull .env.production.local
pnpm build
```

---

## 📚 Recursos

- **Guía Completa:** `docs/deployment/ENVIRONMENT_VARIABLES_GUIDE.md`
- **Deploy Guide:** `docs/deployment/PRODUCTION_DEPLOY_GUIDE.md`
- **Pre-Deploy Checklist:** `docs/deployment/PRE_DEPLOY_CHECKLIST.md`
- **Next.js Docs:** https://nextjs.org/docs/app/guides/environment-variables
- **Vercel Docs:** https://vercel.com/docs/projects/environment-variables

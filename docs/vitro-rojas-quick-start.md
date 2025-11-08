# 🎯 Vitro Rojas - Guía Rápida de Configuración

**Última actualización**: 8 de noviembre de 2025  
**Status**: ✅ Listo para producción  
**Tenant**: Vitro Rojas S.A. (Panamá)

---

## 🚀 Resumen de 60 segundos

Vitro Rojas está listo para producción. Solo necesitas **seguir estos 3 pasos**:

### 1️⃣ Verificar variables locales
```bash
# En tu máquina local
cat .env.local | grep -E "^[A-Z_]+" | wc -l
# Debe mostrar: 23 (número de variables)
```

### 2️⃣ Configurar en Vercel Dashboard
```
URL: https://vercel.com/dashboard
Proyecto: glasify-lite
Settings → Environment Variables
(Agregar todas las variables de la tabla abajo)
```

### 3️⃣ Deploy
```
Deployments → Redeploy
Esperar ~2 min
Verificar que compila exitosamente
```

---

## 📊 Tabla de Variables (Copiar/Pegar)

### ⚠️ Críticas (OBLIGATORIAS)

```
BETTER_AUTH_SECRET          | (genera con: npx auth secret)
AUTH_GOOGLE_ID              | 861994717735-6cs1t4eemlv54t5cjkst6ipih2oibmpc.apps.googleusercontent.com
AUTH_GOOGLE_SECRET          | (tu secret de Google Console)
DATABASE_URL                | postgresql://....-pooler....
DIRECT_URL                  | postgresql://.... (sin -pooler)
PRISMA_CONNECTION_LIMIT     | 1
BASE_URL                    | https://glasify-lite.vercel.app
ADMIN_EMAIL                 | ventas@vitrorojas.com
```

### 📋 Tenant (Vitro Rojas)

```
TENANT_BUSINESS_NAME        | Vitro Rojas S.A.
TENANT_CURRENCY             | USD
TENANT_LOCALE               | es-PA
TENANT_TIMEZONE             | America/Panama
TENANT_QUOTE_VALIDITY_DAYS  | 15
TENANT_CONTACT_EMAIL        | ventas@vitrorojas.com
TENANT_CONTACT_PHONE        | +507 6123-4567
TENANT_BUSINESS_ADDRESS     | Panamá, Panamá
```

### 🎨 Branding (Público)

```
NEXT_PUBLIC_COMPANY_NAME    | Vitro Rojas
NEXT_PUBLIC_COMPANY_LOGO_URL | /logo.png
```

---

## ✅ Checklist Pre-Deploy

- [ ] `.env.local` tiene 23 variables
- [ ] `pnpm typecheck` pasa sin errores ✅
- [ ] Ningún secreto en git (`git log -p --all -- .env` debe estar vacío)
- [ ] Variables configuradas en Vercel Dashboard
- [ ] Build en Vercel completó exitosamente
- [ ] App funciona: https://glasify-lite.vercel.app
- [ ] Logo muestra en header
- [ ] Admin email puede entrar a /admin
- [ ] Google OAuth funciona

---

## 🔍 Verifying

Después de deploy, ejecuta en DevTools console:

```javascript
// Debe mostrar "Vitro Rojas"
console.log(process.env.NEXT_PUBLIC_COMPANY_NAME);

// Debe mostrar "/logo.png"
console.log(process.env.NEXT_PUBLIC_COMPANY_LOGO_URL);
```

---

## 📁 Archivos de Referencia

| Archivo                                           | Propósito                      |
| ------------------------------------------------- | ------------------------------ |
| `.env.local`                                      | Desarrollo local (gitignored)  |
| `.env.test`                                       | Testing (en git, sin secretos) |
| `.env.example`                                    | Template general (en git)      |
| `.env.vitro-rojas-production.example`             | Template producción (en git)   |
| `src/env.ts`                                      | Validación TypeScript con Zod  |
| `docs/vitro-rojas-deployment-checklist.md`        | Checklist completo             |
| `docs/vercel-environment-variables-copy-paste.md` | Guía copy/paste                |

---

## 🆘 Si Falla

### Build error: "Module has no exported member"
```bash
pnpm install
pnpm postinstall  # Regenera Prisma Client
pnpm build
```

### "BETTER_AUTH_SECRET is not set"
→ Falta en Vercel Settings, agrégala

### "Too many connections"
→ Aumenta `PRISMA_CONNECTION_LIMIT` en Vercel

### Database timeout
→ Verifica `DATABASE_URL` es pooled, `DIRECT_URL` es directa

---

## 📚 Recursos

- [Vercel Env Vars](https://vercel.com/docs/environment-variables)
- [Next.js Env Vars](https://nextjs.org/docs/app/guides/environment-variables)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)

---

## 👤 Información de Tenant

| Campo        | Valor                      |
| ------------ | -------------------------- |
| **Empresa**  | Vitro Rojas S.A.           |
| **País**     | Panamá 🇵🇦                   |
| **Moneda**   | USD (Dólar estadounidense) |
| **Idioma**   | Español (es-PA)            |
| **Timezone** | America/Panama (UTC-5)     |
| **Email**    | ventas@vitrorojas.com      |
| **Teléfono** | +507 6123-4567             |

---

**Creado**: 8 de noviembre de 2025  
**Proyecto**: Glasify Lite  
**Ready**: ✅ Listo para producción

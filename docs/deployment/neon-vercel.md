---
post_title: "Despliegue: Neon (PostgreSQL) + Vercel (Next.js 15)"
author1: "Andrés"
post_slug: "deployment-neon-vercel"
microsoft_alias: "n/a"
featured_image: "/docs/images/deployment-cover.png"
categories: ["deployment", "nextjs", "prisma", "postgresql"]
tags: ["neon", "vercel", "prisma", "nextjs", "postgresql"]
ai_note: "Document generated with AI assistance and manually reviewed"
summary: "Guía paso a paso para desplegar la base de datos en Neon con Prisma y la aplicación en Vercel, incluyendo migraciones, seeds, variables de entorno y solución de problemas."
post_date: "2025-11-07"
---

## Objetivo

Configurar una base de datos PostgreSQL administrada en Neon y desplegar la app Next.js 16 en Vercel usando Prisma 6.17.0. Incluye migraciones, seeds y variables de entorno.

## Requisitos

- Cuenta en Neon (plan Free es suficiente)
- Cuenta en Vercel (con proyecto importado desde GitHub)
- Node.js 20.x (Vercel usa 20 por defecto; local usa lo definido en el repo)
- Prisma 6.17.0 (ya en el proyecto)

## Variables de entorno requeridas

Desde `src/env.js` y Prisma, la app requiere:

- `DATABASE_URL` (PostgreSQL connection string)
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_SECRET` (obligatoria en producción)
- `NODE_ENV`
- (Opcionales) `ADMIN_EMAIL`

Ejemplo de `DATABASE_URL` para Neon (con pooled connection):

```
postgresql://<user>:<password>@<host>/<database>?sslmode=require&pgbouncer=true&connect_timeout=10
```

Neon recomienda usar PgBouncer + `sslmode=require` en producción.

## Paso 1: Crear base de datos en Neon

1. Crea una cuenta en Neon y un nuevo proyecto PostgreSQL
2. Copia la cadena de conexión (Connection string)
3. Activa el pooler (PgBouncer) y modo `transaction` si es posible
4. Guarda usuario, contraseña, host y base de datos

Referencias oficiales: https://neon.tech/docs/guides/prisma

## Paso 2: Configurar Prisma con Neon

El proyecto ya usa `prisma.config.ts` para cargar `.env` y define el comando de seed:

```
// prisma.config.ts
export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed-cli.ts --preset=minimal',
  },
});
```

Asegúrate de tener `.env` local con `DATABASE_URL` apuntando a Neon (o a una DB local si prefieres desarrollar offline).

## Paso 3: Ejecutar migraciones y seed (local o CI)

- Generar cliente Prisma y compilar app:

```bash
pnpm install
pnpm db:migrate  # prisma migrate deploy (usa migraciones existentes)
pnpm seed:minimal
```

Notas:
- `db:migrate` ejecuta `prisma migrate deploy` para aplicar migraciones generadas previamente
- `seed:minimal` corre `tsx prisma/seed-cli.ts --preset=minimal`
- Para ambientes vacíos, puedes usar `pnpm db:push` solo en desarrollo (no recomendado en prod)

## Paso 4: Configurar proyecto en Vercel

1. Importa el repo en Vercel y selecciona el framework Next.js
2. En Project Settings → Environment Variables, agrega:
   - `DATABASE_URL`: cadena de conexión de Neon (con `sslmode=require` y `pgbouncer=true`)
   - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`
   - `NODE_ENV=production`
3. Build Command (por defecto): `prisma generate && next build`
4. Output: Next.js 15 detectado automáticamente

## Paso 5: Migraciones en Vercel (Production)

Para ejecutar migraciones en producción al desplegar:

- Opción A (recomendada): Workflow manual o GitHub Action
  - Crea un GitHub Action que ejecute `pnpm db:migrate` contra la misma `DATABASE_URL` de producción
  - Corre antes o inmediatamente después del deploy

- Opción B: Vercel Post-Deployment Hook
  - Usa un cron/Serverless Function protegida que corra `prisma migrate deploy`

Ejemplo GitHub Action (resumen):

```yaml
name: Migrate Prod
on:
  workflow_dispatch:
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Paso 6: Seeds en producción (opcional)

Usa seeds con cuidado en prod. El proyecto soporta presets:

```bash
pnpm seed:minimal  # Datos mínimos
pnpm seed:demo     # Datos demo
pnpm seed:full     # Catálogo completo
```

Ejecuta de forma controlada (por ejemplo, solo una vez tras crear la base de datos).

## Paso 7: Verificar la app en Vercel

- Revisa logs de Vercel
- Accede a `/api/health` (si existe) o a la página principal
- Revisa que la autenticación funcione (Google OAuth)

## Seguridad y buenas prácticas

- Nunca expongas el `AUTH_SECRET`
- Usa `sslmode=require` en `DATABASE_URL`
- Habilita roles mínimos en Neon (principio de menor privilegio)
- Configura backups y branch protection en Neon
- Considera una rama de base de datos dedicada para staging (Neon branches)

## Troubleshooting

- Error TLS/SSL: agrega `sslmode=require` a `DATABASE_URL`
- Timeouts: agrega `pgbouncer=true&connect_timeout=10`
- Migraciones no aplican: asegúrate de usar `prisma migrate deploy` (no `db push`) y que `DATABASE_URL` apunte a la base correcta
- 500 en producción: revisa variables de entorno en Vercel (faltantes o mal escritas)

## Anexos

- Prisma: https://www.prisma.io/docs/orm
- Neon + Prisma: https://neon.tech/docs/guides/prisma
- Vercel + Next.js: https://vercel.com/docs/frameworks/nextjs

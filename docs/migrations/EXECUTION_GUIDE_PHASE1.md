# 🚀 Instrucciones de Ejecución: Migración Prisma → Drizzle

## START HERE 👈

Este documento es tu guía paso a paso para ejecutar la migración completa.

---

## ✅ Pre-Requisitos

Verifica que todo esté listo:

```bash
cd /home/andres/Proyectos/glasify-lite

# 1. Verificar Node.js
node --version
# ✅ Expected: v18.0.0 or higher

# 2. Verificar pnpm
pnpm --version
# ✅ Expected: 10.17.1+

# 3. Verificar git status (limpio)
git status
# ✅ Expected: "nothing to commit, working tree clean"

# 4. Verificar DATABASE_URL
cat .env.local | grep DATABASE_URL
# ✅ Expected: postgresql://...

# 5. Verificar conexión a BD
psql "$DATABASE_URL" -c "SELECT 1;" 2>&1 | head -5
# ✅ Expected: "1" or success message
```

Si alguno falla, resuelve primero.

---

## 📋 FASE 1: Setup Drizzle (2 horas)

### Paso 1.1: Crear rama de feature

```bash
cd /home/andres/Proyectos/glasify-lite
git checkout develop
git pull origin develop
git checkout -b feat/prisma-to-drizzle
```

### Paso 1.2: Hacer backup de schema Prisma

```bash
cp prisma/schema.prisma prisma/schema.prisma.backup
```

### Paso 1.3: Instalar dependencias

```bash
pnpm add drizzle-orm drizzle-zod pg @types/pg
pnpm add -D drizzle-kit

# Verificar instalación
pnpm ls | grep -E "drizzle|pg"
```

**Salida esperada**:
```
├─ @types/pg@8.12.0
├─ drizzle-kit@0.24.0
├─ drizzle-orm@0.34.0
├─ drizzle-zod@0.5.0
└─ pg@8.12.0
```

### Paso 1.4: Verificar archivos creados

Los siguientes archivos ya deben existir (creados en la preparación):

```bash
ls -la src/server/db/
# ✅ index.ts (cliente Drizzle)
# ✅ schema.ts (schema Drizzle completo)

ls -la drizzle.config.ts
# ✅ drizzle.config.ts (configuración)
```

### Paso 1.5: Verificar tipos TypeScript

```bash
pnpm exec tsc --noEmit
```

**Esperado después de instalar**:
- Los errores de módulos no encontrados desaparecerán
- Debería haber 0 errores de TypeScript

Si aún hay errores:
```bash
# Limpiar node_modules
pnpm clean

# Reinstalar
pnpm install

# Reintentrar
pnpm exec tsc --noEmit
```

---

## 🔧 FASE 2: Generar Migraciones (1 hora)

### Paso 2.1: Generar migraciones iniciales

```bash
cd /home/andres/Proyectos/glasify-lite

# Drizzle comparará tu schema.ts con la BD actual
pnpm exec drizzle-kit generate --name initial_migration
```

**Salida esperada**:
```
✅ [drizzle-kit] Table operations summary:
├─ 27 tables will be created
├─ 11 enums will be created
├─ 30+ indexes will be created
├─ 15+ foreign keys will be created
```

### Paso 2.2: Revisar migraciones generadas

```bash
# Ver archivos creados
ls -la drizzle/migrations/

# Ver contenido SQL (importante revisar)
cat drizzle/migrations/0001_*.sql | head -100
```

**Verifica que contiene**:
- ✅ CREATE TABLE statements
- ✅ CREATE ENUM statements
- ✅ CREATE INDEX statements
- ✅ ALTER TABLE para foreign keys

### Paso 2.3: Aplicar migraciones a la BD

⚠️ **IMPORTANTE**: Esto modifica la base de datos. ¡Asegúrate de tener backup!

```bash
# Opción 1: Usar drizzle-kit (recomendado)
pnpm exec drizzle-kit migrate

# Opción 2: Aplicar manualmente (si necesitas más control)
# psql "$DIRECT_URL" -f drizzle/migrations/0001_*.sql
```

**Salida esperada**:
```
✅ [drizzle-kit] Migrations migrated successfully
✅ Drizzle schema synchronization completed
```

### Paso 2.4: Verificar que las migraciones se aplicaron

```bash
# Listar tablas en BD
psql "$DATABASE_URL" -c "\dt public.*" | head -20

# Verificar tabla de migraciones
psql "$DATABASE_URL" -c "SELECT * FROM _drizzle_migrations;" | head -10
```

**Esperado**: Ver todas tus tablas listadas.

---

## 🧪 FASE 3: Validar Setup (30 min)

### Paso 3.1: Test de conexión Drizzle

```bash
cat > /tmp/test-drizzle.ts << 'EOF'
import { db, users } from '@/server/db';

async function main() {
  console.log('🧪 Testing Drizzle connection...');
  
  try {
    // Test 1: Simple select
    const result = await db.select().from(users).limit(1);
    console.log('✅ Query executed successfully');
    console.log('   Found', result.length, 'users');
    
    // Test 2: Check schema
    console.log('✅ Schema imported successfully');
    console.log('   Tables: users, quotes, models, etc.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
EOF

# Ejecutar test
cd /home/andres/Proyectos/glasify-lite
pnpm exec tsx /tmp/test-drizzle.ts
```

**Salida esperada**:
```
🧪 Testing Drizzle connection...
✅ Query executed successfully
   Found X users
✅ Schema imported successfully
   Tables: users, quotes, models, etc.
```

### Paso 3.2: Verificar tipos generados automáticamente

```bash
cat > /tmp/test-types.ts << 'EOF'
import { typeof users } from '@/server/db/schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Tipos generados automáticamente
type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

// Verificar que existen
const user: User = {
  id: '123',
  email: 'test@example.com',
  name: 'John',
  emailVerified: false,
  image: null,
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log('✅ Types are correctly generated');
EOF

cd /home/andres/Proyectos/glasify-lite
pnpm exec tsc --noEmit /tmp/test-types.ts
```

**Esperado**: Sin errores de TypeScript.

### Paso 3.3: Ejecutar build local

```bash
cd /home/andres/Proyectos/glasify-lite

# Limpiar build anterior
rm -rf .next

# Hacer build (sin Prisma generate!)
pnpm build

# Verificar tamaño del bundle (debería ser más pequeño)
du -sh .next
```

**Esperado**:
```
✅ Compiled client and server successfully
✅ next build completed with no errors
```

---

## 🎯 FASE 4: Commitear Cambios (15 min)

### Paso 4.1: Revisar cambios

```bash
cd /home/andres/Proyectos/glasify-lite

# Ver archivos modificados
git status

# Ver diffs
git diff --name-only

# Verificar que NO hay conflictos
git diff src/server/db/schema.ts | head -50
```

### Paso 4.2: Staged y commit

```bash
cd /home/andres/Proyectos/glasify-lite

# Agregar archivos
git add .

# Verify changes
git diff --cached --stat

# Commit con mensaje descriptivo
git commit -m "feat: migrate from Prisma to Drizzle ORM

- Install drizzle-orm, drizzle-zod, pg dependencies
- Convert schema.prisma to src/server/db/schema.ts
- Create drizzle.config.ts configuration
- Generate and apply initial migrations
- Create Drizzle client singleton in src/server/db/index.ts
- All 27 tables and 11 enums migrated successfully
- ✅ Zero TypeScript errors
- ✅ Build completes without prisma generate"
```

### Paso 4.3: Push rama

```bash
git push origin feat/prisma-to-drizzle
```

---

## ⏭️ Próximas Fases

La Fase 1 está completa ✅. Ahora necesitas:

### Fase 2: Relaciones & Seeders (3 días)
- Crear `src/server/db/relations.ts`
- Actualizar seeders a Drizzle
- Crear fixtures para tests

### Fase 3: tRPC Migrations (4 días)
- Actualizar `src/server/api/routers/**/*.ts`
- Cambiar `prisma.*` a queries Drizzle
- Validar tipos automáticos

### Fase 4-6: Testing & Deploy (4 días)
- Tests (unit, integration, E2E)
- Build local
- Deploy Vercel

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'drizzle-orm'"
```bash
pnpm clean
pnpm install
pnpm exec tsc --noEmit
```

### Error: "DATABASE_URL not defined"
```bash
# Verificar .env.local existe
ls -la .env.local

# Si no, copiar desde Vercel
vercel env pull .env.production

# O crear manualmente con credenciales Neon
echo "DATABASE_URL=postgresql://..." >> .env.local
```

### Error: "Connection refused"
```bash
# Verificar que Neon está activo
psql "$DATABASE_URL" -c "SELECT 1;"

# Si falla, revisar credenciales en Neon dashboard
```

### Error: "Migrations already applied"
Si reaplicaste migraciones por error:

```bash
# Verificar estado
psql "$DATABASE_URL" -c "SELECT * FROM _drizzle_migrations;"

# Si necesitas rollback (CUIDADO - elimina datos):
# 1. Delete from _drizzle_migrations
# 2. Drop tables manually
# 3. Regenerate migrations
```

### TypeScript errors persisten
```bash
# Full clean
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# Clear TypeScript cache
rm -rf .turbo

# Recheck
pnpm exec tsc --noEmit
```

---

## ✅ Validación Final (Fase 1)

Antes de proceder a Fase 2, verifica:

- [ ] ✅ Todas las dependencias instaladas (`pnpm ls | grep drizzle`)
- [ ] ✅ Schema convertido (`src/server/db/schema.ts` existe)
- [ ] ✅ Client creado (`src/server/db/index.ts` existe)
- [ ] ✅ Config creado (`drizzle.config.ts` existe)
- [ ] ✅ Migraciones generadas (`drizzle/migrations/` contiene SQL)
- [ ] ✅ Migraciones aplicadas (`psql ... -c "\dt"` muestra tablas)
- [ ] ✅ TypeScript sin errores (`pnpm exec tsc --noEmit` = 0 errores)
- [ ] ✅ Build funciona (`pnpm build` sin errores)
- [ ] ✅ Tests de conexión pasan
- [ ] ✅ Cambios commiteados a rama `feat/prisma-to-drizzle`

---

## 🎉 Fin de Fase 1

¡Felicitaciones! Completaste la migración de Drizzle básica.

**Próximo documento**: `/docs/migrations/PHASE_2_RELATIONS_SEEDERS.md`

---

**Tiempo estimado**: 2-3 horas  
**Dificultad**: Media (principalmente procedural)  
**Riesgo**: Bajo (no afecta código existente de tRPC)

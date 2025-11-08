# Instrucciones Fase 1: Setup Drizzle & Schema Conversion

## 📋 Paso 1: Instalar Dependencias

```bash
cd /home/andres/Proyectos/glasify-lite

# Instalar Drizzle y dependencias relacionadas
pnpm add drizzle-orm drizzle-zod pg @types/pg

# Instalar dev dependencies
pnpm add -D drizzle-kit

# Verificar instalación
pnpm ls | grep drizzle
```

**Salida esperada**:
```
├─ drizzle-kit@0.24.0
├─ drizzle-orm@0.34.0
├─ drizzle-zod@0.5.0
├─ pg@8.12.0
└─ @types/pg@8.12.0
```

---

## 🔧 Paso 2: Configurar Drizzle

### Crear archivo de configuración

**Archivo**: `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL,
  },
  migrations: {
    prefix: 'timestamp',
    table: '_drizzle_migrations',
    schema: 'public',
  },
  verbose: true,
  strict: true,
});
```

### Actualizar variables de entorno

Asegúrate de que `.env.local` o `.env.production` contenga:

```bash
# Existing from Prisma
DATABASE_URL=postgresql://user:password@host:port/dbname?schema=public
DIRECT_URL=postgresql://user:password@host:port/dbname
```

Drizzle usará las mismas variables que Prisma.

---

## 📝 Paso 3: Schema Drizzle (YA CREADO)

El archivo `/src/server/db/schema.ts` fue creado en el paso anterior con:

- ✅ 11 enums (ModelStatus, QuoteStatus, UserRole, etc.)
- ✅ 27 tablas (Account, User, Model, GlassType, Quote, etc.)
- ✅ Todas las relaciones foreign key
- ✅ Todos los índices optimizados
- ✅ Tipos Decimal precisos para pricing

**Verificación**:
```bash
cd /home/andres/Proyectos/glasify-lite
pnpm exec tsc --noEmit src/server/db/schema.ts 2>&1 | head -20
```

---

## 🗄️ Paso 4: Crear Migraciones Iniciales

Drizzle generará automáticamente las migraciones SQL basadas en la diferencia entre:
- **Schema Drizzle** (nuevo): `src/server/db/schema.ts`
- **Base de datos actual**: (existente con Prisma)

```bash
cd /home/andres/Proyectos/glasify-lite

# Generar migraciones (no las aplica, solo las crea)
pnpm exec drizzle-kit generate --name initial_schema

# Verificar migraciones creadas
ls -la drizzle/migrations/
```

**Salida esperada**:
```
drizzle/migrations/
├── 0001_initial_schema.sql (contendrá comentarios sobre cambios)
└── _meta/
    └── 0001_initial_schema.json
```

---

## ⚡ Paso 5: Crear Cliente Drizzle

**Archivo**: `src/server/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof drizzle> | undefined;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
});

const db =
  global.db ||
  drizzle(pool, {
    schema,
  });

if (process.env.NODE_ENV !== 'production') global.db = db;

export { db };
export * from './schema';
```

---

## ✅ Paso 6: Scripts en package.json

Actualizar los scripts existentes:

```json
{
  "scripts": {
    "build": "next build",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:drop": "drizzle-kit drop",
    "db:generate": "drizzle-kit generate --name",
    "db:studio": "drizzle-kit studio",
    "seed": "tsx prisma/seed-cli.ts",
    "vercel:migrate": "drizzle-kit migrate"
  }
}
```

---

## 🧪 Paso 7: Verificar Schema

### Ejecutar TypeScript check
```bash
pnpm exec tsc --noEmit
```

**✅ Éxito** = 0 errores

### Validar conexión
```bash
cat > /tmp/test-drizzle.ts << 'EOF'
import { db } from '@/server/db';
import { users } from '@/server/db/schema';

async function main() {
  try {
    const result = await db.select().from(users).limit(1);
    console.log('✅ Conexión exitosa');
    console.log('Primeros usuarios:', result);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
EOF

tsx /tmp/test-drizzle.ts
```

---

## 📊 Comparación Prisma vs Drizzle

| Aspecto | Prisma | Drizzle |
|---------|--------|---------|
| **Schema** | `.prisma` (DSL) | `.ts` (TypeScript) |
| **Tipos** | Generados (`@prisma/client`) | Inferidos automáticamente |
| **Migraciones** | Auto-generadas + commit | SQL explícito + control |
| **Build time** | Genera código en cada build | Sin generación |
| **IntelliSense** | Bueno | Excelente (tipos nativos TS) |
| **Edge compatible** | ❌ No (genera archivos) | ✅ Sí |
| **Debugging** | SQL abstraído | SQL explícito |

---

## 🚨 Checklist Pre-Ejecución

- [ ] Branch `feat/prisma-to-drizzle` creada
- [ ] Git status clean (sin cambios pendientes)
- [ ] Backup de base de datos realizado
- [ ] `.env.local` con `DATABASE_URL` y `DIRECT_URL`
- [ ] Node.js 18+ instalado (`node --version`)
- [ ] pnpm actualizado (`pnpm --version`)

---

## ⏭️ Próximos Pasos

Una vez completada esta fase:

1. **Fase 2**: Crear relaciones Drizzle (`relations.ts`)
2. **Fase 3**: Migrar servicios tRPC (queries/mutations)
3. **Fase 4**: Actualizar seeders
4. **Fase 5**: Tests & QA
5. **Fase 6**: Deploy

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'drizzle-orm'"
```bash
pnpm install
pnpm exec tsc --noEmit
```

### Error: "DATABASE_URL not defined"
```bash
# Verificar .env.local existe
cat .env.local | grep DATABASE_URL

# Si no existe, copiar desde .env o Vercel
vercel env pull .env.production
```

### Error: "Connection refused"
```bash
# Verificar que Neon está activa
psql "$DATABASE_URL" -c "SELECT 1;"
```

---

*Continuar a: `/home/andres/Proyectos/glasify-lite/docs/migrations/PRISMA_TO_DRIZZLE_PHASE2.md`*

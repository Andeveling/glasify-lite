# Migración a Prisma Config File

**Fecha**: 12 de octubre de 2025  
**Versión Prisma**: 6.17.0  
**Razón**: Deprecation de configuración en `package.json#prisma`

## Problema

Al ejecutar `pnpm build`, Prisma mostraba el siguiente warning:

```
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config
```

## Solución Aplicada

### 1. Creado `prisma.config.ts` en la raíz del proyecto

```typescript
import { defineConfig } from 'prisma/config';

export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed-cli.ts --preset=minimal',
  },
});
```

### 2. Eliminada sección deprecated de `package.json`

**Antes**:
```json
{
  "type": "module",
  "prisma": {
    "seed": "tsx prisma/seed-cli.ts --preset=minimal"
  },
  "scripts": { ... }
}
```

**Después**:
```json
{
  "type": "module",
  "scripts": { ... }
}
```

## Beneficios

1. ✅ **Compatibilidad futura**: Preparado para Prisma 7
2. ✅ **Configuración centralizada**: Toda la configuración de Prisma en un solo archivo TypeScript
3. ✅ **Type-safe**: Configuración con validación de tipos
4. ✅ **Más flexible**: Permite configuraciones avanzadas (adapters, migrations path, etc.)

## Scripts Mantenidos

Los siguientes scripts npm se mantienen sin cambios y siguen funcionando:

```json
{
  "seed": "tsx prisma/seed-cli.ts",
  "seed:minimal": "tsx prisma/seed-cli.ts --preset=minimal",
  "seed:demo": "tsx prisma/seed-cli.ts --preset=demo-client",
  "seed:full": "tsx prisma/seed-cli.ts --preset=full-catalog"
}
```

## Comandos Prisma Afectados

Los siguientes comandos ahora cargan automáticamente `prisma.config.ts`:

- ✅ `pnpm prisma generate`
- ✅ `pnpm prisma migrate dev`
- ✅ `pnpm prisma migrate deploy`
- ✅ `pnpm prisma db seed`
- ✅ `pnpm prisma studio`
- ✅ `pnpm build` (prisma generate)

## Verificación

```bash
# Verificar que Prisma carga el nuevo config
pnpm exec prisma validate

# Salida esperada:
# Loaded Prisma config from prisma.config.ts.
# Prisma schema loaded from prisma/schema.prisma
```

## Referencias

- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Next.js with Prisma Guide](https://www.prisma.io/docs/guides/nextjs)
- [Migration Guide](https://pris.ly/prisma-config)

## Configuraciones Futuras Disponibles

El archivo `prisma.config.ts` ahora permite configuraciones avanzadas como:

```typescript
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Ubicación del schema (si difiere del default)
  schema: 'prisma/schema.prisma',
  
  // Configuración de migraciones
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed-cli.ts --preset=minimal',
  },
  
  // Configuración de Prisma Studio (experimental)
  experimental: {
    studio: true,
  },
  studio: {
    adapter: async (env) => {
      // Custom adapter configuration
    },
  },
  
  // Tablas manejadas externamente (experimental)
  experimental: {
    externalTables: true,
  },
  tables: {
    external: ['public.legacy_table'],
  },
});
```

## Notas Importantes

- ✅ No requiere `dotenv/config` porque Next.js y `@t3-oss/env-nextjs` manejan las variables de entorno
- ✅ Los scripts npm personalizados (seed:minimal, seed:demo, etc.) siguen funcionando
- ✅ El comando `npx prisma db seed` usará automáticamente el seed definido en `prisma.config.ts`
- ✅ Compatible con pnpm workspaces y monorepos

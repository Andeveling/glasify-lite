# Drizzle Migrations

Este directorio contiene todas las migraciones de base de datos generadas por Drizzle Kit.

## Estructura

- `migrations/` - Archivos de migración SQL numerados por timestamp
- `meta/` - Metadatos internos de Drizzle (no editar manualmente)

## Comandos útiles

```bash
# Generar una nueva migración basada en cambios en el schema
pnpm drizzle:generate

# Ejecutar migraciones en desarrollo
pnpm drizzle:migrate

# Ejecutar migraciones en producción
pnpm drizzle:migrate:prod

# Ver el estado de las migraciones
pnpm drizzle:status

# Abrir Drizzle Studio (UI para explorar BD)
pnpm drizzle:studio
```

## Notas importantes

- Las migraciones se ejecutan automáticamente en el orden de sus timestamps
- NO editar archivos de migración manualmente
- Si necesitas revertir cambios, crea una nueva migración
- Para desarrollo local, usa DATABASE_URL (pooling)
- Para migraciones en Neon, usa DIRECT_URL (connection directa)

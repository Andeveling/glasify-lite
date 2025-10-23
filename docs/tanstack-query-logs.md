# TanStack Query Development Logs

## Issue Description

En modo desarrollo con Next.js 15 + Turbopack, verás logs en la consola del navegador como:

```
[[ << query #1 ]tenantConfig.get {}
```

## ¿Es un error?

**NO**. Este es un **log informativo de TanStack Query v5** que muestra:
- `[[ << query #1 ]` - Query siendo ejecutada (dirección de entrada)
- `tenantConfig.get` - Nombre del procedimiento tRPC
- `{}` - Input de la query (vacío en este caso)

## ¿Por qué aparece?

TanStack Query v5 tiene logging activado por defecto en desarrollo para ayudar al debugging. Estos logs muestran:
- Queries ejecutándose
- Mutations ocurriendo
- Estado del cache
- Refetches y revalidaciones

## ¿Debo preocuparme?

**NO**. Estos logs:
- Solo aparecen en desarrollo (`NODE_ENV=development`)
- NO aparecen en producción
- NO afectan el rendimiento
- NO indican errores
- Son parte del comportamiento normal de TanStack Query

## ¿Cómo silenciar los logs? (Opcional)

Si prefieres no ver estos logs, hay dos opciones:

### Opción 1: Filtrar en DevTools del navegador

**Chrome/Edge**:
1. Abre DevTools (F12)
2. Ve a Console
3. Click en "Filter" (embudo)
4. Agrega filtro: `-query`

**Firefox**:
1. Abre DevTools (F12)
2. Console tab
3. Click en settings (⚙️)
4. "Filter Log"
5. Agrega: `-query`

### Opción 2: Desactivar logging de TanStack Query (No recomendado)

```typescript
// src/trpc/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Opciones existentes...
      },
    },
  });
```

**NOTA**: No es posible desactivar completamente estos logs sin modificar el código fuente de TanStack Query. La librería los emite directamente a `console.log()`.

## Logs útiles vs Ruido

### ✅ Logs ÚTILES (Mantener visible):
- Errores: `[[ << query #1 ]tenantConfig.get ERROR: ...`
- Warnings de React
- Errores de compilación
- Errores de red

### ℹ️ Logs INFORMATIVOS (Filtrar si molestan):
- Query logs: `[[ << query #1 ]...`
- Mutation logs: `[[ << mutation #1 ]...`
- Cache updates

## Referencias

- [TanStack Query Logging](https://tanstack.com/query/latest/docs/react/guides/queries)
- [Next.js 15 Turbopack](https://nextjs.org/docs/architecture/turbopack)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)

## Estado Actual del Proyecto

- ✅ tRPC configurado correctamente
- ✅ TanStack Query funcionando normal
- ✅ Logs de desarrollo activos (comportamiento esperado)
- ✅ Sin errores reales en la aplicación

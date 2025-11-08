# Neon Driver Adapter Setup

**Fecha**: 2025-01-07  
**Estado**: ✅ Implementado

## 📋 Resumen

Configuración del adaptador oficial de Prisma para Neon Database, optimizando conexiones serverless y mejorando el rendimiento en Vercel.

## 🎯 Objetivos

- **Performance**: Conexiones WebSocket optimizadas para serverless
- **Reliability**: Manejo automático de conexiones pooled
- **Best Practices**: Siguiendo documentación oficial de Prisma + Neon

## 📦 Paquetes Instalados

```bash
pnpm add @prisma/adapter-neon @neondatabase/serverless ws
```

### Versiones

- `@prisma/adapter-neon`: ^6.19.0
- `@neondatabase/serverless`: ^1.0.2
- `ws`: ^8.18.3

## 🔧 Configuración

### 1. Prisma Client (`src/server/db.ts`)

```typescript
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Configure Neon WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create Neon adapter for serverless connections
  const adapter = new PrismaNeon({ connectionString });

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return client;
};
```

### 2. Schema Prisma

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_URL")         // Direct connection (migrations)
}
```

**Nota**: El preview feature `driverAdapters` fue deprecado y ya no es necesario en Prisma 6.x.

### 3. Variables de Entorno

```env
# Neon Database - Pooled Connection (para queries)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Neon Database - Direct Connection (para migraciones)
DIRECT_URL="postgresql://user:pass@ep-xxx.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## ✅ Beneficios

### 1. **Conexiones Optimizadas**
- WebSocket connections para mejor performance
- Manejo automático de connection pooling
- Reducción de latencia en cold starts

### 2. **Serverless-Ready**
- Diseñado específicamente para entornos serverless
- Compatible con Vercel Edge Functions
- Manejo eficiente de recursos

### 3. **Error Handling**
- Reconexión automática en caso de fallo
- Mejor manejo de timeouts
- Logs detallados de conexión

## 🔍 Verificación

### Local

```bash
# Regenerar Prisma Client
pnpm prisma generate

# Verificar tipos TypeScript
pnpm typecheck

# Probar conexión
pnpm dev
```

### Vercel

```bash
# Las variables DATABASE_URL y DIRECT_URL deben estar configuradas
# en Vercel Dashboard > Settings > Environment Variables

# El build automáticamente ejecuta:
# 1. pnpm install (postinstall hook → prisma generate)
# 2. pnpm prebuild (prisma generate)
# 3. pnpm build (next build)
```

## 📚 Referencias

- [Prisma Neon Driver Adapter Docs](https://www.prisma.io/docs/orm/overview/databases/neon)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [Prisma + Vercel Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## 🐛 Troubleshooting

### Error: "WebSocket constructor not found"

**Causa**: Node.js no tiene WebSocket nativo.  
**Solución**: Asegurarse de que `ws` está instalado y configurado:

```typescript
import ws from "ws";
neonConfig.webSocketConstructor = ws;
```

### Error: "DATABASE_URL is not set"

**Causa**: Variable de entorno no configurada.  
**Solución**: Verificar `.env` localmente y Vercel Environment Variables en producción.

### Performance Issues

**Síntoma**: Queries lentas en producción.  
**Diagnóstico**:
1. Verificar que usas la URL pooled (`-pooler`) para `DATABASE_URL`
2. Usar la URL directa solo para migraciones (`DIRECT_URL`)
3. Revisar índices en la base de datos

## 🔄 Mantenimiento

- **Actualizar dependencias**: Mantener sincronizadas las versiones de `@prisma/client` y `@prisma/adapter-neon`
- **Monitorear logs**: Revisar logs de Vercel para errores de conexión
- **Review performance**: Usar Neon's dashboard para analizar query performance

## ✨ Próximos Pasos

- [ ] Configurar Prisma Accelerate para cache de queries (opcional)
- [ ] Implementar query caching con Neon's built-in features
- [ ] Configurar monitoring con Neon's observability tools

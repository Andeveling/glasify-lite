## Neon MCP Server - Quick Start

Guía rápida para configurar el MCP server de Neon en VS Code para desarrollo local.

### ¿Qué es el MCP Server de Neon?

El Model Context Protocol (MCP) server de Neon te permite:
- Conectar VS Code directamente a tu base de datos Neon
- Crear un proxy local en `localhost:5432` (sin exponer credenciales)
- Cambiar entre branches de Neon sin modificar `.env`
- Explorar schema y ejecutar queries desde el editor

### Instalación

1. **Instala la extensión en VS Code**:
   - Busca "Neon" en el marketplace de extensiones
   - O instala desde: https://marketplace.visualstudio.com/items?itemName=neon.neon

2. **Conecta tu cuenta de Neon**:
   - Abre el panel "Neon Local Connect" en la barra lateral
   - Haz clic en "Connect to Neon"
   - Autoriza la extensión con tu cuenta de Neon

### Configuración para Glasify Lite

**Paso 1: Selecciona tu proyecto**
```
Organization: Fabian Andres Parra (o tu organización)
Project: vitro-rojas (o el nombre de tu proyecto)
Branch: development (recomendado para desarrollo local)
```

**Paso 2: Copia la connection string**

Desde el panel MCP, copia el "LOCAL CONNECTION STRING":
```
postgresql://neon:mpg@localhost:5432/<database_name>
```

**Paso 3: Actualiza tu `.env` local**

```bash
# Archivo .env (no committear)
DATABASE_URL="postgresql://neon:mpg@localhost:5432/neondb"
```

**Paso 4: Verifica la conexión**

```bash
# Genera el cliente Prisma
pnpm prisma generate

# Verifica que puedas conectarte
pnpm prisma db pull
```

### Workflow diario

**Iniciar sesión de desarrollo**:
1. Abre VS Code en el proyecto
2. Conecta el MCP server (panel lateral)
3. Verifica que el indicador muestre "Connected to branch: development"
4. Ejecuta tu servidor de desarrollo: `pnpm dev`

**Cambiar de branch** (ej: para probar staging):
1. En el panel MCP, selecciona otro branch
2. Copia la nueva connection string
3. Actualiza `DATABASE_URL` en `.env`
4. Reinicia el servidor de desarrollo

**Ejecutar migraciones**:
```bash
# Con MCP conectado
pnpm db:migrate

# O directamente contra Neon (sin MCP)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require" pnpm db:migrate
```

**Seeds y datos de prueba**:
```bash
pnpm seed:minimal   # Datos mínimos necesarios
pnpm seed:demo      # Datos de demostración
pnpm seed:full      # Catálogo completo
```

### Ventajas vs conexión directa

| Aspecto               | MCP Server           | Conexión Directa       |
| --------------------- | -------------------- | ---------------------- |
| Credenciales          | Ocultas en VS Code   | En `.env`              |
| Cambio de branch      | UI visual en VS Code | Editar `.env`          |
| Desarrollo offline    | ❌ Requiere internet  | ✅ Con PostgreSQL local |
| Velocidad             | Proxy local (rápido) | Depende de latencia    |
| Migraciones complejas | ⚠️ Puede fallar       | ✅ Más estable          |

### Recomendaciones

**Usa MCP para**:
- Desarrollo diario y queries exploratorias
- Cambiar rápidamente entre branches
- Evitar exponer credenciales en archivos

**Usa conexión directa para**:
- Migraciones críticas en producción
- CI/CD pipelines
- Operaciones DDL complejas

### Troubleshooting

**Error "Could not connect"**:
- Verifica que el proyecto y branch existen en Neon
- Revisa que estés autenticado en la extensión
- Reinicia VS Code

**Puerto 5432 ocupado**:
```bash
# Verifica qué proceso usa el puerto
lsof -i :5432

# Si hay un PostgreSQL local, detén el MCP o cambia el puerto
```

**Schema desincronizado**:
```bash
# Regenera el cliente Prisma
pnpm prisma generate

# Refresca la conexión MCP (botón en el panel)
```

### Recursos

- Documentación oficial: https://neon.tech/docs/connect/mcp
- Extensión VS Code: https://marketplace.visualstudio.com/items?itemName=neon.neon
- Guía completa de deployment: `/docs/deployment/neon-vercel.md`

## Checklist de configuración Neon MCP

Usa esta lista para verificar que tu entorno local esté correctamente configurado con Neon MCP.

### ✅ Prerequisitos

- [ ] Cuenta de Neon creada (https://console.neon.tech)
- [ ] Proyecto de Neon creado (ej: `vitro-rojas`)
- [ ] Branch de desarrollo creado en Neon (ej: `development`)
- [ ] VS Code instalado

### ✅ Instalación MCP Server

- [ ] Extensión "Neon" instalada en VS Code
- [ ] Extensión autorizada con tu cuenta de Neon
- [ ] Panel "Neon Local Connect" visible en la barra lateral

### ✅ Conexión activa

- [ ] Organization seleccionada en el panel MCP
- [ ] Project seleccionado (debe ser `vitro-rojas` o tu proyecto)
- [ ] Branch seleccionado (recomendado: `development`)
- [ ] Indicador muestra "Connected to branch: <nombre>"
- [ ] Connection string visible en el panel (comienza con `postgresql://neon:mpg@localhost:5432/`)

### ✅ Configuración del proyecto

- [ ] Repositorio clonado: `git clone <repo-url>`
- [ ] Dependencias instaladas: `pnpm install`
- [ ] Connection string copiada desde panel MCP
- [ ] Archivo `.env` creado (desde `.env.example` o script)
- [ ] `DATABASE_URL` actualizado en `.env` con la URL del MCP
- [ ] Otras variables configuradas (`AUTH_GOOGLE_ID`, `AUTH_SECRET`, etc.)

### ✅ Prisma y migraciones

- [ ] Cliente Prisma generado: `pnpm prisma generate`
- [ ] Schema sincronizado: `pnpm prisma db pull` (sin errores)
- [ ] Migraciones aplicadas: `pnpm db:migrate` (opcional si DB ya tiene schema)
- [ ] Prisma Studio funciona: `pnpm db:studio` (abre en navegador)

### ✅ Seeds (opcional para desarrollo)

- [ ] Seed minimal ejecutado: `pnpm seed:minimal` (datos básicos)
- [ ] O seed demo ejecutado: `pnpm seed:demo` (datos de prueba)
- [ ] Verificado en Prisma Studio que hay datos

### ✅ Aplicación funcionando

- [ ] Servidor de desarrollo inicia: `pnpm dev`
- [ ] App abre en http://localhost:3000
- [ ] Sin errores de conexión a DB en consola
- [ ] Puede navegar al catálogo (datos de seed visibles)
- [ ] Autenticación funciona (si OAuth está configurado)

### ✅ Verificación de estado

Ejecuta estos comandos para verificar:

```bash
# 1. Verifica conexión a la base de datos
pnpm prisma db pull
# ✅ Debe mostrar "Introspected X models and wrote them into..."

# 2. Verifica que el schema está sincronizado
pnpm prisma validate
# ✅ Debe mostrar "The schema is valid"

# 3. Verifica que el cliente está generado
pnpm prisma generate
# ✅ Debe completar sin errores

# 4. Ejecuta typecheck
pnpm typecheck
# ✅ No debe haber errores de tipo
```

### 🐛 Troubleshooting común

**Panel MCP muestra "Disconnected"**:
```bash
# 1. Verifica que estás autenticado en la extensión
# 2. Reconecta desde el panel MCP
# 3. Reinicia VS Code si persiste
```

**Error "ECONNREFUSED localhost:5432"**:
```bash
# 1. Verifica que el indicador MCP muestra "Connected"
# 2. Si hay PostgreSQL local corriendo, detén el servicio:
sudo systemctl stop postgresql
# 3. Reconecta el MCP server
```

**Migraciones fallan con MCP**:
```bash
# Usa la URL directa de Neon para migraciones:
DATABASE_URL="<url-directa-de-neon>" pnpm db:migrate
```

**Schema desincronizado**:
```bash
# 1. Refresca la conexión MCP (botón en panel)
# 2. Regenera el cliente:
pnpm prisma generate
# 3. Reinicia el dev server:
pnpm dev
```

### 📚 Próximos pasos

Una vez completado el checklist:

1. **Lee la guía completa**: [Neon + Vercel Deployment](./neon-vercel.md)
2. **Aprende sobre branches**: Crea branches para staging/testing en Neon
3. **Configura CI/CD**: Automatiza migraciones con GitHub Actions
4. **Prepara producción**: Configura variables en Vercel

### 🎯 Tips de productividad

- **Usa el branch `development`** para trabajo diario (no afectes producción)
- **Cambia de branch visualmente** con el selector del panel MCP
- **Explora el schema** con Prisma Studio: `pnpm db:studio`
- **Ejecuta queries directas** desde el panel MCP (sin salir de VS Code)
- **Mantén actualizado** el MCP server (actualiza la extensión regularmente)

---

¿Todo funcionando? ¡Excelente! Ya puedes desarrollar con confianza usando Neon MCP 🚀

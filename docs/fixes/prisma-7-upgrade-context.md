# Actualización de Prisma 6 a 7 — Estado y Recomendación

**Fecha:** 24 de noviembre de 2025
**Autor:** GitHub Copilot

---

## Resumen

Se evaluó la actualización de Prisma ORM de la versión 6.18.0 a la 7.x siguiendo la [guía oficial](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7?via=prisma7). Tras analizar los breaking changes y el estado del proyecto, se concluyó que **NO es seguro** actualizar en este momento.

---

## Cambios Breaking de Prisma 7

1. **Migración completa a ESM**
   - Prisma 7 requiere `"type": "module"` en `package.json` y `"module": "ESNext"` en `tsconfig.json`.
   - Esto implica refactor de todos los imports/exports (`import`/`export`), scripts de seed, tests y configuración de Next.js.

2. **Driver Adapter obligatorio**
   - Ya no se puede instanciar `PrismaClient` directamente. Se debe usar el adapter correspondiente (`@prisma/adapter-pg` para Postgres).
   - Cambios invasivos en `src/server/db.ts` y toda la arquitectura de acceso a datos.

3. **prisma.config.ts obligatorio**
   - Nueva configuración para CLI y migraciones. Duplica lógica del `.env` y requiere reestructuración de la configuración.

4. **Variables de entorno no se cargan automáticamente**
   - Es necesario cargar `dotenv` explícitamente en scripts y CLI.

5. **Node.js >= 20.19.0 y TypeScript >= 5.4.0**
   - El proyecto cumple con TypeScript 5.9.3 y Node.js 22.20.0, pero el cambio a ESM puede afectar dependencias y tooling.

---

## Estado del Proyecto

- **Arquitectura:** Next.js 16, tRPC, Prisma 6.18.0, PostgreSQL, React 19, Zod, Better Auth, TanStack Query, Vitest, Playwright
- **Scripts:** Múltiples scripts de seed y migración dependen de la sintaxis actual
- **Dashboards y formularios:** En producción y con dependencias críticas
- **Tests:** E2E y unitarios dependen de la estructura actual

---

## Recomendación

**Mantener Prisma 6.18.0** por ahora. Actualizar a Prisma 7 requiere:
- Refactor ESM completo (~100+ archivos)
- Cambios en todos los scripts y tests
- Actualización de CI/CD
- Testing exhaustivo
- Documentación y capacitación

**Tiempo estimado:** 2-3 días de trabajo dedicado

### Alternativa
Esperar a Prisma 7.1+ y mejores herramientas de migración. Prisma 6 sigue recibiendo soporte y actualizaciones de seguridad.

---

## Referencias
- [Guía oficial de actualización a Prisma 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7?via=prisma7)
- [Changelog Prisma](https://www.prisma.io/changelog)

---

## Estado de compatibilidad
- **Node.js:** 22.20.0 ✅
- **TypeScript:** 5.9.3 ✅
- **ESM:** ❌ (no implementado)
- **Driver Adapter:** ❌ (no implementado)
- **prisma.config.ts:** ❌ (no implementado)

---

## Decisión
**No actualizar a Prisma 7 hasta que el proyecto esté migrado a ESM y se hayan adaptado todos los scripts y dependencias.**

---

> Si tienes dudas sobre la migración, consulta este documento antes de intentar actualizar Prisma.

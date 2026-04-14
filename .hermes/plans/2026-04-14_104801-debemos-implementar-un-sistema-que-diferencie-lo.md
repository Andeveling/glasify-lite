# Plan: Unificar Aperturas — Ventanas y Puertas en `/admin/design-templates`

## Goal

Unificar la gestión de plantillas de diseño en `/admin/design-templates`, diferenciando los dos tipos de apertura: **ventana** (paneles móviles/fijos, patrón X/O) y **puerta** (tipos de apertura con traverseño y manija). Actualmente existen dos rutas separadas: `design-templates` (solo ventanas) y `door-templates` (solo puertas). El campo `type` en `DesignTemplate` existe en el schema (`@default("window")`) pero nunca se usa en el formulario ni en las queries.

## Estado Actual

### Lo que existe

| Ruta | Qué maneja |
|------|-----------|
| `/admin/design-templates` | Solo plantillas ventana (`DesignTemplate` con patrón X/O) |
| `/admin/door-templates` | Solo plantillas puerta (`DoorTemplate`) |
| Schema: `DesignTemplate.type` | Campo existe (`@default("window")`) pero **no se usa en ningún lado** |
| Schema: `DoorTemplate` | Modelo separado con campos propios (openingType, traverseCount, handleStyle…) |

### El problema

- El campo `type` de `DesignTemplate` es un discriminated union latente que nunca se activó.
- El formulario de `DesignTemplate` ignora completamente el campo `type` y solo muestra configuración de ventana.
- El router `design-template` no incluye `type` en las queries `list` ni `listAll`.
- Hay dos rutas de admin separadas para un concepto unitary: "patrón de apertura".

## Propuesta de Implementación

### Arquitectura propuesta: single-table + discriminated union

Unificar usando `DesignTemplate.type` como discriminador:

```
DesignTemplate.type = "window" → campos actuales (pattern X/O, showArrows, showHandles)
DesignTemplate.type = "door"   → nuevos campos (openingType, traverseCount, handleStyle, showLock)
```

**Alternativa valorada**: Mantener `DoorTemplate` como tabla separada. Descartada porque:
- Dos rutas de admin para el mismo concepto ("patrón de apertura") genera fricción.
- El schema ya tiene `type` en `DesignTemplate` esperando ser usado.
- El patrón X/O para puertas tiene sentido (paneles de puerta).

---

## Plan Paso a Paso

### Fase 1 — Schema: migrar `DoorTemplate` → `DesignTemplate.type=door`

**Archivos**: `prisma/schema.prisma`

1. Añadir a `DesignTemplate` los campos que hoy tiene `DoorTemplate`:
   ```prisma
   model DesignTemplate {
     // ... campos existentes ...
     // type: String @default("window") — YA EXISTE
     
     // Solo para type="door":
     openingType     String   @default("left_interior")
     traverseCount   Int      @default(2)
     traverseStyle   String   @default("horizontal")
     frameColor      String   @default("#ffffff")
     glassColor      String   @default("#1a1a1a")
     handleStyle     String   @default("lever")
     showLock        Boolean  @default(true)
     
     // Los campos window-specific permanecen:
     // pattern, showArrows, showHandles, frameConfig
   }
   ```

2. Eliminar el modelo `DoorTemplate` y su relación en `Model`:
   ```prisma
   // En model Model:
   doorTemplate    DoorTemplate? @relation(...)  // ELIMINAR
   ```

3. Hacer que `Model.doorTemplateId` sea nullable y que `DesignTemplate` cubra ambos roles.

**Nota de riesgo**: Migración de datos. Si hay `DoorTemplate` con datos, hay que migrarlos a `DesignTemplate` antes de eliminar la tabla.

---

### Fase 2 — Validación: unificar `designTemplate` schema

**Archivos**: `src/lib/validations/design-template.ts`

1. Añadir `type` al schema base:
   ```ts
   type: z.enum(["window", "door"])
   ```

2. Validación condicional por tipo:
   - `type="window"`: requiere `pattern` (X/O), `showArrows`, `showHandles`
   - `type="door"`: requiere `openingType`, `traverseCount`, `traverseStyle`, `handleStyle`

3. Eliminar `src/lib/validations/door-template.ts` (queda obsoleto tras la migración).

---

### Fase 3 — Router tRPC: actualizar queries y mutations

**Archivos**: `src/server/api/routers/admin/design-template.ts`

1. `list`: incluir `type` en el `select`
2. `listAll`: incluir `type` en el `select` (para que `basic-info-section` sepa qué tipo es cada plantilla)
3. `create`: aceptar `type` y campos condicionales
4. `update`: lo mismo
5. `delete`: verificar que no haya `Model` usando esta plantilla con `doorTemplateId` (compat hacia atrás)

---

### Fase 4 — Formulario unificado

**Archivos**:
- `src/app/(dashboard)/admin/design-templates/_components/design-template-form.tsx`
- `src/app/(dashboard)/admin/design-templates/_hooks/use-design-template-form.ts`
- `src/app/(dashboard)/admin/design-templates/_hooks/use-design-template-mutations.ts`
- `src/lib/validations/design-template.ts`

1. **Paso 1 del form**: Selector de tipo de apertura (`window` | `door`) — visible siempre, no colapsable.

2. **Campos para `type="window"`** (sección colapsable "Ventana"):
   - Pattern selector (PRESET_PATTERNS actual)
   - showArrows, showHandles switches
   - frameConfig (thickness, profileStyle)

3. **Campos para `type="door"`** (nueva sección "Puerta"):
   - openingType selector (left_interior, right_interior, left_exterior, right_exterior)
   - traverseCount number input (0-4)
   - traverseStyle select (horizontal, vertical, grid)
   - handleStyle select (lever, knob, pull)
   - showLock switch
   - frameColor, glassColor inputs

4. **Live preview**: Usar `DesignRenderer` para window (actual); crear o adaptar renderer para door.

---

### Fase 5 — Lista / Tabla unificada

**Archivos**:
- `src/app/(dashboard)/admin/design-templates/_components/design-templates-table.tsx`
- `src/app/(dashboard)/admin/design-templates/_components/design-templates-list.tsx`

1. Añadir columna "Tipo" a la tabla con Badge: "Ventana" / "Puerta"
2. Filtrar por tipo (tabs o dropdown en la página)
3. Preview diferenciado: para `type="door"` renderizar un preview de puerta

---

### Fase 6 — BasicInfoSection en Models

**Archivos**: `src/app/(dashboard)/admin/models/_components/basic-info-section.tsx`

1. `listAll` ahora devuelve `type`. El `templateOptions` agrupará por tipo:
   ```
   — Ventanas —
   Corredera 2H (XX)
   Fija+Corredera (XO)
   — Puertas —
   Puerta izq interior
   ```
2. Eliminar `designTemplateId` y `doorTemplateId` separados → unificar a `designTemplateId` (el mismo campo cubre ambos tipos).

---

### Fase 7 — Limpieza post-migración

- Eliminar ruta `/admin/door-templates` y todos sus archivos
- Eliminar `src/server/api/routers/admin/door-template.ts`
- Eliminar `src/lib/validations/door-template.ts`
- Eliminar `src/app/(dashboard)/admin/door-templates/` (toda la carpeta)
- Limpiar `Model.doorTemplateId` del schema (nullable → quitar relación)
- Actualizar sidebar si hay link a door-templates

---

## Archivos que cambiarán

| Archivo | Cambio |
|---------|--------|
| `prisma/schema.prisma` | Añadir campos door a `DesignTemplate`, eliminar `DoorTemplate` y `doorTemplateId` en `Model` |
| `src/lib/validations/design-template.ts` | Añadir `type`, validación condicional por tipo |
| `src/lib/validations/door-template.ts` | ELIMINAR |
| `src/server/api/routers/admin/design-template.ts` | Añadir `type` a queries/mutations |
| `src/server/api/routers/admin/door-template.ts` | ELIMINAR |
| `src/app/(dashboard)/admin/design-templates/_components/design-template-form.tsx` | Formulario unificado con selector de tipo |
| `src/app/(dashboard)/admin/design-templates/_hooks/use-design-template-form.ts` | Adaptar para campos condicionales |
| `src/app/(dashboard)/admin/design-templates/_hooks/use-design-template-mutations.ts` | Adaptar mutations |
| `src/app/(dashboard)/admin/design-templates/_components/design-templates-table.tsx` | Añadir columna tipo, preview diferenciado |
| `src/app/(dashboard)/admin/design-templates/_components/design-templates-list.tsx` | Filtrar por tipo |
| `src/app/(dashboard)/admin/design-templates/page.tsx` | Tabs de filtro por tipo |
| `src/app/(dashboard)/admin/models/_components/basic-info-section.tsx` | Template selector unificado con grupos |
| `src/app/(dashboard)/admin/models/_schemas/model-form.schema.ts` | Unificar `designTemplateId` y `doorTemplateId` |
| `src/app/(dashboard)/admin/door-templates/` | ELIMINAR toda la carpeta |
| `src/app/(dashboard)/admin/_components/admin-sidebar.tsx` | Eliminar link a door-templates |

## Validación / Tests

1. `pnpm db:push --force` — forzar sync del schema (SQLite, sin migrate)
2. `pnpm prisma generate` — regenerar cliente
3. `pnpm seed --preset=vitro-rojas-panama` — verificar seeds funcionan
4. `pnpm dev` → abrir http://localhost:3000/admin/design-templates
   - Crear plantilla tipo Ventana → verificar preview
   - Crear plantilla tipo Puerta → verificar campos nuevos y guardado
5. `pnpm lint:errors` → 0 errores
6. `pnpm typecheck` → 0 errores

## Notas de Contexto

- **Sin producción**: Podemos romper y regenerar sin miedo. No hay dato de usuario real en juego.
- **DB es SQLite local**: `prisma/dev.db` — se puede borrar y recrear con seeds.
- **DoorTemplate tiene 0 datos significativos** en esta etapa de desarrollo.

## Estrategia de Ejecución Aggressive

Dado que no hay producción y los seeds recrean todo desde cero:

1. **Borrar `DoorTemplate` y todo lo asociado** — no migrar, simplemente eliminar.
2. **Regenerar DB desde seeds** después del cambio de schema.
3. **Ejecutar en cualquier orden** — las fases 1-6 son bastante independientes.

---

## Riesgos y Tradeoffs

1. **Live preview para puertas**: No existe un `DoorRenderer`. Se puede postergar a después de la fase 8 — el form guardará los datos sin preview visual inmediato.
2. **Diseño del form con campos condicionales**: Puede crecer mucho. Usar secciones colapsables (Accordion/ShCollapsible) para mantenerlo manejable.

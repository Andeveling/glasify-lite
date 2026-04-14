# Plan: Sistema Abatible (Puerta con Travesaños)

## Goal

Agregar soporte para **puertas abatibles** al sistema glasify-lite, partiendo de la puerta Vitrorojas de la foto: 3 paneles de vidrio horizontales separados por travesaños decorativos, marco blanco, manilla lateral.

---

## Contexto y Supuestos

### Lo que existe hoy
- `DesignTemplate` modela **ventanas correderas** exclusivamente
- Patrones: `XX`, `XO`, `OX`, `XXO`, etc. — paneles **verticales** lado a lado
- `DesignRenderer` renderiza paneles solo en orientación vertical (eje X)
- `frameConfig` es JSON con `thickness`, `profileStyle`, `profileColor`

### Lo que tiene la puerta de la foto
- **Puerta abatible** (gira sobre bisagras laterales, no desliza)
- 3 paneles horizontales de vidrio (travesaños decorativos, no estructurales)
- Marco blanco, manilla tipo palanca horizontal
- Vidrio oscuro/reflexivo
- Travesaños son **puramente decorativos** — la puerta es 1 hoja móvil

### Decisión arquitectónica clave
Los travesaños de la puerta Vitrorojas son **decorativos**, no particiones reales de paneles móviles/fixed. A diferencia de las ventanas correderas donde `X`=móvil y `O`=fijo define el comportamiento funcional, en una puerta abatible:
- Toda la puerta gira sobre bisagras (1 hoja móvil)
- Los travesaños son solo división visual del vidrio

---

## Enfoque Propuesto

Crear un **nuevo modelo `DoorTemplate`** separado de `DesignTemplate`, no extenderlo. Razón: la semántica es completamente distinta — una puerta abatible no tiene paneles móviles múltiples con direcciones de apertura, tiene una hoja que gira.

### Modelo de datos

```prisma
model DoorTemplate {
  id            String   @id @default(cuid())
  name          String   @unique
  // Orientación y dirección de apertura: left_interior | right_interior | left_exterior | right_exterior
  openingType   String   @default("left_interior")
  // Número de travesaños decorativos (0-4)
  traverseCount Int      @default(2)
  traverseStyle String   @default("horizontal") // horizontal | vertical | grid
  frameConfig   String   // JSON: { thickness, profileStyle, profileColor }
  frameColor    String   @default("#ffffff")
  glassColor    String   @default("#1a1a1a")
  handleStyle   String   @default("lever") // lever | knob | pull
  showLock      Boolean  @default(true)
  // La posición de la manija se infiere de openingType:
  //   left_interior  → manija a la derecha, bisagras izquierda, abre hacia adentro
  //   right_interior → manija a la izquierda, bisagras derecha, abre hacia adentro
  //   left_exterior  → manija a la derecha, bisagras izquierda, abre hacia afuera
  //   right_exterior → manija a la izquierda, bisagras derecha, abre hacia afuera
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  models        Model[]
}
```

**Nota:** `handleSide` ya no es un campo separado porque queda determinado por `openingType` según la convención del diagrama de planta.

### Pattern de Travesaños
- `traverseCount=0`: vidrio entero sin divisores
- `traverseCount=1`: 1 travesaño horizontal (divide en 2 secciones)
- `traverseCount=2`: 2 travesaños horizontales (divide en 3 secciones, como la foto)
- `traverseCount=3`: 3 travesaños
- `traverseStyle`: horizontal (default) | vertical | grid (malla 2x2)

---

## Plan Paso a Paso

### Fase 1: Base de datos

1. **Agregar `type` field a `DesignTemplate`** — `'window' | 'door'` — para distinguir qué usa cada registro (backward compatible)
2. **Crear el modelo `DoorTemplate`** en `prisma/schema.prisma` con los campos definidos arriba
3. **Ejecutar** `pnpm db:push` para aplicar cambios
4. **Generar seed data** para Vitrorojas con una `DoorTemplate` "Puerta 3 vidrios" que refleje la foto

### Fase 2: Tipos y validaciones

5. **Crear** `src/domain/door/types.ts` con:
   - `DoorOpeningType`: 'pivot' | 'hinged_left' | 'hinged_right' | 'double_hinged'
   - `TraverseStyle`: 'horizontal' | 'vertical' | 'grid'
   - `DoorFrameConfig`, `DoorTemplateConfig`, `DoorRenderProps`

6. **Crear** `src/lib/validations/door-template.ts` con:
   - `doorTemplateCreateSchema` / `doorTemplateUpdateSchema`
   - `doorTemplateIdSchema`, `doorTemplateListSchema`
   - Zod schemas con validación de traverseCount (0-4), openingType enum

7. **Crear** `src/domain/door/index.ts` barrel export

### Fase 3: Renderer

8. **Crear** `src/components/design/door-renderer.tsx` (NO modificar `design-renderer.tsx`)
   - Renderiza SVG de puerta con:
     - Marco exterior con el color especificado
     - Vidrio con traverseCount divisores horizontales (el resto del viewport height se reparte)
     - Manija en el lado opuesto a las bisagras (determinado por openingType)
     - Estilo de manija según handleStyle (lever=palanca horizontal, knob=pomo circular, pull=asa)
     - Ojo de cerradura (showLock)
     - **Arco de apertura punteado** que indica la dirección de giro:
       - `left_interior`: bisagras izquierda, arco barre hacia adentro (hacia la derecha)
       - `right_interior`: bisagras derecha, arco barre hacia adentro (hacia la izquierda)
       - `left_exterior`: bisagras izquierda, arco barre hacia afuera (hacia la derecha)
       - `right_exterior`: bisagras derecha, arco barre hacia afuera (hacia la izquierda)
     - Los travesaños se dibujan como líneas horizontales que dividen el vidrio
   - Props: `template: DoorTemplateConfig`, `size`, `showOpeningArc?: boolean` (default true)

### Fase 4: API y CRUD

9. **Crear** `src/server/api/routers/admin/door-template.ts`
   - `list`, `getById`, `listAll`, `create`, `update`, `delete`
   - Mismo patrón que `design-template.ts`

10. **Registrar** en `src/server/api/routers/admin/admin.ts`

### Fase 5: UI Admin

11. **Crear** `src/app/(dashboard)/admin/door-templates/`
    - `page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`
    - `_components/door-template-form.tsx` — usa `DoorRenderer` para preview
    - `_components/door-templates-table.tsx`
    - `_hooks/use-door-template-form.ts`, `use-door-template-mutations.ts`
    - `template-actions.tsx`

12. **Agregar al sidebar** en `src/app/(dashboard)/admin/_components/admin-sidebar.tsx`:
    - Sección "Puertas" con enlace a `/admin/door-templates`

### Fase 6: Integración con Model

13. **Modificar** `Model` schema para que pueda referenciar `DoorTemplate` además de `DesignTemplate`
    - En `prisma/schema.prisma`, `Model` ya tiene `designTemplateId? String` — agregar `doorTemplateId? String`
    - O crear una relación polimórfica con `templateType: 'window' | 'door'`

14. **Actualizar** `src/app/(dashboard)/admin/models/_components/basic-info-section.tsx` para:
    - Mostrar selector de tipo: "¿Es una ventana o una puerta?"
    - Si es puerta: mostrar `DoorTemplateSelector`
    - Si es ventana: mostrar `DesignTemplateSelector` (existente)

15. **Actualizar** `src/app/(dashboard)/admin/models/_schemas/model-form.schema.ts`
    - Agregar `doorTemplateId` y `templateType` al schema

### Fase 7: Seed para Vitrorojas

16. **Crear seed** en `prisma/data/clients/vitro-rojas/` con:
    - `DoorTemplate`: "Puerta 3 vidrios" (traverseCount=2, frameColor=#ffffff, glassColor=#1a1a1a, handleSide=left)
    - Opcional: "Puerta 2 vidrios" (traverseCount=1), "Puerta 1 vidrio" (traverseCount=0)

---

## Archivos a Modificar/Crear

### Modificar
- `prisma/schema.prisma` — agregar `type` a `DesignTemplate`, crear `DoorTemplate`
- `src/server/api/routers/admin/admin.ts` — importar door-template router
- `src/app/(dashboard)/admin/_components/admin-sidebar.tsx` — agregar sección Puertas
- `src/app/(dashboard)/admin/models/_components/basic-info-section.tsx` — selector tipo + DoorTemplate selector
- `src/app/(dashboard)/admin/models/_schemas/model-form.schema.ts` — agregar doorTemplateId
- `src/app/(dashboard)/admin/models/_utils/model-form.utils.ts` — mapear doorTemplateId

### Crear (nuevos)
- `src/domain/door/types.ts`
- `src/domain/door/index.ts`
- `src/lib/validations/door-template.ts`
- `src/components/design/door-renderer.tsx`
- `src/server/api/routers/admin/door-template.ts`
- `src/app/(dashboard)/admin/door-templates/page.tsx`
- `src/app/(dashboard)/admin/door-templates/new/page.tsx`
- `src/app/(dashboard)/admin/door-templates/[id]/edit/page.tsx`
- `src/app/(dashboard)/admin/door-templates/_components/door-template-form.tsx`
- `src/app/(dashboard)/admin/door-templates/_components/door-templates-table.tsx`
- `src/app/(dashboard)/admin/door-templates/_components/template-actions.tsx`
- `src/app/(dashboard)/admin/door-templates/_hooks/use-door-template-form.ts`
- `src/app/(dashboard)/admin/door-templates/_hooks/use-door-template-mutations.ts`

---

## Validación / Tests

1. `pnpm typecheck` — debe pasar sin errores
2. `pnpm lint:errors` — sin errores de Biome
3. Crear una `DoorTemplate` desde la UI nueva en `/admin/door-templates/new`
4. Verificar preview en el form
5. Asignar la DoorTemplate a un Model en `/admin/models`
6. Ver el Model en el catálogo con la puerta renderizada

---

## Riesgos y Tradeoffs

- **DRY**: hay mucho copy-paste de `DesignTemplate` a `DoorTemplate`. A futuro, abstractar lógica compartida (frameConfig parsing, table components, hooks) a un módulo común. Por ahora, duplicar para mantener cambios controlados.
- **Imagen de la puerta**: el `DoorRenderer` es SVG, no una imagen real. La puerta Vitrorojas de la foto no se almacena — es solo referencia visual para el seed. Si el cliente quiere usar fotos reales, habría que agregar `imageUrl` al modelo y usar `<img>` en vez de SVG en el renderer, o un hibrido (imagen de fondo + SVG overlay para handles).
- **Bidireccionalidad**: la puerta de la foto tiene manilla a la izquierda. ¿Se necesita opción para puerta que abre hacia afuera? Eso requiere información adicional (no solo handleSide, también hingeSide).

---

## Pregunta Abierta

1. ~~¿La puerta abre hacia adentro o hacia afuera?~~ — **RESUELTO**: `openingType` con 4 valores
2. ~~¿Izquierda/Derecha Interior/Exterior?~~ — **RESUELTO**: Izquierda Interior para Vitrorojas
3. ~~¿Foto real como override?~~ — **NO** por ahora, solo SVG
4. ~~¿Travesaños verticales y horizontales?~~ — **SÍ**, ambos, son puramente estéticos (el `traverseStyle` ya los soporta)

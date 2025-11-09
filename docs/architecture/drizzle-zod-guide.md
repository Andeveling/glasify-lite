# drizzle-zod: Máximo Aprovechamiento del Plugin

**Versión**: 1.0  
**Referencia**: [Official Docs](https://orm.drizzle.team/docs/zod)  
**Implementaciones**: `glass-solution`, `address` modules

---

## El Problema Que Resuelve

### ❌ Antes (Duplicación Manual)

```typescript
// 1. Definir tabla en Drizzle
export const glassItems = pgTable("glass_items", {
  id: text("id").primaryKey().default(sql`gen_id()`),
  name: text("name").notNull(),
  thickness: numeric("thickness", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. Duplicar esquema manualmente en Zod (⚠️ DESINCRONIZADO)
const GlassItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  thickness: z.number(), // ❌ Diferente tipo que Drizzle
  isActive: z.boolean(),
  createdAt: z.date(), // ❌ Diferente tipo que Drizzle
});

// 3. Validar entrada (otra copia)
const CreateGlassItemSchema = z.object({
  name: z.string().min(3),
  thickness: z.number().positive(),
});

// ⏱️ Resultado: 30+ líneas de código repetido
// 🐛 Riesgo: Si cambias la tabla, los schemas no se actualizan
// 🔧 Mantenimiento: Triple trabajo en cada cambio
```

### ✅ Después (drizzle-zod)

```typescript
// 1. Tabla en Drizzle (ÚNICA FUENTE DE VERDAD)
export const glassItems = pgTable("glass_items", {
  id: text("id").primaryKey().default(sql`gen_id()`),
  name: text("name").notNull(),
  thickness: numeric("thickness", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. Auto-generar schemas (SINCRONIZACIÓN AUTOMÁTICA)
export const SelectGlassItemSchema = createSelectSchema(glassItems);
export const InsertGlassItemSchema = createInsertSchema(glassItems);

// 3. Composición para casos específicos (SIN DUPLICACIÓN)
export const createInput = InsertGlassItemSchema.pick({
  name: true,
  thickness: true,
}).extend({
  // Solo validaciones de negocio
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  thickness: z.number().positive("Espesor debe ser positivo"),
});

// ⏱️ Resultado: 15 líneas (42% reducción)
// ✅ Garantizado: Schemas siempre sincrónicos
// 🚀 Mantenimiento: Un solo cambio en la tabla
```

**Beneficio Medido**:
- glass-solution: 174 líneas → 101 líneas (-42%)
- Fewer imports, clearer intent, automatic sync

---

## Patrón Core: Drizzle → Zod → API

```
Drizzle Table Definition
        ↓
  createSelectSchema()  ← Genera SELECT schemas
  createInsertSchema()  ← Genera INSERT schemas
        ↓
  pick() + extend()     ← Personalización sin duplicación
        ↓
  tRPC .input()/.output()
        ↓
  Type-safe API
```

---

## Casos de Uso

### Caso 1: Output Schema (Respuesta de API)

```typescript
// Tabla (fuente de verdad)
export const glassItems = pgTable("glass_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  thickness: numeric("thickness", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Auto-generar schema SELECT
export const SelectGlassItemSchema = createSelectSchema(glassItems);

// Personalizar para API (convertir tipos)
export const glassItemOutput = SelectGlassItemSchema.extend({
  // NUMERIC (string en Drizzle) → número en API
  thickness: z.number(),
  // Timestamp (Date en Drizzle) → ISO string en API
  createdAt: z.string().datetime(),
});

// Tipo TypeScript sincronizado automáticamente
export type GlassItemOutput = z.infer<typeof glassItemOutput>;
// = { id: string, name: string, thickness: number, createdAt: string }
```

**Ventaja**: Si agregas campo en tabla, automáticamente aparece en API

---

### Caso 2: Input Schema (Crear/Actualizar)

```typescript
// Auto-generar schema INSERT
export const InsertGlassItemSchema = createInsertSchema(glassItems);

// Composición para CREATE: seleccionar campos relevantes
export const createInput = InsertGlassItemSchema.pick({
  name: true,
  thickness: true,
  // Omitir: id (auto-generado), createdAt (NOW), isActive (default)
}).extend({
  // Agregar validación de negocio
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
  thickness: z.number().positive("Espesor debe ser positivo"),
});

// Composición para UPDATE: todos los campos opcionales + ID
export const updateInput = InsertGlassItemSchema.partial().extend({
  id: z.string().cuid2(), // Agregar ID de destino
});

// Composición para DELETE: solo ID
export const deleteInput = z.object({
  id: z.string().cuid2(),
});
```

**Pattern**: `.pick()` + `.extend()` = máxima reutilización

---

### Caso 3: Validaciones Complejas

```typescript
// Base auto-generada
export const InsertProjectSchema = createInsertSchema(projects);

// Composición con validación de negocio
export const createProjectInput = InsertProjectSchema
  .pick({
    name: true,
    description: true,
    budget: true,
  })
  .extend({
    // Validación integrada
    name: z.string().min(5, "Proyecto debe tener nombre > 5 caracteres"),
    budget: z.number().positive("Presupuesto debe ser > 0"),
  })
  .refine(
    // Validación cruzada
    (data) => data.budget >= 1000,
    { message: "Presupuesto mínimo: $1000", path: ["budget"] }
  );

export type CreateProjectInput = z.infer<typeof createProjectInput>;
```

---

### Caso 4: Relaciones (Select con JOIN)

```typescript
// Tabla
export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  total: numeric("total").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// Schema con relación
export const SelectQuoteSchema = createSelectSchema(quotes);

// Output: incluye datos de customer
export const quoteDetailOutput = SelectQuoteSchema.extend({
  total: z.number(), // NUMERIC → número
  createdAt: z.string().datetime(),
  // Campos de relación (si el repository los incluye)
  customerName: z.string(),
  customerEmail: z.string().email(),
});

// En repository
export async function findQuoteWithCustomer(client: DbClient, quoteId: string) {
  return await client
    .select({
      // Quote fields
      id: quotes.id,
      customerId: quotes.customerId,
      total: quotes.total, // string
      createdAt: quotes.createdAt,
      // Customer fields
      customerName: customers.name,
      customerEmail: customers.email,
    })
    .from(quotes)
    .leftJoin(customers, eq(quotes.customerId, customers.id))
    .where(eq(quotes.id, quoteId))
    .then((rows) => rows[0] ?? null);
}

// En service
export async function getQuoteDetail(client: DbClient, quoteId: string) {
  const row = await findQuoteWithCustomer(client, quoteId);
  if (!row) throw new TRPCError({ code: "NOT_FOUND" });
  
  // Validar y serializar
  return quoteDetailOutput.parse({
    ...row,
    total: Number.parseFloat(row.total), // string → number
  });
}
```

---

### Caso 5: Listas con Paginación

```typescript
// Schemas auto-generados
export const SelectProjectSchema = createSelectSchema(projects);

// Output para listados
export const projectListItemOutput = SelectProjectSchema.extend({
  budget: z.number(),
});

// Contenedor para lista
export const projectsListOutput = z.object({
  items: z.array(projectListItemOutput),
  total: z.number().int(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int(),
});

export type ProjectsListOutput = z.infer<typeof projectsListOutput>;

// Input para filtrar
export const listProjectsInput = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ListProjectsInput = z.infer<typeof listProjectsInput>;
```

---

## Integración en tRPC

```typescript
// Schemas (drizzle-zod)
export const SelectAddressSchema = createSelectSchema(projectAddresses);
export const InsertAddressSchema = createInsertSchema(projectAddresses);

export const addressOutput = SelectAddressSchema.extend({
  latitude: z.number(),
  longitude: z.number(),
});

export const createAddressInput = InsertAddressSchema.pick({
  street: true,
  city: true,
  latitude: true,
  longitude: true,
});

// Queries
export const addressQueries = createTRPCRouter({
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .output(addressOutput) // ✅ from drizzle-zod
    .query(async ({ ctx, input }) =>
      getAddressById(ctx.db, input.id)
    ),
});

// Mutations
export const addressMutations = createTRPCRouter({
  create: adminProcedure
    .input(createAddressInput) // ✅ from drizzle-zod
    .output(addressOutput) // ✅ from drizzle-zod
    .mutation(async ({ ctx, input }) =>
      createAddress(ctx.db, input)
    ),
});

// Router
export const addressRouter = createTRPCRouter({
  ...addressQueries._def.procedures,
  ...addressMutations._def.procedures,
});

export * from "./schemas"; // ✅ Export for forms
```

---

## Metricas: glass-solution Refactoring

### Antes (Manual Schemas)

```
Total líneas: 174
- Duplication: 30+ líneas repetidas
- Maintenance burden: 3x trabajo
- Type safety: Parcial (manual)
- Sync risk: Alto (5 puntos de sincronización)
```

### Después (drizzle-zod)

```
Total líneas: 101
- Reduction: 42%
- Duplication: 0 (auto-generado)
- Maintenance: 1x trabajo
- Type safety: Total (inferida)
- Sync risk: Cero (única fuente de verdad)
```

### Comparación

```typescript
// ANTES: 30 líneas para basic CRUD schemas
const SelectGlassItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  thickness: z.number(),
  isActive: z.boolean(),
  color: z.string(),
  glassType: z.string(),
  supplier: z.string(),
  // ... más campos
});

const InsertGlassItemSchema = z.object({
  name: z.string().min(3),
  thickness: z.number().positive(),
  // ... duplicación
});

// DESPUÉS: 5 líneas con drizzle-zod
export const SelectGlassItemSchema = createSelectSchema(glassItems);
export const InsertGlassItemSchema = createInsertSchema(glassItems);

export const createInput = InsertGlassItemSchema.pick({
  name: true,
  thickness: true,
}).extend({
  name: z.string().min(3, "Nombre debe tener al menos 3 caracteres"),
});
```

---

## Checklist: Implementando drizzle-zod

- [ ] Instalar `npm install drizzle-zod` (ya incluido)
- [ ] En `{module}.schemas.ts`:
  - [ ] Importar `createSelectSchema, createInsertSchema` desde `drizzle-zod`
  - [ ] Generar `SelectModuleSchema = createSelectSchema(table)`
  - [ ] Generar `InsertModuleSchema = createInsertSchema(table)`
  - [ ] Componer `.pick()` para casos específicos
  - [ ] Usar `.extend()` para validaciones de negocio
  - [ ] Exportar tipos con `z.infer<>`
- [ ] En `{module}.queries.ts`:
  - [ ] Usar schemas generados en `.input()` y `.output()`
- [ ] En `{module}.mutations.ts`:
  - [ ] Usar schemas generados en `.input()` y `.output()`
- [ ] Validar con `biome check --fix`

---

## Errores Comunes

### ❌ Error 1: No usar drizzle-zod

```typescript
// MAL: Manual duplication
const MySchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... más campos a mano
});

// BIEN: Auto-generated
const MySchema = createSelectSchema(myTable);
```

### ❌ Error 2: No personalizar

```typescript
// MAL: Usar schema crudo sin validación de negocio
export const createInput = InsertItemSchema; // Sin validaciones

// BIEN: Composición con reglas de negocio
export const createInput = InsertItemSchema.pick({
  name: true,
}).extend({
  name: z.string().min(3, "Error en español"),
});
```

### ❌ Error 3: Type mismatch

```typescript
// MAL: No convertir NUMERIC
export const itemOutput = SelectItemSchema; // price es string

// BIEN: Convertir tipos para API
export const itemOutput = SelectItemSchema.extend({
  price: z.number(), // string → number
});
```

### ❌ Error 4: No reutilizar

```typescript
// MAL: Crear schema nuevo en lugar de reutilizar
const CreateItemSchema = z.object({
  name: z.string(),
  // ... duplicación
});

// BIEN: Reutilizar base
const createInput = InsertItemSchema.pick({ name: true });
```

---

## Próximos Pasos

1. ✅ Aplicar a todos los módulos en `/src/server/api/routers/admin/`
2. ✅ Migrar módulos legacy a Clean Architecture + drizzle-zod
3. ✅ Documentar en README de cada módulo
4. ✅ Capacitar al equipo en el patrón

---

**Referencia**: [drizzle-zod Official](https://orm.drizzle.team/docs/zod)  
**Ejemplos**: `glass-solution`, `address` modules en este proyecto

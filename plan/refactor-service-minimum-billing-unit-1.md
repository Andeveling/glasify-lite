---
goal: Implementar unidad mínima de cobro para servicios con tipo area/perimeter
version: 1.0
date_created: 2025-01-04
last_updated: 2025-01-04
owner: Development Team
status: 'Planned'
tags: [refactor, feature, services, pricing]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Este plan implementa la capacidad de definir unidades mínimas de cobro para servicios parametrizados por área (sqm) y perímetro (ml). Esto resuelve el caso de uso donde una ventana pequeña (ej: 500mm x 500mm = 0.25m²) debe facturarse como mínimo 1m², permitiendo al administrador configurar esta restricción por servicio.

**Problema actual**: Un servicio de instalación con tarifa de $50,000/m² cobra solo $12,500 por una ventana de 0.25m², cuando el costo real de instalación justifica cobrar el mínimo de 1m².

**Solución**: Agregar campo `minimumBillingUnit` opcional a servicios tipo `area` y `perimeter` que establece el valor mínimo a facturar, independiente del cálculo de área/perímetro real.

## 1. Requirements & Constraints

### Business Rules

- **REQ-001**: El campo `minimumBillingUnit` es **opcional** y solo aplica a servicios tipo `area` o `perimeter`
- **REQ-002**: Para servicios tipo `fixed`, el campo `minimumBillingUnit` no tiene efecto (siempre se cobra 1 unidad)
- **REQ-003**: El valor de `minimumBillingUnit` debe ser **positivo** (mayor a 0)
- **REQ-004**: El cálculo de cantidad facturable debe ser: `MAX(calculatedQuantity, minimumBillingUnit ?? 0)`
- **REQ-005**: El campo debe ser configurable en el formulario de creación/edición de servicios
- **REQ-006**: El campo debe persistirse en el modelo `Service` de Prisma
- **REQ-007**: El campo debe ser serializable en las respuestas de tRPC (JSON)

### Technical Constraints

- **CON-001**: Mantener compatibilidad con servicios existentes (campo opcional con default NULL)
- **CON-002**: No requiere migración de datos (servicios existentes funcionan sin cambios)
- **CON-003**: El cambio afecta la lógica de cálculo en `src/server/price/price-item.ts`
- **CON-004**: El cambio requiere actualización de schemas de validación Zod
- **CON-005**: El cambio requiere actualización de formularios (UI)
- **CON-006**: Debe ser compatible con el sistema de cotización existente (QuoteItem, CartItem)

### Data Validation

- **VAL-001**: `minimumBillingUnit` debe ser `Decimal` positivo o `null`
- **VAL-002**: Validación client-side en formularios (React Hook Form + Zod)
- **VAL-003**: Validación server-side en tRPC procedures
- **VAL-004**: Precision decimal: `@db.Decimal(10, 4)` (consistente con `rate`)

### UI/UX Guidelines

- **GUD-001**: El campo debe estar visible solo cuando `type` sea `area` o `perimeter`
- **GUD-002**: Debe incluir descripción clara del propósito del campo
- **GUD-003**: Debe mostrar la unidad correspondiente según el tipo de servicio (m² o ml)
- **GUD-004**: Debe validarse en tiempo real (feedback inmediato al usuario)
- **GUD-005**: Mensajes de error en español, claro y específico

### Patterns & Architecture

- **PAT-001**: Seguir el patrón existente de `Service` model con campos opcionales
- **PAT-002**: Usar Decimal.js para cálculos precisos (evitar errores de punto flotante)
- **PAT-003**: Aplicar Server-Side calculation pattern (no confiar en cálculos client-side)
- **PAT-004**: Mantener atomicidad en componentes UI (Single Responsibility)
- **PAT-005**: Seguir convenciones de naming: kebab-case para archivos, camelCase para variables

## 2. Implementation Steps

### Implementation Phase 1: Database Schema & Migration

**GOAL-001**: Actualizar el modelo `Service` en Prisma para soportar `minimumBillingUnit`

| Task     | Description                                                                                          | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Agregar campo `minimumBillingUnit` a modelo `Service` en `prisma/schema.prisma`                      |           |      |
| TASK-002 | Generar y aplicar migración con `pnpm prisma migrate dev --name add_minimum_billing_unit_to_service` |           |      |
| TASK-003 | Verificar que la migración sea idempotente y no afecte datos existentes                              |           |      |

**TASK-001 Details**:
```prisma
model Service {
  id            String             @id @default(cuid())
  name          String
  type          ServiceType
  unit          ServiceUnit
  rate          Decimal            @db.Decimal(12, 4)
  
  /// Unidad mínima de cobro (aplica solo a servicios tipo area/perimeter)
  /// Ejemplo: Si minimumBillingUnit = 1.0 y el área calculada es 0.25m², se cobra 1.0m²
  /// NULL significa que no hay mínimo (se cobra la cantidad calculada)
  minimumBillingUnit Decimal?       @db.Decimal(10, 4)
  
  isActive      Boolean            @default(true)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  quoteServices QuoteItemService[]

  @@index([isActive])
}
```

### Implementation Phase 2: Server-Side Pricing Logic

**GOAL-002**: Actualizar la lógica de cálculo de servicios en `price-item.ts` para respetar `minimumBillingUnit`

| Task     | Description                                                                                                 | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-004 | Actualizar `PriceServiceInput` type para incluir `minimumBillingUnit?: Decimal \| number \| string \| null` |           |      |
| TASK-005 | Modificar función `computeServiceQuantity` para aplicar lógica de mínimo                                    |           |      |
| TASK-006 | Agregar unit tests para validar cálculo con/sin `minimumBillingUnit`                                        |           |      |

**TASK-005 Details**:
```typescript
// src/server/price/price-item.ts

export type PriceServiceInput = {
  serviceId: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: Decimal | number | string;
  quantityOverride?: number;
  minimumBillingUnit?: Decimal | number | string | null; // ✅ NEW
};

const computeServiceQuantity = (
  service: PriceServiceInput,
  dimensions: { widthMeters: Decimal; heightMeters: Decimal },
) => {
  if (service.type === "fixed") {
    const quantity =
      typeof service.quantityOverride === "number"
        ? new Decimal(service.quantityOverride)
        : new Decimal(1);
    return roundHalfUp(quantity, FIXED_QUANTITY_SCALE);
  }

  const baseQuantity = unitQuantity(service.unit, dimensions);
  
  if (typeof service.quantityOverride === "number") {
    return roundHalfUp(new Decimal(service.quantityOverride));
  }
  
  // ✅ NEW: Apply minimum billing unit if provided
  if (service.minimumBillingUnit) {
    const minimumDecimal = toDecimal(service.minimumBillingUnit);
    return baseQuantity.greaterThan(minimumDecimal) 
      ? baseQuantity 
      : minimumDecimal;
  }
  
  return baseQuantity;
};
```

### Implementation Phase 3: tRPC Router Updates

**GOAL-003**: Actualizar procedures de `Service` para persistir y retornar `minimumBillingUnit`

| Task     | Description                                                                                                   | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-007 | Actualizar `quote.calculate-item` mutation para incluir `minimumBillingUnit` al construir `PriceServiceInput` |           |      |
| TASK-008 | Actualizar `quote.add-item` mutation para incluir `minimumBillingUnit` al crear `QuoteItemService`            |           |      |
| TASK-009 | Actualizar `admin.service.list` para incluir `minimumBillingUnit` en el select                                |           |      |
| TASK-010 | Actualizar `admin.service.create` para aceptar y validar `minimumBillingUnit`                                 |           |      |
| TASK-011 | Actualizar `admin.service.update` para aceptar y validar `minimumBillingUnit`                                 |           |      |

**TASK-007 Details**:
```typescript
// src/server/api/routers/quote/quote.ts (calculate-item mutation)

// Fetch services with minimumBillingUnit
const services = await ctx.db.service.findMany({
  where: { id: { in: input.services.map((s) => s.serviceId) } },
  select: {
    id: true,
    type: true,
    unit: true,
    rate: true,
    minimumBillingUnit: true, // ✅ NEW
  },
});

// Map to PriceServiceInput with minimumBillingUnit
const serviceInputs: PriceServiceInput[] = [];
for (const svc of input.services) {
  const service = services.find((s) => s.id === svc.serviceId);
  if (service) {
    serviceInputs.push({
      serviceId: service.id,
      type: service.type,
      unit: service.unit,
      rate: service.rate,
      minimumBillingUnit: service.minimumBillingUnit, // ✅ NEW
    });
  }
}
```

### Implementation Phase 4: Validation Schemas

**GOAL-004**: Actualizar schemas de validación Zod para `minimumBillingUnit`

| Task     | Description                                                                        | Completed | Date |
| -------- | ---------------------------------------------------------------------------------- | --------- | ---- |
| TASK-012 | Actualizar `baseServiceSchema` en `src/lib/validations/admin/service.schema.ts`    |           |      |
| TASK-013 | Agregar regla de validación condicional: requerido solo si type = area o perimeter |           |      |
| TASK-014 | Actualizar tipos exportados `CreateServiceInput` y `UpdateServiceInput`            |           |      |

**TASK-012 Details**:
```typescript
// src/lib/validations/admin/service.schema.ts

const baseServiceSchema = z.object({
  name: spanishText
    .min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`)
    .max(MAX_NAME_LENGTH, `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`)
    .describe("Service name (e.g., Instalación, Entrega)"),

  rate: priceValidator
    .positive("La tarifa debe ser mayor a cero")
    .describe("Service rate (always positive, services add cost)"),

  type: serviceTypeSchema.describe("Service type (area, perimeter, fixed)"),

  unit: serviceUnitSchema.describe("Measurement unit (unit, sqm, ml)"),
  
  // ✅ NEW: Minimum billing unit (optional)
  minimumBillingUnit: z
    .number()
    .positive("La unidad mínima debe ser mayor a cero")
    .optional()
    .nullable()
    .describe("Minimum billing unit (only for area/perimeter services)"),
}).refine(
  (data) => {
    // If type is 'fixed', minimumBillingUnit must be null/undefined
    if (data.type === "fixed" && data.minimumBillingUnit) {
      return false;
    }
    return true;
  },
  {
    message: "La unidad mínima solo aplica a servicios tipo área o perímetro",
    path: ["minimumBillingUnit"],
  }
);
```

### Implementation Phase 5: UI Components (Admin Dashboard)

**GOAL-005**: Agregar campo `minimumBillingUnit` a formularios de servicio

| Task     | Description                                                                              | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-015 | Actualizar `service-dialog.tsx` para incluir campo condicional de unidad mínima          |           |      |
| TASK-016 | Actualizar `use-service-form.ts` hook para manejar `minimumBillingUnit` en defaultValues |           |      |
| TASK-017 | Actualizar `use-service-mutations.ts` para incluir `minimumBillingUnit` en create/update |           |      |
| TASK-018 | Actualizar `services-table.tsx` para mostrar unidad mínima (opcional)                    |           |      |
| TASK-019 | Agregar tooltip/descripción que explique el propósito del campo                          |           |      |

**TASK-015 Details**:
```tsx
// src/app/(dashboard)/admin/services/_components/service-dialog.tsx

// Add to form after "Service Type" field
{/* Minimum Billing Unit - Only visible for area/perimeter services */}
{(watchedType === "area" || watchedType === "perimeter") && (
  <FormField
    control={form.control}
    name="minimumBillingUnit"
    render={({ field }) => (
      <FormItem className="w-full">
        <FormLabel>
          Unidad Mínima de Cobro (Opcional)
        </FormLabel>
        <FormControl>
          <Input
            {...field}
            className="w-full"
            disabled={isPending}
            min="0.01"
            onChange={(e) =>
              field.onChange(
                e.target.value ? Number.parseFloat(e.target.value) : null
              )
            }
            placeholder="Ej: 1.0"
            step="0.01"
            type="number"
            value={field.value ?? ""}
          />
        </FormControl>
        <FormDescription>
          Cantidad mínima a cobrar (en {watchedType === "area" ? "m²" : "ml"}). 
          Si el cálculo es menor, se cobra el mínimo. 
          Ejemplo: Si mínimo = 1.0m² y área = 0.25m², se cobra 1.0m².
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
)}
```

**TASK-016 Details**:
```typescript
// src/app/(dashboard)/admin/services/_hooks/use-service-form.ts

type FormValues = {
  name: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: number;
  minimumBillingUnit?: number | null; // ✅ NEW
};

export function useServiceForm({ mode, open, defaultValues }: UseServiceFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      rate: defaultValues?.rate?.toNumber() ?? 0,
      type: defaultValues?.type ?? "fixed",
      unit: defaultValues?.unit ?? "unit",
      minimumBillingUnit: defaultValues?.minimumBillingUnit?.toNumber() ?? null, // ✅ NEW
    },
    resolver: zodResolver(createServiceSchema),
  });

  // Watch type to show/hide minimumBillingUnit field
  const watchedType = form.watch("type");

  // Reset minimumBillingUnit to null when switching to 'fixed' type
  const handleTypeChange = (type: ServiceType) => {
    form.setValue("type", type);
    form.setValue("unit", TYPE_TO_UNIT_MAP[type]);
    
    // ✅ NEW: Clear minimum when switching to fixed
    if (type === "fixed") {
      form.setValue("minimumBillingUnit", null);
    }
  };

  return {
    form,
    handleTypeChange,
    watchedType, // ✅ NEW: Expose for conditional rendering
  };
}
```

### Implementation Phase 6: Testing & Validation

**GOAL-006**: Asegurar cobertura de tests para la funcionalidad

| Task     | Description                                                                   | Completed | Date |
| -------- | ----------------------------------------------------------------------------- | --------- | ---- |
| TASK-020 | Unit tests: `price-item.ts` con diferentes escenarios de `minimumBillingUnit` |           |      |
| TASK-021 | Integration tests: tRPC procedures create/update service con validación       |           |      |
| TASK-022 | E2E tests: Flujo completo de creación de servicio con unidad mínima           |           |      |
| TASK-023 | Regression tests: Verificar que servicios sin mínimo funcionen igual          |           |      |

**TASK-020 Test Cases**:
```typescript
// tests/unit/price-item.test.ts

describe("computeServiceQuantity with minimumBillingUnit", () => {
  it("should use calculated quantity when it exceeds minimum", () => {
    const service = {
      serviceId: "svc_1",
      type: "area" as ServiceType,
      unit: "sqm" as ServiceUnit,
      rate: 50000,
      minimumBillingUnit: 1.0,
    };
    const dimensions = { widthMeters: new Decimal(2), heightMeters: new Decimal(2) }; // 4m²
    
    const quantity = computeServiceQuantity(service, dimensions);
    
    expect(quantity.toNumber()).toBe(4); // Uses calculated 4m², not minimum 1m²
  });

  it("should use minimum when calculated quantity is lower", () => {
    const service = {
      serviceId: "svc_1",
      type: "area" as ServiceType,
      unit: "sqm" as ServiceUnit,
      rate: 50000,
      minimumBillingUnit: 1.0,
    };
    const dimensions = { widthMeters: new Decimal(0.5), heightMeters: new Decimal(0.5) }; // 0.25m²
    
    const quantity = computeServiceQuantity(service, dimensions);
    
    expect(quantity.toNumber()).toBe(1); // Uses minimum 1m², not calculated 0.25m²
  });

  it("should ignore minimum for fixed services", () => {
    const service = {
      serviceId: "svc_1",
      type: "fixed" as ServiceType,
      unit: "unit" as ServiceUnit,
      rate: 50000,
      minimumBillingUnit: 5.0, // Should be ignored
    };
    const dimensions = { widthMeters: new Decimal(0.5), heightMeters: new Decimal(0.5) };
    
    const quantity = computeServiceQuantity(service, dimensions);
    
    expect(quantity.toNumber()).toBe(1); // Always 1 for fixed, ignores minimum
  });

  it("should work without minimumBillingUnit (backward compatibility)", () => {
    const service = {
      serviceId: "svc_1",
      type: "area" as ServiceType,
      unit: "sqm" as ServiceUnit,
      rate: 50000,
      minimumBillingUnit: null,
    };
    const dimensions = { widthMeters: new Decimal(0.5), heightMeters: new Decimal(0.5) }; // 0.25m²
    
    const quantity = computeServiceQuantity(service, dimensions);
    
    expect(quantity.toNumber()).toBe(0.25); // Uses calculated, no minimum
  });
});
```

### Implementation Phase 7: Documentation

**GOAL-007**: Documentar la nueva funcionalidad

| Task     | Description                                                               | Completed | Date |
| -------- | ------------------------------------------------------------------------- | --------- | ---- |
| TASK-024 | Actualizar comentarios en `schema.prisma` para campo `minimumBillingUnit` |           |      |
| TASK-025 | Agregar sección en `docs/architecture.md` sobre lógica de unidad mínima   |           |      |
| TASK-026 | Actualizar `CHANGELOG.md` con entry de feature                            |           |      |
| TASK-027 | Crear entrada en wiki/knowledge base para administradores (cómo usar)     |           |      |

**TASK-026 CHANGELOG Entry**:
```markdown
## [Unreleased]

### Added
- **Unidad Mínima de Cobro para Servicios**: Los servicios tipo `area` y `perimeter` ahora soportan una unidad mínima de cobro configurable. Esto permite cobrar un mínimo (ej: 1m²) cuando el cálculo real es menor (ej: 0.25m²). El campo `minimumBillingUnit` es opcional y se configura en el formulario de creación/edición de servicios.
  - Nuevo campo `minimumBillingUnit` en modelo `Service` (Decimal nullable)
  - Lógica de cálculo actualizada en `src/server/price/price-item.ts`
  - Validación Zod condicional: solo aplica a servicios area/perimeter
  - UI actualizado en formulario de servicios con campo condicional
  - Tests agregados para cobertura completa
```

## 3. Alternatives

**ALT-001**: **Hardcodear unidad mínima a 1.0 para todos los servicios tipo area/perimeter**
- **Razón de descarte**: No ofrece flexibilidad. Algunos servicios pueden necesitar mínimos diferentes (0.5m², 2m², etc.)

**ALT-002**: **Crear campo `minimumBillingAmount` (monto en dinero en vez de unidad)**
- **Razón de descarte**: Complica la lógica de cálculo y hace menos transparente el pricing. Es mejor calcular: `cantidad * tarifa` donde cantidad respeta el mínimo

**ALT-003**: **Agregar regla de negocio a nivel de cotización (no de servicio)**
- **Razón de descarte**: Menos mantenible. Mejor que la regla esté en la definición del servicio, donde el admin la configura una vez

**ALT-004**: **Usar `quantityOverride` existente en lugar de nuevo campo**
- **Razón de descarte**: `quantityOverride` es para casos manuales/excepcionales. `minimumBillingUnit` es una regla de negocio consistente para el servicio

## 4. Dependencies

**DEP-001**: Prisma ORM 6.18.0 (ya instalado)
- Necesario para generar migración y actualizar cliente de Prisma

**DEP-002**: Zod 4.1.12 (ya instalado)
- Necesario para validación de esquemas

**DEP-003**: React Hook Form 7.64.0 (ya instalado)
- Necesario para manejo de formularios

**DEP-004**: Decimal.js (ya instalado vía Prisma)
- Necesario para cálculos precisos de cantidades

**DEP-005**: TanStack Query 5.90.2 (ya instalado)
- Necesario para mutations y cache invalidation

## 5. Files

### Modified Files

**FILE-001**: `prisma/schema.prisma`
- **Descripción**: Agregar campo `minimumBillingUnit` a modelo `Service`
- **Cambio**: 1 línea agregada (nullable Decimal)

**FILE-002**: `src/server/price/price-item.ts`
- **Descripción**: Actualizar lógica de `computeServiceQuantity` para respetar mínimo
- **Cambio**: ~10 líneas en función, actualizar type `PriceServiceInput`

**FILE-003**: `src/server/api/routers/quote/quote.ts`
- **Descripción**: Incluir `minimumBillingUnit` al construir `serviceInputs` en mutations
- **Cambio**: Agregar campo en queries de servicio (2 lugares)

**FILE-004**: `src/lib/validations/admin/service.schema.ts`
- **Descripción**: Agregar validación para `minimumBillingUnit` con regla condicional
- **Cambio**: Agregar campo optional + refine rule

**FILE-005**: `src/app/(dashboard)/admin/services/_components/service-dialog.tsx`
- **Descripción**: Agregar campo condicional para unidad mínima en formulario
- **Cambio**: Agregar FormField con watch del tipo de servicio

**FILE-006**: `src/app/(dashboard)/admin/services/_hooks/use-service-form.ts`
- **Descripción**: Actualizar defaultValues y FormValues para incluir `minimumBillingUnit`
- **Cambio**: Agregar campo en type y defaultValues

**FILE-007**: `src/app/(dashboard)/admin/services/_hooks/use-service-mutations.ts`
- **Descripción**: Incluir `minimumBillingUnit` en payloads de create/update
- **Cambio**: Agregar campo en input de mutations

**FILE-008**: `src/app/(dashboard)/admin/services/_components/services-table.tsx` (opcional)
- **Descripción**: Mostrar unidad mínima en columna adicional o tooltip
- **Cambio**: Nueva columna o badge condicional

### New Files

**FILE-009**: `prisma/migrations/YYYYMMDDHHMMSS_add_minimum_billing_unit_to_service/migration.sql`
- **Descripción**: Migración generada automáticamente por Prisma
- **Contenido**: `ALTER TABLE "Service" ADD COLUMN "minimumBillingUnit" DECIMAL(10,4);`

**FILE-010**: `tests/unit/price-item.test.ts` (si no existe)
- **Descripción**: Tests unitarios para lógica de pricing con mínimo
- **Contenido**: 4+ test cases cubriendo escenarios con/sin mínimo

## 6. Testing

**TEST-001**: **Unit Test - Servicio con mínimo > cantidad calculada**
- **Input**: Servicio area con mínimo 1.0m², ventana 0.5m x 0.5m (0.25m²)
- **Expected**: Cantidad facturada = 1.0m², amount = 1.0 * rate

**TEST-002**: **Unit Test - Servicio con mínimo < cantidad calculada**
- **Input**: Servicio area con mínimo 1.0m², ventana 2m x 2m (4m²)
- **Expected**: Cantidad facturada = 4.0m², amount = 4.0 * rate

**TEST-003**: **Unit Test - Servicio sin mínimo (null)**
- **Input**: Servicio area sin mínimo, ventana 0.5m x 0.5m (0.25m²)
- **Expected**: Cantidad facturada = 0.25m², amount = 0.25 * rate

**TEST-004**: **Unit Test - Servicio fixed con mínimo (debe ignorarse)**
- **Input**: Servicio fixed con mínimo 5.0, cualquier dimensión
- **Expected**: Cantidad facturada = 1.0, amount = 1.0 * rate

**TEST-005**: **Integration Test - Crear servicio con mínimo válido**
- **Input**: `admin.service.create({ name: "Instalación", type: "area", rate: 50000, minimumBillingUnit: 1.0 })`
- **Expected**: Servicio creado exitosamente, campo persiste en DB

**TEST-006**: **Integration Test - Validación falla si tipo=fixed y mínimo!=null**
- **Input**: `admin.service.create({ name: "Entrega", type: "fixed", rate: 30000, minimumBillingUnit: 1.0 })`
- **Expected**: Error de validación Zod con mensaje claro

**TEST-007**: **E2E Test - Flujo completo de cotización con servicio con mínimo**
- **Steps**: 
  1. Admin crea servicio tipo area con mínimo 1.0m²
  2. Usuario crea cotización con ventana pequeña (0.25m²)
  3. Agregar servicio a la cotización
- **Expected**: Subtotal del servicio = 1.0 * rate (no 0.25 * rate)

**TEST-008**: **Regression Test - Servicios existentes sin mínimo siguen funcionando**
- **Input**: Servicio existente (migrado con minimumBillingUnit=null)
- **Expected**: Cálculo normal sin cambios (usa cantidad calculada)

## 7. Risks & Assumptions

### Risks

**RISK-001**: **Migración de datos puede faltar en servicios existentes**
- **Mitigación**: Usar `DEFAULT NULL` en migración, no requiere actualización de registros
- **Severidad**: Baja

**RISK-002**: **Validación client-side puede diferir de server-side**
- **Mitigación**: Usar mismo schema Zod en frontend y backend, tests de integración
- **Severidad**: Media

**RISK-003**: **Usuarios pueden no entender el campo "unidad mínima"**
- **Mitigación**: Descripción clara en UI, tooltip explicativo, documentación en wiki
- **Severidad**: Baja

**RISK-004**: **Performance degradation por validación adicional**
- **Mitigación**: El cálculo es O(1) simple (Math.max), no afecta performance
- **Severidad**: Muy Baja

### Assumptions

**ASSUMPTION-001**: La mayoría de servicios NO necesitarán unidad mínima (campo permanecerá NULL)
- **Justificación**: Caso de uso específico para instalaciones/servicios que no escalan linealmente

**ASSUMPTION-002**: El valor de `minimumBillingUnit` será típicamente 1.0 (un metro cuadrado o metro lineal)
- **Justificación**: Basado en requerimiento del usuario (ejemplo de 500mm x 500mm)

**ASSUMPTION-003**: No se requiere validación de que `minimumBillingUnit` sea múltiplo de algo
- **Justificación**: Puede ser cualquier valor positivo (0.5, 1.0, 2.5, etc.)

**ASSUMPTION-004**: El campo NO necesita ser auditable (no tracking de cambios históricos)
- **Justificación**: Si se requiere auditoría, se implementará en feature separado

## 8. Related Specifications / Further Reading

- **Spec 011**: Admin Catalog Management - Define estructura actual de Service model
- **Spec 015**: Client Quote Wizard - Usa lógica de cálculo de servicios afectada
- **Spec 018**: Model Color Catalog - Similar pattern de campo opcional condicional
- **File**: `src/server/price/price-item.ts` - Lógica de cálculo existente
- **File**: `prisma/schema.prisma` - Schema actual de Service
- **External**: [Decimal.js Documentation](https://mikemcl.github.io/decimal.js/) - Para cálculos precisos
- **External**: [Zod Conditional Validation](https://zod.dev/?id=refine) - Para validación condicional

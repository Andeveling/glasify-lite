# Comparación: Glass Data Structure - Antes vs Después

## 📊 ANTES (Estructura Actual)

```
┌─────────────────────────────────┐
│       GlassType (ACTUAL)        │
├─────────────────────────────────┤
│ id                              │
│ name                            │
│ purpose ⚠️ DEPRECATED           │
│ thicknessMm                     │
│ pricePerSqm ❌ SIN HISTORIAL    │
│ uValue                          │
│ isTempered ❌ BOOLEANO RÍGIDO   │
│ isLaminated ❌ BOOLEANO RÍGIDO  │
│ isLowE ❌ BOOLEANO RÍGIDO       │
│ isTripleGlazed ❌ BOOLEANO      │
│ ❌ SIN glassSupplierId          │
│ ❌ SIN isActive                 │
│ createdAt                       │
│ updatedAt                       │
└─────────────────────────────────┘
         │
         │ Many-to-Many
         ▼
┌─────────────────────────────────┐
│    GlassTypeSolution (OK)       │
├─────────────────────────────────┤
│ glassTypeId                     │
│ solutionId                      │
│ performanceRating               │
│ isPrimary                       │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│    GlassSolution (OK)           │
├─────────────────────────────────┤
│ key                             │
│ name / nameEs                   │
│ description                     │
│ icon                            │
│ sortOrder                       │
│ isActive                        │
└─────────────────────────────────┘
```

### ❌ Problemas:
1. **Sin proveedor**: No sabes de dónde viene cada cristal
2. **Características rígidas**: Agregar nueva = ALTER TABLE
3. **Sin historial de precios**: No auditoría de cambios
4. **Sin control de activos**: No puedes descatalogar temporalmente
5. **Campo deprecated**: `purpose` duplica funcionalidad de `GlassTypeSolution`

---

## ✅ DESPUÉS (Estructura Propuesta)

```
┌──────────────────────────────────┐
│     GlassSupplier (NUEVO)        │
├──────────────────────────────────┤
│ id                               │
│ name        (Guardian, etc.)     │
│ code        (GRD, SGG, etc.)     │
│ country                          │
│ website                          │
│ contactEmail                     │
│ contactPhone                     │
│ isActive    ✅ Control visible   │
│ notes                            │
└──────────────────────────────────┘
         │ One-to-Many
         ▼
┌──────────────────────────────────┐
│      GlassType (MEJORADO)        │
├──────────────────────────────────┤
│ id                               │
│ glassSupplierId ✅ NUEVO         │
│ name                             │
│ sku             ✅ NUEVO         │
│ thicknessMm                      │
│ description     ✅ NUEVO         │
│ pricePerSqm                      │
│ uValue                           │
│ solarFactor     ✅ NUEVO         │
│ lightTransmission ✅ NUEVO       │
│ isActive        ✅ NUEVO         │
│ lastReviewDate  ✅ NUEVO         │
│ ❌ purpose      REMOVIDO         │
│ ❌ isTempered   REMOVIDO         │
│ ❌ isLaminated  REMOVIDO         │
│ ❌ isLowE       REMOVIDO         │
│ ❌ isTripleGlazed REMOVIDO       │
└──────────────────────────────────┘
         │              │
         │ Many-to-Many │ One-to-Many
         ▼              ▼
┌──────────────────┐  ┌────────────────────────────┐
│ GlassTypeSolution│  │ GlassTypePriceHistory (NEW)│
│                  │  ├────────────────────────────┤
│ (Sin cambios)    │  │ glassTypeId                │
│                  │  │ pricePerSqm                │
└──────────────────┘  │ reason                     │
         │            │ effectiveFrom              │
         ▼            │ createdBy                  │
┌──────────────────┐  │ ✅ Auditoría completa      │
│  GlassSolution   │  └────────────────────────────┘
│  (Sin cambios)   │
└──────────────────┘
         
         Many-to-Many
┌──────────────────────────────────┐
│ GlassTypeCharacteristic (NUEVO)  │
├──────────────────────────────────┤
│ glassTypeId                      │
│ characteristicId                 │
│ value           ✅ Flexible      │
│ certification   ✅ Rastreable    │
│ notes                            │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   GlassCharacteristic (NUEVO)    │
├──────────────────────────────────┤
│ id                               │
│ key         (tempered, etc.)     │
│ name / nameEs                    │
│ description                      │
│ category    (safety, thermal)    │
│ isActive                         │
│ sortOrder                        │
│ ✅ Extensible sin migraciones    │
└──────────────────────────────────┘
```

### ✅ Mejoras:
1. **GlassSupplier**: Proveedores centralizados (Guardian, Saint-Gobain, etc.)
2. **GlassCharacteristic**: Características flexibles y extensibles
3. **GlassTypePriceHistory**: Auditoría completa de cambios de precio
4. **isActive en GlassType**: Control de catálogo sin eliminar datos
5. **Más propiedades técnicas**: solarFactor, lightTransmission, etc.
6. **SKU tracking**: Rastrear códigos de fabricante

---

## 🔍 Ejemplos de Uso

### Antes (Actual)
```typescript
// ❌ Buscar cristales templados (rígido)
const tempered = await db.glassType.findMany({
  where: { isTempered: true }
});

// ❌ No puedes saber el proveedor
// ❌ No hay historial de precios
// ❌ Agregar nueva característica = migración
```

### Después (Propuesto)
```typescript
// ✅ Buscar cristales templados (flexible)
const tempered = await db.glassType.findMany({
  where: {
    characteristics: {
      some: { characteristic: { key: 'tempered' } }
    }
  },
  include: {
    glassSupplier: true,  // ✅ Conoces el proveedor
    characteristics: {    // ✅ Todas las características
      include: { characteristic: true }
    }
  }
});

// ✅ Obtener historial de precios
const history = await db.glassTypePriceHistory.findMany({
  where: { glassTypeId: 'xxx' },
  orderBy: { effectiveFrom: 'desc' }
});

// ✅ Filtrar por proveedor
const guardianGlasses = await db.glassType.findMany({
  where: { glassSupplier: { code: 'GRD' } }
});

// ✅ Agregar nueva característica sin migración
await db.glassCharacteristic.create({
  data: {
    key: 'acoustic_insulation',
    name: 'Acoustic Insulation',
    nameEs: 'Aislamiento Acústico',
    category: 'acoustic'
  }
});
```

---

## 📊 Comparación de Métricas

| Aspecto                  | Antes                  | Después                  |
| ------------------------ | ---------------------- | ------------------------ |
| **Proveedores**          | ❌ No rastreados        | ✅ Tabla dedicada         |
| **Características**      | ❌ 4 booleanos fijos    | ✅ Infinitas, extensibles |
| **Precio histórico**     | ❌ Sin auditoría        | ✅ Tabla de historial     |
| **Control catálogo**     | ❌ Solo DELETE          | ✅ Campo isActive         |
| **Propiedades técnicas** | 2 (uValue, thickness)  | 5+ (solar, light, etc.)  |
| **Extensibilidad**       | ❌ Requiere migraciones | ✅ Sin cambios de schema  |
| **Mantenibilidad**       | ⚠️ Media                | ✅ Alta                   |
| **Queries complejas**    | ⚠️ Limitadas            | ✅ Muy flexibles          |

---

## 🎯 Recomendación

**Implementar en fases**:
1. ✅ **Fase 1** (no breaking): Agregar nuevas tablas y campos
2. ✅ **Fase 2** (coexistencia): Migrar datos, mantener ambos sistemas
3. ✅ **Fase 3** (validación): Testear en desarrollo
4. ✅ **Fase 4** (limpieza): Remover campos deprecated

**Tiempo estimado**: 2-3 sprints
**Riesgo**: Bajo (migración incremental)
**ROI**: Alto (flexibilidad + auditabilidad + mantenibilidad)

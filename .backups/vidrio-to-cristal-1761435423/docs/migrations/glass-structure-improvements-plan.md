# Plan de Mejora: Estructura de Datos de Glass

**Fecha**: 2025-10-14  
**Estado**: 📋 Propuesta  
**Prioridad**: Media

---

## 🎯 Objetivos

1. **Eliminar redundancias**: Remover campo `purpose` deprecated
2. **Normalizar características**: Extraer booleanos a tabla flexible
3. **Mejorar trazabilidad**: Agregar proveedores y historial de precios
4. **Optimizar consultas**: Índices estratégicos
5. **Facilitar extensibilidad**: Arquitectura que permita agregar nuevas características sin cambios de schema

---

## 📊 Problemas Actuales

### ❌ Problema 1: Campo Deprecated `purpose` 
```prisma
model GlassType {
  purpose GlassPurpose  // ❌ Deprecated, duplica GlassTypeSolution
}
```
**Impacto**: 
- Confusión en el código (dos formas de clasificar vidrios)
- Queries que podrían usar una u otra
- Mantenimiento duplicado

### ❌ Problema 2: Características Físicas como Booleanos
```prisma
model GlassType {
  isTempered     Boolean  // ❌ Inflexible
  isLaminated    Boolean  // ❌ No permite valores adicionales
  isLowE         Boolean  // ❌ Agregar nuevas = ALTER TABLE
  isTripleGlazed Boolean  // ❌ No rastreables históricamente
}
```
**Impacto**:
- Cada nueva característica = migración de schema
- No puedes rastrear CUÁNDO se agregó/removió una característica
- No puedes agregar metadata (ej: "certificación X para Low-E")

### ❌ Problema 3: Sin Proveedor de Vidrio
```prisma
model GlassType {
  // ❌ No hay referencia a quién fabrica/provee el vidrio
  name String  // "Guardian Sun" - ¿de dónde?
}
```
**Impacto**:
- No puedes filtrar por proveedor de vidrio
- No rastreable para compras/inventario
- Precios no asociados a proveedor específico

### ❌ Problema 4: Sin Historial de Precios
```prisma
model GlassType {
  pricePerSqm Decimal  // ❌ Sin auditoría de cambios
}
```
**Impacto**:
- No sabes cuándo cambiaron los precios
- No puedes analizar tendencias de costos
- Recotizaciones antiguas no tienen contexto de precios históricos

### ❌ Problema 5: Sin Campo `isActive`
```prisma
model GlassType {
  // ❌ No hay forma de "descatalogar" sin eliminar
}
```
**Impacto**:
- No puedes ocultar vidrios temporalmente descontinuados
- DELETE no es opción (rompe integridad referencial con QuoteItem)

---

## ✅ Solución Propuesta

### Nueva Estructura de Tablas

```prisma
// ============================================
// 1. PROVEEDOR DE VIDRIO
// ============================================
/// Proveedores de vidrio (Guardian, Saint-Gobain, Pilkington, etc.)
model GlassSupplier {
  id              String      @id @default(cuid())
  /// Nombre comercial del proveedor
  name            String      @unique
  /// Código corto (ej: "GRD" para Guardian)
  code            String      @unique @db.VarChar(10)
  /// País de origen
  country         String?
  /// Sitio web oficial
  website         String?
  /// Email de contacto
  contactEmail    String?
  /// Teléfono de contacto
  contactPhone    String?
  /// Si el proveedor está activo para selección
  isActive        Boolean     @default(true)
  /// Notas adicionales
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  glassTypes      GlassType[]

  @@index([isActive])
  @@index([code])
}

// ============================================
// 2. TIPO DE VIDRIO (MEJORADO)
// ============================================
model GlassType {
  id                String                  @id @default(cuid())
  
  // Relación con proveedor
  glassSupplierId   String?
  glassSupplier     GlassSupplier?          @relation(fields: [glassSupplierId], references: [id], onDelete: SetNull)
  
  // Información básica
  name              String
  /// Código SKU o referencia del fabricante
  sku               String?                 @unique
  /// Espesor en milímetros
  thicknessMm       Int
  /// Descripción comercial
  description       String?
  
  // Precio
  /// Precio por metro cuadrado del vidrio (moneda de TenantConfig)
  pricePerSqm       Decimal                 @db.Decimal(12, 2)
  
  // Propiedades térmicas
  /// Transmitancia térmica (W/m²·K) — opcional si aplica
  uValue            Decimal?                @db.Decimal(5, 2)
  /// Factor solar (g-value) - % de energía solar que pasa
  solarFactor       Decimal?                @db.Decimal(4, 2)
  
  // Propiedades ópticas
  /// Transmisión de luz visible (%)
  lightTransmission Decimal?                @db.Decimal(4, 2)
  
  // Control
  /// Si el vidrio está disponible para cotización
  isActive          Boolean                 @default(true)
  /// Fecha de última revisión de datos técnicos
  lastReviewDate    DateTime?
  
  // Timestamps
  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt
  
  // Relaciones
  quoteItems        QuoteItem[]
  solutions         GlassTypeSolution[]
  characteristics   GlassTypeCharacteristic[]
  priceHistory      GlassTypePriceHistory[]
  
  @@index([glassSupplierId])
  @@index([isActive])
  @@index([thicknessMm])
  @@index([sku])
}

// ============================================
// 3. CARACTERÍSTICAS DE VIDRIO (NUEVA)
// ============================================
/// Catálogo de características físicas/técnicas disponibles
model GlassCharacteristic {
  id          String                    @id @default(cuid())
  /// Clave única (ej: 'tempered', 'laminated', 'low_e')
  key         String                    @unique
  /// Nombre en inglés
  name        String
  /// Nombre en español
  nameEs      String
  /// Descripción de la característica
  description String?
  /// Categoría (ej: 'safety', 'thermal', 'acoustic', 'coating')
  category    String
  /// Si la característica está activa
  isActive    Boolean                   @default(true)
  /// Orden de visualización
  sortOrder   Int                       @default(0)
  createdAt   DateTime                  @default(now())
  updatedAt   DateTime                  @updatedAt
  glassTypes  GlassTypeCharacteristic[]

  @@index([category])
  @@index([isActive])
}

/// Tabla pivote: Relación Many-to-Many entre GlassType y GlassCharacteristic
model GlassTypeCharacteristic {
  id                  String              @id @default(cuid())
  glassTypeId         String
  glassType           GlassType           @relation(fields: [glassTypeId], references: [id], onDelete: Cascade)
  characteristicId    String
  characteristic      GlassCharacteristic @relation(fields: [characteristicId], references: [id], onDelete: Cascade)
  /// Valor adicional si aplica (ej: "6mm" para espesor de lámina)
  value               String?
  /// Certificación o norma que respalda (ej: "EN 12150-1")
  certification       String?
  /// Notas adicionales
  notes               String?
  createdAt           DateTime            @default(now())

  @@unique([glassTypeId, characteristicId])
  @@index([glassTypeId])
  @@index([characteristicId])
}

// ============================================
// 4. HISTORIAL DE PRECIOS DE VIDRIO (NUEVA)
// ============================================
model GlassTypePriceHistory {
  id            String    @id @default(cuid())
  glassTypeId   String
  glassType     GlassType @relation(fields: [glassTypeId], references: [id], onDelete: Cascade)
  /// Precio por m² en el momento del cambio
  pricePerSqm   Decimal   @db.Decimal(12, 2)
  /// Razón del cambio
  reason        String?
  /// Fecha desde la cual este precio es efectivo
  effectiveFrom DateTime
  /// Usuario que realizó el cambio
  createdBy     String?
  createdByUser User?     @relation(fields: [createdBy], references: [id], onDelete: SetNull)
  createdAt     DateTime  @default(now())

  @@index([glassTypeId, effectiveFrom])
  @@index([createdBy])
}
```

---

## 🔄 Plan de Migración

### Fase 1: Agregar Nuevas Tablas (sin romper nada)
```sql
-- 1. Crear GlassSupplier
CREATE TABLE "GlassSupplier" (...);

-- 2. Crear GlassCharacteristic
CREATE TABLE "GlassCharacteristic" (...);

-- 3. Crear GlassTypeCharacteristic
CREATE TABLE "GlassTypeCharacteristic" (...);

-- 4. Crear GlassTypePriceHistory
CREATE TABLE "GlassTypePriceHistory" (...);
```

### Fase 2: Agregar Campos a GlassType
```sql
-- Agregar nuevos campos
ALTER TABLE "GlassType" ADD COLUMN "glassSupplierId" TEXT;
ALTER TABLE "GlassType" ADD COLUMN "sku" TEXT;
ALTER TABLE "GlassType" ADD COLUMN "description" TEXT;
ALTER TABLE "GlassType" ADD COLUMN "solarFactor" DECIMAL(4,2);
ALTER TABLE "GlassType" ADD COLUMN "lightTransmission" DECIMAL(4,2);
ALTER TABLE "GlassType" ADD COLUMN "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "GlassType" ADD COLUMN "lastReviewDate" TIMESTAMP;
```

### Fase 3: Migrar Datos Existentes
```sql
-- Migrar booleanos a características
INSERT INTO "GlassTypeCharacteristic" (id, "glassTypeId", "characteristicId", "createdAt")
SELECT 
  gen_random_uuid(),
  id,
  (SELECT id FROM "GlassCharacteristic" WHERE key = 'tempered'),
  NOW()
FROM "GlassType"
WHERE "isTempered" = true;

-- Repetir para isLaminated, isLowE, isTripleGlazed...
```

### Fase 4: Crear Registros Iniciales de Precio
```sql
-- Histórico inicial de precios
INSERT INTO "GlassTypePriceHistory" (id, "glassTypeId", "pricePerSqm", "reason", "effectiveFrom", "createdAt")
SELECT 
  gen_random_uuid(),
  id,
  "pricePerSqm",
  'Initial price record from migration',
  "createdAt",
  NOW()
FROM "GlassType";
```

### Fase 5: Limpiar Campos Viejos (después de validar)
```sql
-- Remover booleanos deprecated
ALTER TABLE "GlassType" DROP COLUMN "isTempered";
ALTER TABLE "GlassType" DROP COLUMN "isLaminated";
ALTER TABLE "GlassType" DROP COLUMN "isLowE";
ALTER TABLE "GlassType" DROP COLUMN "isTripleGlazed";

-- Remover purpose deprecated
ALTER TABLE "GlassType" DROP COLUMN "purpose";
```

---

## 📈 Beneficios

### ✅ Flexibilidad
- Agregar nuevas características sin cambiar schema
- Características con metadata (certificaciones, valores)

### ✅ Trazabilidad
- Historial completo de precios con auditoría
- Saber cuándo se agregó cada característica

### ✅ Mantenibilidad
- Proveedores centralizados y reutilizables
- Características reutilizables entre tipos de vidrio

### ✅ Performance
- Índices estratégicos en campos de búsqueda común
- Queries optimizadas por categoría

### ✅ Escalabilidad
- Fácil agregar más proveedores
- Fácil agregar más características técnicas
- Preparado para multi-tenant si es necesario

---

## 📝 Queries Ejemplo Post-Migración

### Buscar vidrios por característica
```typescript
const temperedGlasses = await db.glassType.findMany({
  where: {
    characteristics: {
      some: {
        characteristic: { key: 'tempered' }
      }
    },
    isActive: true
  },
  include: {
    glassSupplier: true,
    characteristics: { include: { characteristic: true } }
  }
});
```

### Obtener historial de precios
```typescript
const priceHistory = await db.glassTypePriceHistory.findMany({
  where: { glassTypeId: 'xxx' },
  orderBy: { effectiveFrom: 'desc' },
  include: { createdByUser: true }
});
```

### Filtrar por proveedor
```typescript
const guardianGlasses = await db.glassType.findMany({
  where: {
    glassSupplier: { code: 'GRD' },
    isActive: true
  }
});
```

---

## ⚠️ Consideraciones

1. **Backward Compatibility**: Durante la migración, mantén ambos sistemas (booleanos + características) hasta validar
2. **Data Integrity**: Verifica que cada vidrio tenga al menos un proveedor después de migración
3. **Performance**: Agrega índices compuestos si queries específicas lo requieren
4. **UI Updates**: Actualizar formularios para usar el nuevo sistema de características

---

## 🚀 Próximos Pasos

1. [ ] Revisar y aprobar propuesta
2. [ ] Crear seed data para GlassCharacteristic
3. [ ] Crear seed data para GlassSupplier
4. [ ] Implementar Fase 1 (crear tablas)
5. [ ] Implementar Fase 2 (agregar campos)
6. [ ] Implementar Fase 3 (migrar datos)
7. [ ] Implementar Fase 4 (precio histórico)
8. [ ] Validar en desarrollo
9. [ ] Actualizar código y queries
10. [ ] Implementar Fase 5 (limpieza)
11. [ ] Deploy a producción

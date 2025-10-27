---
name: "US-006: Configurar servicios como incluidos u opcionales por modelo"
about: Flexibilidad para servicios incluidos o seleccionables por cliente
title: "US-006: Configurar servicios como incluidos u opcionales por modelo"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Admin  
**Quiero** definir si un servicio está incluido en el precio o es opcional  
**Para** vender ventanas con instalación garantizada o dejar que el cliente decida

---

## ✅ Criterios de Aceptación

- [ ] Al asociar un servicio a un modelo, puedo marcar "Incluido en el precio" (checkbox)
- [ ] Servicios incluidos se suman al precio base sin mostrarse como opción al cliente
- [ ] Servicios opcionales aparecen como checkboxes en el formulario de cotización
- [ ] En el PDF:
  - Servicios incluidos: se muestran en sección "Incluye" con precio $0 o se ocultan (configurable)
  - Servicios opcionales: aparecen solo si el cliente los seleccionó

---

## 📝 Ejemplo de Uso

**Modelo: Ventana Corrediza PVC Rehau 1200x1500**
- Servicio "Instalación Básica": **Incluido** (precio base aumenta automáticamente)
  - No aparece en formulario del cliente
  - Se suma al precio automáticamente
  - En PDF: "INCLUYE: Instalación básica"

- Servicio "Templado de Vidrio": **Opcional** (cliente decide)
  - Aparece como checkbox en formulario
  - Solo se suma si cliente lo selecciona
  - En PDF: "Templado de Vidrio: +$150,000" (si fue seleccionado)

---

## 🔧 Notas Técnicas

**Actualización Prisma Schema:**
```prisma
model ModelService {
  id String @id @default(cuid())
  modelId String
  model Model @relation(fields: [modelId], references: [id], onDelete: Cascade)
  
  serviceId String
  service Service @relation(fields: [serviceId], references: [id])
  
  isIncluded Boolean @default(false) // NUEVO: true = incluido, false = opcional
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([modelId, serviceId])
  @@index([modelId])
}
```

**Pricing Engine (Modificado):**
```typescript
function calculateItemPrice(item: QuoteItem): {
  basePrice: number
  includedServices: Service[]
  optionalServices: Service[]
  total: number
} {
  const includedServices = item.model.services.filter(s => s.isIncluded)
  const optionalServices = item.model.services.filter(s => !s.isIncluded)
  
  // Sumar servicios incluidos automáticamente
  const includeTotal = includedServices.reduce((sum, s) => sum + calculateServiceCost(s), 0)
  
  // Sumar solo servicios opcionales seleccionados por cliente
  const optionalTotal = item.selectedServices
    .filter(s => !s.isIncluded)
    .reduce((sum, s) => sum + calculateServiceCost(s), 0)
  
  return {
    basePrice: calculateBase(item),
    includedServices,
    optionalServices,
    total: basePrice + includeTotal + optionalTotal
  }
}
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Agregar campo `isIncluded` a `ModelService`
- [ ] Migración Prisma
- [ ] Actualizar pricing engine
- [ ] Endpoint tRPC: actualizar `admin.models.get` para incluir `isIncluded`
- [ ] Endpoint tRPC: `admin.services.toggleIncluded`

### Frontend
- [ ] Admin: toggle "Incluido en el precio" al asociar servicio a modelo
- [ ] Catálogo: ocultar servicios incluidos del formulario
- [ ] Budget Cart: mostrar servicios opcionales como checkboxes
- [ ] Validation: no permitir deseleccionar servicios incluidos

### Pricing Engine
- [ ] Refactor: separar cálculo de servicios incluidos vs opcionales
- [ ] Performance: <200ms para cálculo completo

### PDF
- [ ] Sección "INCLUYE:" para servicios con `isIncluded = true`
- [ ] Mostrar como "Incluido" con precio $0
- [ ] Sección "Servicios Adicionales" para opcionales seleccionados

### Testing
- [ ] Unit: cálculo de precios con servicios incluidos
- [ ] Integration: CRUD de ModelService con isIncluded
- [ ] E2E: flujo completo de cotización con servicios

---

## 🎯 Métricas de Éxito

- Servicios incluidos se suman correctamente (+0 errores)
- Precios se recalculan en <200ms
- PDF muestra correctamente servicios incluidos vs opcionales
- 0 confusión en UI (cliente entiende qué está incluido)

---

## 📚 Referencias

- Épica: Servicios Incluidos vs Opcionales
- Sprint: 1 (Alta Prioridad)
- Estimación: **5 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-007: Wizard minimalista (integración de servicios)
- US-015: Estado "Enviada al Cliente" (mostrar en PDF final)

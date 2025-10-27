---
name: "US-013: Estado 'Estimado del Sistema' para cotizaciones iniciales"
about: Marcar cotizaciones del sistema como estimadas
title: "US-013: Estado 'Estimado del Sistema' para cotizaciones iniciales"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Cliente final  
**Quiero** que mi cotización inicial se marque claramente como estimado  
**Para** entender que es un precio preliminar sujeto a revisión comercial

---

## ✅ Criterios de Aceptación

- [ ] Al crear una cotización desde el Budget Cart, el estado inicial es "Estimado del Sistema"
- [ ] El PDF generado muestra claramente en el header:
  ```
  COTIZACIÓN ESTIMADA
  Este es un precio preliminar. Nuestro equipo comercial lo contactará
  para confirmar detalles y entregarle su cotización final.
  ```
- [ ] En My Quotes, las cotizaciones estimadas tienen un badge naranja distintivo
- [ ] El cliente NO puede editar cotizaciones en este estado (solo ver/exportar)

---

## 🔧 Notas Técnicas

**Enums de Estado (Actualizado):**
```prisma
enum QuoteStatus {
  SYSTEM_ESTIMATE // Nuevo (reemplaza "DRAFT")
  COMMERCIAL_REVIEW // Nuevo
  SENT_TO_CLIENT
  CANCELLED
  // Futuro: WON, LOST
}
```

**Migración:**
```sql
-- Renombrar valores en enum (depende del DB)
UPDATE Quote SET status = 'SYSTEM_ESTIMATE' WHERE status = 'DRAFT';
```

**Validación Zod:**
```typescript
const quoteStatusSchema = z.enum([
  'SYSTEM_ESTIMATE',
  'COMMERCIAL_REVIEW',
  'SENT_TO_CLIENT',
  'CANCELLED',
]);
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Actualizar enum Quote Status en Prisma
- [ ] Migración de datos (draft → system_estimate)
- [ ] Actualizar validación Zod
- [ ] Endpoint tRPC: crear cotización con estado SYSTEM_ESTIMATE

### Frontend
- [ ] Badge visual: naranja para SYSTEM_ESTIMATE
- [ ] My Quotes: mostrar estado con ícono/color
- [ ] Deshabilitar edición para estado SYSTEM_ESTIMATE
- [ ] Mostrar solo botones: Ver, Exportar PDF, Contactar

### PDF
- [ ] Template: agregar disclaimer en header
- [ ] Color: naranja o rojo para destacar "ESTIMADA"
- [ ] Texto claro sobre revisión comercial

### Testing
- [ ] Unit: validación de estados
- [ ] E2E: crear cotización → state = SYSTEM_ESTIMATE

---

## 🎯 Métricas de Éxito

- 100% de cotizaciones nuevas tienen estado SYSTEM_ESTIMATE
- Disclaimer visible en PDF
- 0 confusión del cliente (entiende que es estimado)

---

## 📚 Referencias

- Épica: Nuevo Flujo de Estados de Cotización
- Sprint: 1 (Alta Prioridad)
- Estimación: **3 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-014: Estado "En Revisión Comercial"
- US-015: Estado "Enviada al Cliente"

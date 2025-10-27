---
name: "US-014: Estado 'En Revisión Comercial' para ajustes del vendedor"
about: Transición de estado para cotización bajo revisión
title: "US-014: Estado 'En Revisión Comercial' para ajustes del vendedor"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Comercial  
**Quiero** marcar una cotización como "En Revisión" mientras afino precios y transporte  
**Para** que el cliente sepa que estoy trabajando en su solicitud

---

## ✅ Criterios de Aceptación

- [ ] Puedo cambiar el estado de "Estimado del Sistema" a "En Revisión Comercial"
- [ ] Al cambiar el estado, puedo agregar notas internas (no visibles para el cliente)
- [ ] El cliente ve en My Quotes: "Tu cotización está siendo revisada por nuestro equipo"
- [ ] Puedo editar todos los campos: precios, servicios, transporte, descuentos
- [ ] El sistema registra timestamp de inicio de revisión

---

## 📝 Workflow

```
Estimado del Sistema → En Revisión Comercial → Enviada al Cliente
         ↓
    (automático)        (comercial)           (comercial)
    desde Budget      cambia estado          completa cambios
```

---

## 🔧 Notas Técnicas

**Campos en Quote:**
```prisma
model Quote {
  // Campo nuevo:
  commercialReviewNotes String? // Notas internas (no visibles para cliente)
  commercialReviewStartedAt DateTime? // Timestamp de inicio
  
  // Otros campos existentes...
}
```

**Endpoint tRPC:**
```typescript
// quotes.updateStatus
interface UpdateStatusInput {
  quoteId: string
  newStatus: QuoteStatus
  internalNotes?: string // para state = COMMERCIAL_REVIEW
}
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Agregar campos a Quote
- [ ] Migración Prisma
- [ ] Endpoint: `quotes.updateStatus` (validar permisos)
- [ ] Validar transiciones permitidas (SYSTEM_ESTIMATE → COMMERCIAL_REVIEW)
- [ ] Registrar timestamp automáticamente

### Frontend
- [ ] Botón "Revisar" en cotización (Admin/Comercial)
- [ ] Modal: cambio de estado + textarea de notas
- [ ] Validación: al cambiar a COMMERCIAL_REVIEW, el comercial se asigna automáticamente (si no estaba)
- [ ] Indicador visual de "En Revisión" (badge azul, spinner suave)

### My Quotes
- [ ] Para cliente: mostrar mensaje "Tu cotización está siendo revisada..."
- [ ] Para comercial: mostrar notas internas (privado)

### Permissions
- [ ] Solo Admin o comercial asignado puede cambiar estado
- [ ] Cliente NO puede ver notas internas

### Testing
- [ ] Unit: validación de transiciones
- [ ] E2E: cambiar estado con notas

---

## 🎯 Métricas de Éxito

- Comercial puede cambiar estado en <1 min
- Cliente recibe notificación (futuro) de que su cotización está en revisión
- 100% de cotizaciones pasan por COMMERCIAL_REVIEW antes de enviarse

---

## 📚 Referencias

- Épica: Nuevo Flujo de Estados de Cotización
- Sprint: 1 (Alta Prioridad)
- Estimación: **5 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-013: Estado "Estimado del Sistema"
- US-015: Estado "Enviada al Cliente"

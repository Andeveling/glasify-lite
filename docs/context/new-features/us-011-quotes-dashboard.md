---
name: "US-011: Dashboard de cotizaciones para Admin/Comercial"
about: Vista de tabla servidor para gestionar todas las cotizaciones
title: "US-011: Dashboard de cotizaciones para Admin/Comercial"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Admin o Comercial  
**Quiero** ver todas las cotizaciones en una tabla con información relevante  
**Para** gestionarlas eficientemente y priorizar seguimiento

---

## ✅ Criterios de Aceptación

- [ ] Tabla server-side con columnas:
  - # (ID secuencial de cotización)
  - Fecha de creación
  - Cliente/Proyecto (nombre + ciudad)
  - Total (precio con formato de moneda)
  - Estado (chip visual: Pendiente, En Revisión, Enviada, Cancelada)
  - Responsable (comercial asignado, si aplica)
  - Acciones (Ver, Editar, Exportar PDF, Eliminar)
- [ ] Filtros:
  - Por estado (multi-select)
  - Rango de fechas (desde-hasta)
  - Búsqueda por proyecto/cliente/ciudad (debounced 300ms)
  - Ordenamiento por columna (fecha, total, estado)
- [ ] Paginación (20 cotizaciones por página)
- [ ] Performance: <2s carga (100 cotizaciones)

---

## 📊 Diseño de Tabla

```
┌─────────────────────────────────────────────────────────────┐
│ Cotizaciones                                                │
├─────────────────────────────────────────────────────────────┤
│ Filtros: [Estado ▼] [Fecha ▼] [Búsqueda________] [🔍]      │
├──┬──────────────┬────────────┬──────────────┬────────┬──────┤
│#│ Fecha        │ Proyecto   │ Total        │ Estado │ ...  │
├──┼──────────────┼────────────┼──────────────┼────────┼──────┤
│1│ 2025-10-26   │Casa Pinos, │$1,500,000    │Enviada │●●●  │
│  │              │Chitré      │              │        │      │
├──┼──────────────┼────────────┼──────────────┼────────┼──────┤
│2│ 2025-10-25   │Oficina XYZ │$2,800,000    │En Rev. │●●●  │
│  │              │Panamá      │              │        │      │
└──┴──────────────┴────────────┴──────────────┴────────┴──────┘
[← Anterior] Página 1 de 5 [Siguiente →]
```

---

## 🔧 Notas Técnicas

**Endpoint tRPC:**
```typescript
// admin.quotes.list
interface ListQuotesInput {
  page: number // 1-indexed
  limit: number // 20 default
  status?: QuoteStatus[] // multi-select
  dateFrom?: Date
  dateTo?: Date
  search?: string // búsqueda por proyecto/cliente/ciudad
  sortBy?: 'createdAt' | 'total' | 'status'
  sortOrder?: 'asc' | 'desc'
}

interface ListQuotesOutput {
  quotes: QuoteWithRelations[]
  total: number
  pages: number
  currentPage: number
}
```

**SQL Query Optimization:**
- Índices en: `createdAt`, `status`, `projectCity`, `projectName`
- Eager load: User, QuoteItems, Model
- Usar `LIMIT` y `OFFSET` para paginación

**URL State Management:**
- Sincronizar filtros en URL: `/admin/quotes?page=1&status=sent&search=casa`
- Permitir compartir links con filtros aplicados

---

## 📝 Tareas de Implementación

### Backend
- [ ] Crear índices en Quote table
- [ ] Endpoint tRPC: `admin.quotes.list`
- [ ] Validación de permisos (solo admin/comercial)
- [ ] Optimización de queries (eager loading)
- [ ] Paginación eficiente

### Frontend
- [ ] Componente `QuotesTable.tsx` (Server Component + Client children)
- [ ] Componente `QuotesFilter.tsx` (filtros interactivos)
- [ ] Componente `QuotePagination.tsx`
- [ ] URL state synchronization
- [ ] Tabla responsive (scroll en mobile)

### Columns
- [ ] Número de cotización (único por tenant, secuencial)
- [ ] Fecha formateada (date-fns)
- [ ] Proyecto (nombre + ciudad)
- [ ] Total formateado con moneda del tenant
- [ ] Estado con chip visual (colores según estado)
- [ ] Comercial asignado
- [ ] Acciones (dropdown menu)

### Acciones
- [ ] Ver: link a detail view
- [ ] Editar: link a edit view
- [ ] Exportar PDF: download directo
- [ ] Eliminar: confirmación modal

### Testing
- [ ] E2E: flujo completo de tabla, filtros, paginación
- [ ] Performance: <2s con 100 cotizaciones

---

## 🎯 Métricas de Éxito

- Carga inicial: <2s con 100 cotizaciones
- Búsqueda debounced: <300ms
- Filtros funcionan correctamente
- Exportación PDF en <5s
- Usabilidad: SUS score 8/10+

---

## 📚 Referencias

- Épica: Vista Admin de Cotizaciones
- Sprint: 1 (Alta Prioridad)
- Estimación: **8 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-012: Asignar comercial (filtro en tabla)
- US-013-015: Estados de cotización (filtro y visualización)

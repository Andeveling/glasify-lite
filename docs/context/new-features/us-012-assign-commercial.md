---
name: "US-012: Asignar comercial a cotización"
about: Distribuir cotizaciones entre el equipo de ventas
title: "US-012: Asignar comercial a cotización"
labels: ["feature", "vitro-rojas", "media-prioridad", "sprint-2", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Admin  
**Quiero** asignar un comercial responsable a cada cotización  
**Para** distribuir el trabajo y tener trazabilidad de seguimiento

---

## ✅ Criterios de Aceptación

- [ ] En la vista de edición de cotización, puedo seleccionar un comercial de un dropdown
- [ ] Solo usuarios con rol "Comercial" aparecen en la lista
- [ ] El comercial asignado recibe notificación (email/in-app) de nueva cotización
- [ ] En el dashboard de cotizaciones, puedo filtrar por comercial responsable
- [ ] El audit trail registra quién asignó a quién y cuándo

---

## 🔧 Notas Técnicas

**Actualización Quote Model:**
```prisma
model Quote {
  assignedToUserId String?
  assignedToUser User? @relation("QuotesAssignedTo", fields: [assignedToUserId], references: [id], onDelete: SetNull)
  
  assignedAt DateTime?
  assignedBy String? // userId de quien hizo la asignación
}

model User {
  quotesAssignedTo Quote[] @relation("QuotesAssignedTo")
}
```

**Sistema de Roles:**
```prisma
enum UserRole {
  ADMIN
  COMMERCIAL // Nuevo rol
  CLIENT // Futuro
}

model User {
  role UserRole @default(COMMERCIAL)
}
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Agregar campo `assignedToUserId` a Quote
- [ ] Migración Prisma
- [ ] Crear rol "COMMERCIAL" en NextAuth
- [ ] Endpoint tRPC: `admin.quotes.assign`
- [ ] Validar: solo comercials pueden asignarse
- [ ] Audit logging: registrar asignación

### Frontend
- [ ] Combobox/Select de comerciales en editor de cotización
- [ ] Mostrar comercial asignado (actual)
- [ ] Dashboard: columna "Comercial" en tabla
- [ ] Filtro: "Asignado a" en dashboard

### Notifications
- [ ] Email al comercial: "Nueva cotización asignada: [Proyecto], $[Total]"
- [ ] In-app badge/notification (futuro)

### Permissions
- [ ] Solo Admin puede asignar
- [ ] Comercial asignado puede ver/editar su cotización
- [ ] Otros no pueden ver cotizaciones ajenas (RBAC)

---

## 🎯 Métricas de Éxito

- 100% de cotizaciones tienen comercial asignado
- Comerciales reciben notificación <1 min
- Filtro por comercial funciona correctamente

---

## 📚 Referencias

- Épica: Vista Admin de Cotizaciones
- Sprint: 2 (Media Prioridad)
- Estimación: **5 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-011: Dashboard de cotizaciones (integración)

---
name: "US-015: Estado 'Enviada al Cliente' con versión final"
about: Transición final de cotización con validaciones y notificación
title: "US-015: Estado 'Enviada al Cliente' con versión final"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Comercial  
**Quiero** marcar la cotización como "Enviada" cuando esté lista  
**Para** notificar al cliente que puede revisar su presupuesto final

---

## ✅ Criterios de Aceptación

- [ ] Solo puedo cambiar a "Enviada" si completé campos obligatorios:
  - Transporte calculado (o marcado como "No aplica")
  - Comercial asignado
  - Notas del comercial (opcional pero recomendado)
- [ ] Al cambiar a "Enviada":
  - Se genera PDF final automáticamente
  - Se envía email al cliente con link de descarga
  - Se bloquea edición de precios (solo notas adicionales)
- [ ] El PDF final NO tiene disclaimer de "estimado", muestra "COTIZACIÓN FORMAL"
- [ ] El sistema registra timestamp de envío

---

## 🔧 Notas Técnicas

**Campos en Quote:**
```prisma
model Quote {
  // Campos nuevos:
  sentToClientAt DateTime? // Timestamp de envío
  sentToClientBy String? // userId del comercial que envió
  sentToClientByUser User? @relation("SentToClientBy", fields: [sentToClientBy], references: [id])
  
  // Control de edición:
  allowEditsAfterSent Boolean @default(false) // Solo notas después de enviada
}
```

**Validaciones Previas:**
```typescript
// Antes de cambiar a SENT_TO_CLIENT:
const canSend = {
  hasShippingCost: quote.shippingCost != null || quote.shippingNotes?.includes("No aplica"),
  hasAssignedComercial: quote.assignedToUserId != null,
  hasTotalPrice: quote.items.length > 0
}
```

---

## 📧 Email Notificación

**Template de Email:**
```
Asunto: Tu cotización está lista - Vitro Rojas

¡Hola [nombre cliente]!

Tu cotización #[ID] está lista para descargar.

📋 Detalles:
- Proyecto: [project name]
- Total: $[formatted total]
- Modelo(s): [models list]
- Validez: [days] días

[BOTÓN: Descargar PDF]

¿Preguntas? Contacta a [comercial name] al [teléfono]
O escríbenos por WhatsApp: [link]

---
Vitro Rojas - Especialistas en ventanas
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Agregar campos a Quote
- [ ] Migración Prisma
- [ ] Endpoint: `quotes.sendToClient`
  - Validar prerequisitos
  - Generar PDF final
  - Enviar email
  - Cambiar estado y registrar timestamp
- [ ] Transaccionalidad: rollback si falla email
- [ ] Email service integration (nodemailer, Resend, etc.)

### Frontend
- [ ] Botón "Enviar al Cliente" (solo si validaciones pasaron)
- [ ] Modal de confirmación con:
  - Resumen de cotización
  - Email del cliente (confirmar)
  - Notas internas (vista previa)
- [ ] Bloquear edición de precios después de "Enviada"
- [ ] Permitir agregar notas adicionales después

### PDF
- [ ] Header: "COTIZACIÓN FORMAL" (vs "COTIZACIÓN ESTIMADA")
- [ ] Sin disclaimer de "preliminar"
- [ ] Incluir fecha de validez
- [ ] Footer: "Documento oficial - Vitro Rojas"
- [ ] Generar automáticamente en S3/Blob

### Permissions
- [ ] Solo Admin o comercial asignado puede enviar
- [ ] Cliente NO puede editar después

### Notifications
- [ ] Email al cliente con PDF
- [ ] Notificación in-app para comercial (confirmación)
- [ ] Opcionalmente: SMS/WhatsApp de notificación

---

## 🎯 Métricas de Éxito

- 100% de cotizaciones enviadas incluyen email al cliente
- PDF se genera en <5s
- 0 errores de transaccionalidad (sin PDF = sin state change)
- Cliente recibe email en <2 minutos

---

## 📚 Referencias

- Épica: Nuevo Flujo de Estados de Cotización
- Sprint: 1 (Alta Prioridad)
- Estimación: **5 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-013: Estado "Estimado del Sistema"
- US-014: Estado "En Revisión Comercial"
- US-005: Costo de transporte (requisito previo)

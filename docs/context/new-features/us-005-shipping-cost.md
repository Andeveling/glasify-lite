---
name: "US-005: Comercial agrega costo de transporte manualmente"
about: Campo para que comercial calcule y agregue transporte a cotización
title: "US-005: Comercial agrega costo de transporte manualmente"
labels: ["feature", "vitro-rojas", "media-prioridad", "sprint-2", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Comercial/Vendedor  
**Quiero** agregar el costo de transporte calculado manualmente a la cotización  
**Para** enviar al cliente el presupuesto completo con todos los costos

---

## ✅ Criterios de Aceptación

- [ ] En la vista de edición de cotización, tengo un campo "Costo de Transporte" (monto fijo)
- [ ] Puedo agregar notas del comercial sobre el cálculo (ej. "Transporte a Chitré: 80km, instalación en piso 5")
- [ ] El transporte aparece como línea separada en el PDF final
- [ ] El sistema registra quién y cuándo agregó el transporte (audit trail)

---

## 🔧 Notas Técnicas

**Actualización de Quote Model:**
```prisma
model Quote {
  // Campos nuevos para transporte:
  shippingCost Decimal? @db.Decimal(12, 2) // ej. 250000 (moneda del tenant)
  shippingNotes String? // ej. "Transporte a Chitré: 80km, instalación en piso 5"
  shippingCalculatedBy String? // userId de quien agregó el transporte
  shippingCalculatedAt DateTime? // timestamp
  
  // Relación con User para audit
  shippingCalculatedByUser User? @relation("ShippingCalculatedBy", fields: [shippingCalculatedBy], references: [id], onDelete: SetNull)
  
  // Otros campos existentes...
}

model User {
  // Relación inversa:
  quotesShippingCalculated Quote[] @relation("ShippingCalculatedBy")
}
```

**Validación Zod:**
```typescript
const updateQuoteShippingSchema = z.object({
  shippingCost: z.number().min(0).optional(),
  shippingNotes: z.string().max(500).optional(),
});
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Migración Prisma para nuevos campos
- [ ] Actualizar schema
- [ ] Endpoint tRPC: `quotes.updateShipping`
- [ ] Validación: solo comercial asignado o admin puede editar
- [ ] Audit logging: registrar cambios en `shippingCost`

### Frontend
- [ ] Formulario de edición de cotización: sección de transporte
- [ ] Input de monto (con máscara de moneda)
- [ ] Campo de notas (textarea)
- [ ] Visualización de quién y cuándo agregó transporte
- [ ] Validación en tiempo real

### PDF
- [ ] Template: agregar línea de transporte en desglose
  ```
  Subtotal:        $1,500,000
  Servicios:       $  200,000
  Transporte:      $  250,000  ← NUEVA LÍNEA
  ─────────────────────────────
  TOTAL:           $1,950,000
  ```
- [ ] Mostrar notas de transporte si existen

### Permissions
- [ ] Solo Admin o comercial asignado puede editar transporte
- [ ] Cliente NO puede ver/editar este campo (excepto en PDF final)

---

## 🎯 Métricas de Éxito

- Tiempo de entrada de transporte: <1 minuto
- 100% de cotizaciones enviadas incluyen transporte o nota "No aplica"
- Audit trail completo (quién, cuándo, qué)

---

## 📚 Referencias

- Épica: Gestión de Transporte
- Sprint: 2 (Media Prioridad)
- Estimación: **3 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-004: Indicar transporte post-cotización
- US-014: Estado "En Revisión Comercial"
- US-015: Estado "Enviada al Cliente"

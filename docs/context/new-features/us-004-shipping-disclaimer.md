---
name: "US-004: Indicar que transporte se calcula post-cotización"
about: Disclaimer claro sobre cálculo de transporte
title: "US-004: Indicar que transporte se calcula post-cotización"
labels: ["feature", "vitro-rojas", "media-prioridad", "sprint-2", "frontend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Cliente final  
**Quiero** saber desde el inicio que el transporte no está incluido en el precio  
**Para** no tener sorpresas al recibir la cotización final del comercial

---

## ✅ Criterios de Aceptación

- [ ] En la página de catálogo, hay un aviso claro: "El transporte se cotiza después de la revisión comercial"
- [ ] En el Budget Cart, se muestra un callout informativo antes del total general
- [ ] En el PDF de cotización, hay una sección "Nota sobre transporte" con texto configurable por tenant
- [ ] El aviso se puede personalizar desde TenantConfig (campo `shippingDisclaimer`)

---

## 📝 Ejemplo de Texto

```
📦 Transporte e Instalación
El costo de transporte e instalación se calculará según su ubicación específica
y complejidad del proyecto. Nuestro equipo comercial lo contactará para afinar
estos detalles y entregarle su cotización final.
```

---

## 🔧 Notas Técnicas

**Actualización TenantConfig:**
```prisma
model TenantConfig {
  // Campo nuevo:
  shippingDisclaimer String @default("El transporte se cotiza después de la revisión comercial")
  
  // Otros campos existentes...
}
```

**Ubicaciones del Aviso:**
1. **Página de Catálogo**: Banner informativo (top o bottom)
2. **Budget Cart**: Callout/Alert box antes del subtotal
3. **PDF**: Sección separada en footer o página 1

**Componentes Requeridos:**
- `ShippingDisclaimer.tsx` (componente reutilizable)
- `ShippingAlert.tsx` (variante para Budget Cart)

---

## 📝 Tareas de Implementación

### Backend
- [ ] Agregar campo `shippingDisclaimer` a TenantConfig
- [ ] Migración Prisma
- [ ] Endpoint tRPC para actualizar disclaimer (admin)

### Frontend
- [ ] Componente `ShippingDisclaimer.tsx`
- [ ] Integración en página de catálogo
- [ ] Integración en Budget Cart
- [ ] Estilos responsive

### PDF
- [ ] Template: agregar sección de disclaimer
- [ ] Usar valor de TenantConfig si existe

### Admin Panel
- [ ] Campo de edición para texto personalizado (futuro)

---

## 🎯 Métricas de Éxito

- Avisos visible en 100% de las páginas relevantes
- 0 clientes reportan sorpresa por cargo de transporte
- Texto claramente legible y accesible (WCAG AA)

---

## 📚 Referencias

- Épica: Gestión de Transporte
- Sprint: 2 (Media Prioridad)
- Estimación: **1 punto**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-005: Comercial agrega costo de transporte

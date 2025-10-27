---
name: "US-008: Campo ubicación de ventana en ítem de cotización"
about: Agregar información de dónde irá cada ventana
title: "US-008: Campo ubicación de ventana en ítem de cotización"
labels: ["feature", "vitro-rojas", "media-prioridad", "sprint-2", "frontend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Comercial  
**Quiero** saber dónde irá cada ventana del proyecto del cliente  
**Para** hacer recomendaciones específicas (ej. vidrio acústico en alcoba principal)

---

## ✅ Criterios de Aceptación

- [ ] El ítem de cotización tiene campo `roomLocation` (ej. "Alcoba principal", "Baño 2", "Sala")
- [ ] En el PDF, cada ítem muestra la ubicación claramente
- [ ] El campo es opcional pero recomendado (placeholder: "Ej. Alcoba principal")
- [ ] Las ubicaciones más comunes se sugieren en un dropdown (con opción de texto libre)

---

## 📝 Lista Sugerida de Ubicaciones

```
- Alcoba principal / Alcoba secundaria
- Sala / Comedor
- Cocina
- Baño principal / Baño secundario
- Oficina / Estudio
- Balcón / Terraza
- Escalera / Pasillo
- Otro (especificar)
```

---

## 🔧 Notas Técnicas

**Actualización Prisma Schema:**
```prisma
model QuoteItem {
  // Campo nuevo:
  roomLocation String? // ej. "Alcoba principal", "Baño 2"
  
  // Otros campos existentes...
}
```

**Validación Zod:**
```typescript
const quoteItemSchema = z.object({
  roomLocation: z.string().max(100).optional(),
  // ... otros campos
});
```

**Constantes:**
```typescript
export const ROOM_LOCATIONS = [
  'Alcoba principal',
  'Alcoba secundaria',
  'Sala / Comedor',
  'Cocina',
  'Baño principal',
  'Baño secundario',
  'Oficina / Estudio',
  'Balcón / Terraza',
  'Escalera / Pasillo',
] as const;
```

---

## 📝 Tareas de Implementación

### Backend
- [ ] Agregar campo `roomLocation` a `QuoteItem`
- [ ] Migración Prisma
- [ ] Actualizar validación Zod

### Frontend
- [ ] Componente `RoomLocationSelect.tsx`
- [ ] Combobox con sugerencias + opción de texto libre
- [ ] Integración en:
  - Formulario de edición de ítem
  - Budget Cart
  - Quote detail

### PDF
- [ ] Template: mostrar ubicación en cada ítem
  ```
  Ítem 1: Ventana Corrediza PVC Rehau
  Ubicación: Alcoba principal ← NUEVA LÍNEA
  Dimensiones: 1200mm × 1500mm
  ...
  ```

### Testing
- [ ] Unit: validación de ubicaciones
- [ ] E2E: agregar ubicación a ítem

---

## 🎯 Métricas de Éxito

- 100% de ítems tienen ubicación capturada
- Comercial puede hacer recomendaciones basadas en ubicación
- PDF muestra clara la ubicación de cada ventana

---

## 📚 Referencias

- Épica: Simplificación del Formulario
- Sprint: 2 (Media Prioridad)
- Estimación: **2 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-007: Wizard minimalista (integración)

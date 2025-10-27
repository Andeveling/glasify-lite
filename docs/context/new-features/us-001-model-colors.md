---
name: "US-001: Configurar colores disponibles por modelo"
about: Sistema de colores personalizados con recargos porcentuales
title: "US-001: Configurar colores disponibles por modelo"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Admin de Vitro Rojas  
**Quiero** configurar los colores disponibles para cada modelo de ventana/puerta  
**Para** ofrecer opciones personalizadas a mis clientes con recargos automáticos

---

## ✅ Criterios de Aceptación

- [ ] Puedo crear/editar/eliminar colores en el catálogo (ej. Blanco, Nogal, Antracita, Gris Titanio)
- [ ] Cada color tiene un nombre, código hexadecimal y recargo porcentual (ej. +15%)
- [ ] El recargo se define a nivel de modelo (diferentes modelos pueden tener diferentes recargos por color)
- [ ] Puedo marcar un color como "predeterminado" (sin recargo adicional)
- [ ] Los colores inactivos no se muestran en el catálogo público pero se mantienen en cotizaciones históricas

---

## 🔧 Notas Técnicas

**Modelo de Base de Datos:**
```prisma
model ModelColor {
  id String @id @default(cuid())
  modelId String
  model Model @relation(fields: [modelId], references: [id], onDelete: Cascade)
  
  name String // ej. "Nogal", "Antracita"
  hexCode String // ej. "#8B4513"
  surchargePercentage Float // ej. 15.0 para +15%
  isDefault Boolean @default(false)
  isActive Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([modelId, name])
  @@index([modelId])
}
```

**Consideraciones:**
- Crear relación Many-to-One: Model → ModelColor
- El recargo aplica solo al precio base del modelo (no incluye vidrio/servicios)
- Validación: `surchargePercentage` debe estar entre -100 y 500
- Solo un color puede ser `isDefault = true` por modelo

**Campos necesarios:**
- `name`, `hexCode`, `surchargePercentage`, `isDefault`, `isActive`

---

## 📝 Tareas de Implementación

### Backend
- [ ] Crear modelo Prisma `ModelColor`
- [ ] Migración de base de datos
- [ ] Endpoints tRPC:
  - `admin.models.colors.list` - Listar colores por modelo
  - `admin.models.colors.create` - Crear color
  - `admin.models.colors.update` - Actualizar color
  - `admin.models.colors.delete` - Eliminar color
  - `admin.models.colors.setDefault` - Marcar como predeterminado
- [ ] Validación con Zod para datos de color

### Frontend
- [ ] Interfaz admin para gestionar colores (tabla + formulario modal)
- [ ] Selector de color en formulario (input de tipo color)
- [ ] Vista previa de recargo en tiempo real
- [ ] Indicador visual de color predeterminado

### Testing
- [ ] Unit tests para validaciones de color
- [ ] Integration tests para endpoints tRPC
- [ ] E2E tests para flujo completo (crear, editar, eliminar)

---

## 🎯 Métricas de Éxito

- Capacidad de gestionar +20 colores por modelo sin degradación de performance
- Recalculación de precios en <200ms al cambiar color
- 0 errores en validación de datos de color

---

## 📚 Referencias

- Épica: Sistema de Colores para Modelos
- Sprint: 1 (Alta Prioridad)
- Estimación: **5 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-002: Seleccionar color en cotización del cliente
- US-007: Wizard minimalista para configurar ventana

---

## 📖 Notas Adicionales

Vitro Rojas requiere la capacidad de ofrecer colores personalizados (Blanco, Nogal, Antracita, Gris Titanio, etc.) con recargos porcentuales variables según el modelo. Esto permite diferenciar precios por cosmética sin modificar el precio base del modelo.

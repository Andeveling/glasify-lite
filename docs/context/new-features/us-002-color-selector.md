---
name: "US-002: Seleccionar color en cotización del cliente"
about: Selector visual de colores en el formulario de cotización con recargo automático
title: "US-002: Seleccionar color en cotización del cliente"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "frontend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Cliente final  
**Quiero** seleccionar el color de la ventana al configurar mi cotización  
**Para** ver el precio final con el recargo aplicado automáticamente

---

## ✅ Criterios de Aceptación

- [ ] Veo un selector visual de colores (chips con color real) en el formulario de cotización
- [ ] Al seleccionar un color, veo el recargo porcentual indicado (ej. "+15% Nogal")
- [ ] El precio total se recalcula automáticamente en <200ms
- [ ] El color seleccionado aparece en el PDF de cotización con una muestra visual
- [ ] Si no selecciono color, se aplica el color predeterminado sin recargo

---

## 🎨 Diseño UX

**Componente: ColorSelector**
```
┌─────────────────────────────────────┐
│ Selecciona el color de la ventana   │
├─────────────────────────────────────┤
│ ● Blanco         │ ● Nogal (+15%)   │
│ ● Antracita (+8%)│ ● Gris Titanio   │
│                  │   (+12%)         │
└─────────────────────────────────────┘

Precio: $1,200 + $180 (Nogal) = $1,380
```

**Características:**
- Chips de color con nombre y recargo
- Checkmark en el seleccionado
- Tooltip con desglose de precio
- En mobile: lista vertical con swatches más grandes
- Accesibilidad: ARIA labels, navegable con teclado

---

## 🔧 Notas Técnicas

**Componente React:**
```typescript
interface ColorSelectorProps {
  colors: ModelColor[]
  selectedColorId?: string
  onColorChange: (colorId: string) => void
  basePrice: number
}

export function ColorSelector(props: ColorSelectorProps) {
  // Implementación con Radix UI Select o custom component
}
```

**Integración con Pricing Engine:**
- Hook personalizado: `useCalculateQuotePrice()`
- Listener en cambio de color para recalcular total
- Debounce: no requerido (cálculo es local)
- Performance target: <200ms (incluye re-render)

**PDF Integration:**
- Agregar sección en `QuotePDF`: "Color: Nogal (+15%)"
- Mostrar swatch de color pequeño (20x20px) junto al nombre

---

## 📝 Tareas de Implementación

### Frontend
- [ ] Componente `ColorSelector.tsx` (atoms)
- [ ] Hook `useQuoteColor.ts` para manejo de estado
- [ ] Integración en `QuoteWizard` (Paso 1: Ubicación o Paso 2: Dimensiones)
- [ ] Estilos Tailwind CSS responsive
- [ ] Animación de selección (slide-in del recargo)

### Backend
- [ ] Endpoint modificado: `catalog.models.get` debe incluir `colors`
- [ ] Validación tRPC: color debe existir y estar activo para el modelo

### PDF
- [ ] Template: agregar línea de color en desglose de precios
- [ ] Swatch visual de color (pequeño)

### Testing
- [ ] Unit test: selección y recalculación
- [ ] Visual regression: ColorSelector en light/dark mode
- [ ] E2E: Playwright test para flujo completo

---

## 🎯 Métricas de Éxito

- Tiempo de selección: <1 segundo
- Recalculación de precio: <200ms
- Accesibilidad WCAG 2.1 AA (contraste, navegación teclado)
- 0 errores en PDF con color seleccionado

---

## 🔗 Dependencias

- **Bloqueante**: US-001 (Configurar colores por modelo)
- **Relacionada**: US-007 (Wizard minimalista)

---

## 📚 Referencias

- Épica: Sistema de Colores para Modelos
- Sprint: 1 (Alta Prioridad)
- Estimación: **3 puntos**
- Cliente: Vitro Rojas (Panamá)

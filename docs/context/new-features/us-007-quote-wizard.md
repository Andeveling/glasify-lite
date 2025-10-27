---
name: "US-007: Wizard minimalista para configurar ventana"
about: Formulario paso a paso para reducir carga cognitiva del cliente
title: "US-007: Wizard minimalista para configurar ventana"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "frontend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Cliente final  
**Quiero** un proceso simple paso a paso para cotizar  
**Para** no sentirme abrumado con demasiada información técnica

---

## ✅ Criterios de Aceptación

- [ ] El formulario de cotización es un wizard/stepper con 4 pasos:
  1. **Ubicación**: ¿Dónde irá la ventana? (Alcoba, Oficina, Baño, Sala, Cocina, etc.) - dropdown simple
  2. **Dimensiones**: Ancho × Alto (inputs numéricos con validación de límites)
  3. **Vidrio**: Selector visual de soluciones (térmico, acústico, seguridad) - tarjetas con íconos
  4. **Servicios** (solo los opcionales): Checkboxes con descripción corta
- [ ] Cada paso muestra el precio parcial actualizado
- [ ] Puedo volver atrás sin perder mis selecciones
- [ ] En mobile, el wizard es vertical; en desktop, horizontal con indicadores de progreso
- [ ] Al finalizar, veo resumen completo antes de agregar al Budget

---

## 🎨 Diseño UX

### Paso 1: Ubicación
```
┌─────────────────────────────────────┐
│ 1. ¿Dónde irá la ventana?      [1/4]│
├─────────────────────────────────────┤
│ Selecciona una ubicación:           │
│ ☐ Alcoba principal                  │
│ ☐ Alcoba secundaria                 │
│ ☐ Sala / Comedor                    │
│ ☐ Cocina                            │
│ ☐ Baño principal                    │
│ ☐ Oficina / Estudio                 │
│ ☐ Balcón / Terraza                  │
│ ☐ Otro (especificar)                │
└─────────────────────────────────────┘
[ATRÁS] [SIGUIENTE]
```

### Paso 2: Dimensiones
```
┌─────────────────────────────────────┐
│ 2. Dimensiones (mm)            [2/4]│
├─────────────────────────────────────┤
│ Ancho:                              │
│ [____] mm  (mín: 500, máx: 3000)    │
│                                     │
│ Alto:                               │
│ [____] mm  (mín: 500, máx: 3000)    │
│                                     │
│ Subtotal: $500,000                  │
└─────────────────────────────────────┘
[ATRÁS] [SIGUIENTE]
```

### Paso 3: Vidrio
```
┌─────────────────────────────────────┐
│ 3. Vidrio                      [3/4]│
├─────────────────────────────────────┤
│ ¿Cuál es tu prioridad?              │
│                                     │
│ ┌─────────────┐  ┌─────────────┐   │
│ │ 🔥 Térmico  │  │ 🔊 Acústico │   │
│ │ Aislamiento │  │ Reduce      │   │
│ │ energético  │  │ ruido       │   │
│ └─────────────┘  └─────────────┘   │
│                                     │
│ ┌─────────────┐  ┌─────────────┐   │
│ │ ☀️  Solar   │  │ 🔒 Seguridad│   │
│ │ Control de  │  │ Vidrio      │   │
│ │ temperatura │  │ templado    │   │
│ └─────────────┘  └─────────────┘   │
│                                     │
│ Total: $800,000                     │
└─────────────────────────────────────┘
[ATRÁS] [SIGUIENTE]
```

### Paso 4: Servicios (Opcionales)
```
┌─────────────────────────────────────┐
│ 4. Servicios Adicionales       [4/4]│
├─────────────────────────────────────┤
│ ☑ Instalación (+$150,000)           │
│ ☐ Templado especial (+$80,000)      │
│ ☐ Limpieza y sellado (+$50,000)     │
│                                     │
│ Total: $1,050,000                   │
└─────────────────────────────────────┘
[ATRÁS] [VER RESUMEN]
```

### Paso 5: Resumen (Pre-confirmación)
```
┌─────────────────────────────────────┐
│ Resumen de tu Cotización            │
├─────────────────────────────────────┤
│ Modelo: Ventana Corrediza PVC       │
│ Ubicación: Sala                     │
│ Dimensiones: 1200mm × 1500mm        │
│ Color: Nogal (+15%)                 │
│ Vidrio: Térmico Excelente           │
│ Servicios: Instalación (+$150k)     │
│                                     │
│ TOTAL: $1,050,000                   │
│                                     │
│ [← Volver a editar] [AGREGAR AL    │
│                      PRESUPUESTO →] │
└─────────────────────────────────────┘
```

---

## 🔧 Notas Técnicas

**Librerías Recomendadas:**
- `react-hook-form` (v7.64+) para manejo de formulario multi-step
- `zustand` o `react` Context para estado global del wizard
- `framer-motion` para animaciones suaves entre pasos
- Headless UI + Radix UI para componentes accesibles

**Componentes Necesarios:**
```
src/app/_components/quote-wizard/
├── quote-wizard.tsx          # Contenedor principal
├── wizard-step.tsx           # Wrapper de pasos
├── steps/
│   ├── location-step.tsx     # Paso 1
│   ├── dimensions-step.tsx   # Paso 2
│   ├── glass-step.tsx        # Paso 3
│   ├── services-step.tsx     # Paso 4
│   └── summary-step.tsx      # Paso 5
└── hooks/
    └── useWizardForm.ts      # Custom hook multi-step
```

**Estado del Wizard:**
```typescript
interface WizardState {
  currentStep: number
  formData: {
    roomLocation: string
    width: number
    height: number
    glassTypeId: string
    selectedServices: string[]
    modelId: string
    colorId?: string
  }
  errors: Record<string, string>
}
```

**localStorage Persistence:**
```typescript
// Guardar progreso cada vez que cambie formData
localStorage.setItem('wizardProgress', JSON.stringify(formData))

// Restaurar en componentDidMount
const saved = localStorage.getItem('wizardProgress')
if (saved) setFormData(JSON.parse(saved))
```

---

## 📝 Tareas de Implementación

### Frontend
- [ ] Componente `QuoteWizard.tsx` (contenedor)
- [ ] 5 componentes de pasos (location, dimensions, glass, services, summary)
- [ ] Hook `useWizardForm.ts` para manejo de estado multi-step
- [ ] Estilos Tailwind (responsive: mobile vertical, desktop horizontal)
- [ ] Indicadores de progreso (dots o línea)
- [ ] Validación paso a paso (no avanzar si hay errores)
- [ ] Animaciones de transición (fade + slide)

### State Management
- [ ] Context o Zustand para estado compartido
- [ ] localStorage para persistencia de sesión

### Validación
- [ ] Zod schemas por paso
- [ ] Validación en tiempo real (con debounce en dimensiones)
- [ ] Mensajes de error claros

### Pricing Integration
- [ ] Hook `useCalculateQuotePrice()` actualiza precio en cada paso
- [ ] Performance: <200ms para recalculación

### Testing
- [ ] E2E: flujo completo con Playwright
- [ ] Unit: validaciones de cada paso
- [ ] Visual: responsive en mobile, tablet, desktop

### Mobile Optimization
- [ ] Botones grandes (touch-friendly)
- [ ] Layout vertical en mobile
- [ ] Teclado numérico en inputs de dimensiones

---

## 🎯 Métricas de Éxito

- Tiempo de cotización: reducir de 10 min a 3 min
- Abandono en formulario: reducir de 35% a 15%
- Conversión Budget → Quote: aumentar de 42% a 55%
- Score de usabilidad: 8/10 o más (SUS score)
- Accesibilidad WCAG 2.1 AA

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo                         | Impacto | Mitigación                         |
| ------------------------------ | ------- | ---------------------------------- |
| Complejidad de implementación  | Alto    | Prototipo en Figma primero         |
| Performance del pricing engine | Medio   | Cacheo de cálculos, debounce       |
| Compatibilidad navegadores     | Bajo    | Testing en Chrome, Firefox, Safari |
| Experiencia en mobile          | Medio   | Prototipo mobile-first             |

---

## 📚 Referencias

- Épica: Simplificación del Formulario de Cotización
- Sprint: 1 (Alta Prioridad)
- Estimación: **8 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-001, US-002: Sistema de colores (integración)
- US-006: Servicios incluidos/opcionales (integración)
- US-008: Campo ubicación de ventana

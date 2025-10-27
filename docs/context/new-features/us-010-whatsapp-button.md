---
name: "US-010: Botón de WhatsApp en catálogo y cotización"
about: Botón flotante para contacto rápido vía WhatsApp
title: "US-010: Botón de WhatsApp en catálogo y cotización"
labels: ["feature", "vitro-rojas", "alta-prioridad", "sprint-1", "frontend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Cliente final  
**Quiero** contactar rápidamente al negocio por WhatsApp  
**Para** hacer preguntas antes o después de cotizar

---

## ✅ Criterios de Aceptación

- [ ] Hay un botón flotante de WhatsApp (bottom-right) en todo el sitio
- [ ] Al hacer clic, abre WhatsApp con mensaje prellenado:
  - Desde catálogo: "Hola, estoy interesado en [Nombre del Modelo]. ¿Me pueden ayudar?"
  - Desde Budget: "Hola, tengo una cotización de $XXX para [N] ventanas. ¿Podemos coordinar?"
  - Desde Quote: "Hola, quiero consultar sobre mi cotización #[ID]"
- [ ] El número de WhatsApp se configura en TenantConfig (formato internacional)
- [ ] El botón es accesible (ARIA label, contraste adecuado)

---

## 🔧 Notas Técnicas

**WhatsApp Link Format:**
```
https://wa.me/[PHONE_NUMBER]?text=[URL_ENCODED_MESSAGE]

Ejemplos:
https://wa.me/507XXXXXXXX?text=Hola%20estoy%20interesado
```

**Componente:**
```typescript
interface WhatsAppButtonProps {
  phone: string // +507XXXXXXXX
  message?: string
  context?: 'catalog' | 'budget' | 'quote'
}

export function WhatsAppButton(props: WhatsAppButtonProps) {
  // Lógica para generar mensaje contextualizado
  // Botón flotante con ícono oficial WhatsApp
}
```

**Contexto de Mensajes:**
- **Catálogo**: Modelo específico (si existe)
- **Budget**: Resumen (total, cantidad de ítems)
- **Quote**: ID de cotización

---

## 📝 Tareas de Implementación

### Frontend
- [ ] Componente `WhatsAppButton.tsx` (flotante, global)
- [ ] Hook `useWhatsAppMessage.ts` para generar mensajes contextualizados
- [ ] Integración en layout global
- [ ] Estilos: ícono verde #25D366, animación entrada
- [ ] Mobile: z-index apropiado para no tapar otros elementos

### Positioning
- [ ] Desktop: bottom-right, margin 20px
- [ ] Mobile: bottom-right, margin 10px (no tapar botón principal)
- [ ] Accesibilidad: ARIA label, keyboard navigation

### Configuración
- [ ] Leer `whatsappNumber` de TenantConfig
- [ ] Validar formato internacional
- [ ] Fallback si no existe (ocultar botón)

### Testing
- [ ] Unit: generación de URLs correctas
- [ ] E2E: click abre WhatsApp Web correctamente

---

## 🎯 Métricas de Éxito

- 30%+ de usuarios hacen click en botón
- Mensajes son claros y contextualizados
- Botón visible en todas las páginas
- Accesibilidad WCAG AA

---

## 📚 Referencias

- Épica: Branding y Comunicación
- Sprint: 1 (Alta Prioridad)
- Estimación: **2 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-009: Configurar branding (whatsappNumber)

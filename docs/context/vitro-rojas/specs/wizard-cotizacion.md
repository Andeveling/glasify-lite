# Especificación: Wizard de Cotización

**Descripción:**
Facilita la cotización con un proceso paso a paso y campos claros.

## Historias Relacionadas
- US-007: Wizard minimalista para configurar ventana
- US-008: Campo "Ubicación de la ventana" en ítem de cotización

## Requisitos Técnicos
- Wizard multi-step con validación
- Guardado en localStorage
- UX adaptativo para mobile y desktop

## Criterios de Aceptación Globales
- Proceso claro y sin sobrecarga cognitiva
- Ubicación visible en PDF y dashboard

## Dependencias
- react-hook-form multi-step
- Configuración de campos en Quote

## Riesgos
- Complejidad técnica del wizard
- Abandono de usuarios si el flujo no es claro

## Métricas de Éxito
- Tiempo de cotización <3 min
- 0 clientes reportan abandono por dificultad

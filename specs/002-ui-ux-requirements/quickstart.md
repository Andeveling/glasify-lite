# Quickstart — UI/UX Glasify MVP

Este quickstart valida el flujo principal de la interfaz y contratos.

## Prerrequisitos
- Node 20+, pnpm
- Base de datos configurada (Prisma)

## Pasos
1. Instalar dependencias y preparar BD.
2. Ejecutar tests de contrato e integración.
3. Iniciar dev server y validar estados `empty`, `loading`, `error`.

## Criterios de éxito
- Cálculo de precio responde <200ms (perf tests).
- Navegación por `(catalog) → (quote) → (checkout)` funciona.
- Panel `(dashboard)/(admin)` accesible para admin.

## Notas de UI
- No usar colores hardcodeados. Usa clases Tailwind basadas en variables de `globals.css`.
- Mensajes y etiquetas en español (es‑LA).
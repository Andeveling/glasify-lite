# Especificación: Flujo de Estados de Cotización

**Descripción:**
Define el ciclo de vida de una cotización desde estimado hasta enviada.

## Historias Relacionadas
- US-013: Estado "Estimado del Sistema"
- US-014: Estado "En Revisión Comercial"
- US-015: Estado "Enviada al Cliente"

## Requisitos Técnicos
- Enum de estados en Prisma
- Migración y validación de estados
- PDF con disclaimers según estado

## Criterios de Aceptación Globales
- Estados claros y visibles en dashboard y PDF
- Transiciones controladas y auditadas

## Dependencias
- Migración de cotizaciones existentes

## Riesgos
- Errores en migración de estados
- Confusión de usuarios por estados incorrectos

## Métricas de Éxito
- 100% de cotizaciones con estado correcto
- 0 errores en transición de estados

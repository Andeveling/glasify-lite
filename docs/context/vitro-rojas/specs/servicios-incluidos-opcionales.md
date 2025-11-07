# Especificación: Servicios Incluidos/Opcionales

**Descripción:**
Permite definir servicios incluidos en el precio y servicios opcionales seleccionables por el cliente.

## Historias Relacionadas
- US-006: Configurar servicios como incluidos u opcionales por modelo

## Requisitos Técnicos
- Campo `isIncluded` en `ModelService`
- Modificación del pricing engine
- PDF con sección "Servicios Incluidos"

## Criterios de Aceptación Globales
- Servicios incluidos se suman automáticamente al precio
- Servicios opcionales aparecen como checkboxes

## Dependencias
- Refactor del pricing engine

## Riesgos
- Errores en cálculo de servicios incluidos
- Confusión en PDF si no se muestra correctamente

## Métricas de Éxito
- 100% de modelos tienen servicios configurados
- 0 errores en cálculo de precios por servicios

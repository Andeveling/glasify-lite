# Especificación: Simplificación de Dirección

**Descripción:**
Reduce la fricción en el formulario de cotización, solicitando solo los datos esenciales de ubicación.

## Historias Relacionadas
- US-003: Simplificar campos de dirección en cotización

## Requisitos Técnicos
- Migración de campos en `Quote`
- Carga dinámica de regiones por país
- Deprecación de `contactAddress`

## Criterios de Aceptación Globales
- El formulario solo pide datos esenciales
- El sistema soporta países y regiones dinámicas

## Dependencias
- Configuración multi-tenant

## Riesgos
- Errores en migración de datos
- Validación de campos obligatorios

## Métricas de Éxito
- 0 clientes reportan problemas con dirección
- 100% de cotizaciones con datos válidos

# Especificación: Gestión de Transporte

**Descripción:**
Asegura que el cliente entienda que el transporte se calcula aparte y permite al comercial agregarlo manualmente.

## Historias Relacionadas
- US-004: Indicar que transporte se calcula post-cotización
- US-005: Comercial agrega costo de transporte manualmente

## Requisitos Técnicos
- Campo `shippingDisclaimer` en `TenantConfig`
- Campos de transporte en `Quote`
- Audit trail para cambios

## Criterios de Aceptación Globales
- Aviso visible en catálogo, Budget y PDF
- Comercial puede agregar transporte y notas

## Dependencias
- PDF y frontend deben mostrar disclaimer

## Riesgos
- Clientes confundidos si el aviso no es claro
- Errores en cálculo manual de transporte

## Métricas de Éxito
- 0 clientes reportan sorpresa por cargo de transporte
- 100% de cotizaciones con transporte registrado

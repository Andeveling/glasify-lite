# Especificación: Configuración Multi-Tenant

**Descripción:**
Permite adaptar la plataforma a diferentes países y regiones.

## Historias Relacionadas
- US-016: Configurar regiones/provincias por país

## Requisitos Técnicos
- Archivo `countries.json`
- Helper para regiones dinámicas
- Campo `country` en `TenantConfig`

## Criterios de Aceptación Globales
- Dropdown de región ajustado por país
- Soporte para nuevos países sin modificar código

## Dependencias
- Configuración de Tenant

## Riesgos
- Errores en carga de regiones
- Falta de soporte para países nuevos

## Métricas de Éxito
- 100% de tenants con regiones correctas
- 0 errores en selección de región

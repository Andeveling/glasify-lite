# Especificación: Gestión de Colores de Modelo

**Descripción:**
Permite configurar y seleccionar colores para cada modelo, aplicando recargos automáticos.

## Historias Relacionadas
- US-001: Configurar colores disponibles por modelo
- US-002: Seleccionar color en cotización del cliente

## Requisitos Técnicos
- Modelo `ModelColor` con relación Many-to-Many a `Model`
- Recargo porcentual por color
- Selector visual en frontend
Puesto,Color,Código RAL Típico,Código Hexadecimal Estimado
1,Blanco,RAL 9010 (Blanco Puro),#F3F3E9
2,Gris Antracita,RAL 7016,#384043
3,Negro Mate,RAL 9005 (Negro Intenso),#101010
4,Gris Medio,RAL 7022 (Gris Umbra),#464A4B
5,Natural (Anodizado Plata),Similar a RAL 9006 (Aluminio Blanco),#A0A8A9
6,Efecto Madera (Roble Oscuro),Símil madera (No es RAL),#794D35
7,Marrón Chocolate,RAL 8017,#4E3730
8,Gris Perla / Beige Claro,RAL 1013 (Blanco Ostra),#E4E0D6
9,Inox / Acero,Similar a RAL 9007 (Aluminio Gris),#8D9395
10,Champagne,Anodizado C33 (No es RAL),#D8C3A4

## Criterios de Aceptación Globales
- El admin puede gestionar colores y recargos
- El cliente ve el precio actualizado según color

## Dependencias
- Pricing engine debe soportar recargos por color
- PDF debe mostrar color y recargo

## Riesgos
- UX si hay muchos colores por modelo
- Validación de recargos y colores duplicados

## Métricas de Éxito
- 100% de modelos tienen colores configurados
- 0 errores en recálculo de precios por color

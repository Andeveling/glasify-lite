# Guía de Diseños Inkscape para Glasify Lite
## Cliente: Vitro Rojas S.A.

---

## 📐 ESPECIFICACIONES DE LIENZO

### Tamaño Recomendado para Inkscape:
- **Ancho**: 280 px
- **Alto**: 210 px
- **Relación**: 4:3 (estándar de tarjetas)
- **DPI**: 96 (estándar web)

### Por qué estas dimensiones:
- Coinciden exactamente con nuestros cards del catálogo (`cardWidth=280`, `cardHeight=210`)
- Proporción 4:3 es standard en monitores y visualización web
- 280px es suficiente para mostrar detalles sin perder legibilidad
- Los SVG exportados escalarán perfectamente en responsive

---

## 🪟 MODELOS A DISEÑAR (Por Vitro Rojas)

### 1. **Ventana Corredera Estándar** ⭐ PRIORIDAD 1
- **Precio Base**: $350,000
- **Descripción**: Ventana corredera horizontal (2 hojas)
- **Características**:
  - 2 paños deslizantes horizontales
  - Marco de aluminio
  - Travesaños horizontales
  - Vidrio claro (mostrar con opacidad 60% azul claro)

**Diseño sugerido**:
```
┌─────────────────────┐
│  |||||   |||||      │ ← Paños (travesaños)
│  |||||   |||||      │
│  |||||   |||||      │
│  |||||   |||||      │
│                     │
└─────────────────────┘
```

---

### 2. **Ventana Corredera Aluminio** ⭐ PRIORIDAD 2
- **Precio Base**: $280,000
- **Descripción**: Ventana corredera (aluminio, más económica)
- **Características**:
  - 2 paños horizontales más simples
  - Marco más delgado (aluminio económico)
  - Menos travesaños
  - Mismo vidrio claro

**Diseño sugerido**: Similar a la estándar pero con detalles más minimalistas

---

## 🎨 PAUTAS DE DISEÑO

### Elementos Obligatorios:
1. **Marco exterior**: Línea gruesa (2-3px) en gris oscuro (#4a4a4a)
2. **Vidrio**: Rectángulo principal con relleno azul claro (#87CEEB) y opacidad 60%
3. **Travesaños**: Líneas delgadas (1px) en gris medio (#777777)
4. **Efecto brillo**: Rectángulo blanco opcional en esquina superior izquierda (opacidad 15%, tamaño ~40% ancho)

### Estructura de Capas en Inkscape:
```
Capa 1: Marco exterior (rect con stroke, sin relleno)
Capa 2: Vidrio principal (rect con relleno azul, opacidad 60%)
Capa 3: Travesaños (line elements)
Capa 4: Efecto brillo (rect blanco, opacidad 15%)
```

### Paleta de Colores:
- **Marco**: #4a4a4a (gris oscuro)
- **Travesaños**: #777777 (gris medio)
- **Vidrio**: #87CEEB (azul claro) con opacidad 60%
- **Brillo**: #ffffff (blanco) con opacidad 15%
- **Bordes sutiles**: #555555

---

## 📤 EXPORTACIÓN

### Configuración de Exportación en Inkscape:

1. **Formato**: SVG
2. **Nombre archivo**: `{nombre-modelo-kebab-case}.svg`
   - Ejemplo: `ventana-corredera-estandar.svg`
3. **Ubicación**: `/public/models/designs/`
4. **Optimización**: 
   - Convertir textos a paths (si los hay)
   - Agrupar elementos relacionados
   - Eliminar metadatos innecesarios

### Comando para Optimizar SVG (opcional):
```bash
npx svgo public/models/designs/{archivo}.svg
```

---

## 🔧 RUTAS EN LA APLICACIÓN

Los SVG se colocarán en:
```
/public/models/designs/
├── ventana-corredera-estandar.svg
├── ventana-corredera-aluminio.svg
└── [otros diseños...]
```

En la base de datos (`Model.imageUrl`):
```
/models/designs/ventana-corredera-estandar.svg
```

En el código React:
```tsx
<Image
  src={imageUrl ?? '/placeholder-window.svg'}
  alt={modelName}
  fill
  sizes="280px"
/>
```

---

## 📋 CHECKLIST DE ENTREGA

Para cada diseño:
- [ ] Lienzo: 280×210 px exacto
- [ ] Marco exterior visible y prominente
- [ ] Vidrio con color azul claro y opacidad 60%
- [ ] Travesaños claramente visibles
- [ ] Efecto brillo sutil en esquina superior
- [ ] Archivo SVG limpio y optimizado
- [ ] Archivo en `/public/models/designs/`
- [ ] `imageUrl` actualizado en base de datos

---

## 🚀 PRÓXIMOS PASOS

1. **Crear diseños en Inkscape** con especificaciones anteriores
2. **Exportar como SVG** a `/public/models/designs/`
3. **Actualizar `imageUrl` en BD**:
   ```sql
   UPDATE "Model" 
   SET "imageUrl" = '/models/designs/ventana-corredera-estandar.svg'
   WHERE name = 'Ventana Corredera Estándar';
   ```
4. **Probar en navegador** para verificar renderizado correcto
5. **Iterar diseños** según feedback visual

---

## 📞 CONTACTO / NOTAS

- **Cliente**: Vitro Rojas S.A.
- **Especialidad**: Perfiles de aluminio y ventanas
- **Proceso de corte**: Ver [`Vitro Rojas S.A - Corte.md`](./Vitro%20Rojas%20S.A%20-%20Corte.md)
- **Fórmulas de dimensiones**: Consultar en doc anterior para detalles técnicos

---

**Última actualización**: 26 de octubre de 2025
**Versión**: 1.0

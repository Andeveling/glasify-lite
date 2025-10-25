# Script: replace-vidrio-to-cristal.sh

## Descripción

Este script automatiza el reemplazo de todas las instancias de:
- **"vidrio"** → **"cristal"**
- **"vidrios"** → **"cristales"**

En todo el proyecto, preservando la integridad de los archivos y creando copias de seguridad.

## Características

✅ **Búsqueda Inteligente**: Solo procesa archivos que contienen "vidrio" o "vidrios"  
✅ **Exclusiones Automáticas**: Ignora directorios como `node_modules`, `.git`, `.next`, `dist`, etc.  
✅ **Copias de Seguridad**: Crea backups automáticos en `.backups/` antes de cualquier cambio  
✅ **Respeto de Límites de Palabra**: Solo reemplaza palabras completas (usando `\b`)  
✅ **Logging Detallado**: Genera un reporte con los cambios realizados  
✅ **Rollback Fácil**: Incluye instrucciones para deshacer cambios  

## Cómo Usar

### 1. Ejecutar el script

```bash
# Navegar al directorio del proyecto
cd /home/andres/Proyectos/glasify-lite

# Ejecutar el script
./replace-vidrio-to-cristal.sh
```

### 2. Verificar los cambios

El script muestra:
- Archivos procesados
- Cantidad de reemplazos por archivo
- Ubicación de backups
- Ubicación del archivo de log

### 3. Revertir cambios (si es necesario)

Si deseas deshacer todos los cambios:

```bash
# El script mostrará el comando exacto, pero es algo como:
cp -r .backups/vidrio-to-cristal-<timestamp>/* ./
```

## Archivos Generados

```
.backups/
├── vidrio-to-cristal-<timestamp>/        # Carpeta con backups
│   └── (copia exacta de archivos modificados)
└── replacement-log-<timestamp>.txt       # Archivo de log detallado
```

## Ejemplo de Salida

```
════════════════════════════════════════════════════════════
  Script: Replace 'vidrio' with 'cristal'
════════════════════════════════════════════════════════════

Backup directory: /home/andres/Proyectos/glasify-lite/.backups/vidrio-to-cristal-1729876543

Searching for files containing 'vidrio'...
Found 125 files containing 'vidrio' or 'vidrios'

Processing files...

✓ src/app/(dashboard)/admin/glass-types/_components/glass-types-table.tsx
  Replacements: 8 → 8
✓ src/server/api/routers/dashboard.ts
  Replacements: 12 → 12
✓ prisma/schema.prisma
  Replacements: 5 → 5
...

════════════════════════════════════════════════════════════
Replacement completed!
════════════════════════════════════════════════════════════

Summary:
  Total files processed: 125
  Total replacements: 456
  Backup location: .backups/vidrio-to-cristal-1729876543
  Log file: .backups/replacement-log-20251025-182730.txt
```

## Notas Importantes

⚠️ **Antes de ejecutar el script:**
1. Asegúrate de que todos los cambios actuales estén commiteados en Git
2. El script creará backups automáticamente, pero es buena práctica tener Git como respaldo
3. Verifica que tienes permisos de lectura/escritura en el directorio del proyecto

## Archivos Excluidos

El script **NO procesa** archivos en estos directorios:
- `node_modules/`
- `.git/`
- `.next/`
- `dist/`
- `build/`
- `.playwright-mcp/`
- `.backups/`

## Rollback Manual (si es necesario)

Si ocurre algo inesperado, puedes revertir manualmente:

```bash
# Ver archivos disponibles en backups
ls -la .backups/

# Restaurar desde un backup específico
cp -r .backups/vidrio-to-cristal-<TIMESTAMP>/* ./
```

## Soporte

Si tienes problemas:

1. Verifica que el script es ejecutable: `chmod +x replace-vidrio-to-cristal.sh`
2. Revisa el archivo de log en `.backups/replacement-log-*.txt`
3. Usa Git para ver exactamente qué cambió: `git diff`
4. Si algo salió mal, restaura desde el backup: `cp -r .backups/vidrio-to-cristal-<TIMESTAMP>/* ./`

---

**Creado**: 25 de octubre de 2025  
**Proyecto**: Glasify Lite

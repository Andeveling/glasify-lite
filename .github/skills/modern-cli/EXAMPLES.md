# Modern CLI Tools — Ejemplos Prácticos

Casos de uso reales organizados por tarea común.

## Búsqueda de Código

### Encontrar TODOs
```bash
# Básico
rg 'TODO'

# Con contexto (2 líneas antes/después)
rg -B2 -A2 'TODO'

# Listar archivos sin mostrar líneas
rg -l 'TODO'

# Por tipo de archivo
rg -t ts 'TODO'

# Case-insensitive
rg -i 'todo'
```

### Buscar imports
```bash
# Imports de React
rg "^import.*from ['\"]react"

# Imports relativos
rg "from ['\"]\.\./"

# Imports de un paquete específico
rg -t ts "from ['\"]next/"
```

### Debugging
```bash
# Encontrar console.log con contexto
rg -C 3 'console\.(log|error|warn)'

# debugger statements
rg 'debugger'

# Código comentado
rg '^\s*//.*TODO'
```

## Navegación de Proyectos

### Explorar estructura
```bash
# Overview del proyecto (2 niveles)
eza --tree -L 2

# Solo directorios principales
eza --tree -t d -L 1

# Con tamaños de archivo
eza -lh --tree -L 2

# Con estado Git
eza --tree --git -L 2
```

### Listar archivos específicos
```bash
# Todos los TypeScript
fd -e ts -e tsx

# Archivos de configuración
fd '^\..*rc$'

# Package.json en todo el proyecto
fd 'package.json'

# Archivos modificados recientemente
fd -e ts --changed-within 1d
```

## Transformación de Código

### Renombrar en masa
```bash
# Reemplazar nombre de variable
rg -l 'oldName' | xargs sd 'oldName' 'newName'

# Preview antes de aplicar (sin -i)
sd 'oldName' 'newName' file.ts

# In-place después de verificar
sd -i 'oldName' 'newName' file.ts
```

### Actualizar imports
```bash
# Cambiar path de import
rg -l "from '@/old/path'" | xargs sd -i "@/old/path" "@/new/path"

# Actualizar versión de paquete
sd -i '"react": "18.2.0"' '"react": "18.3.0"' package.json
```

## Revisión de Código

### Ver archivos con syntax
```bash
# Archivo con colores
bat src/app.tsx

# Plain (sin números de línea)
bat -p src/app.tsx

# Highlighting de output
git diff | bat -l diff

# Especificar lenguaje
bat -l json output.txt
```

### Inspeccionar logs
```bash
# Con paginación automática
bat large-log.txt

# Sin paginación
bat -p large-log.txt

# Con números de línea para referencia
bat -n error.log
```

## Pipelines y Scripts

### Combinar herramientas
```bash
# Buscar y contar
fd -e ts | wc -l

# Buscar y ejecutar
fd -e log -x du -h {}

# Pipeline complejo
rg -l 'TODO' | xargs bat | grep -i 'urgent'

# Filtrar y transformar
fd -e json -x cat {} | bat -l json
```

### Output estructurado
```bash
# JSON para procesamiento
rg --json 'pattern' > results.json

# Stats de archivos
fd -e ts -e tsx -x wc -l {} | bat

# Git status con colores
eza -la --git | bat
```

## Limpieza y Mantenimiento

### Encontrar archivos grandes
```bash
# Archivos log
fd -e log -x du -h {} | sort -h

# Mayores a 10MB
fd -t f -x du -h {} | rg '\d+M'
```

### Detectar duplicados
```bash
# Nombres similares
fd 'component' | sort

# Contenido duplicado (usando checksums)
fd -e ts -x md5sum {} | sort
```

### Auditoría de código
```bash
# Detectar credenciales hardcodeadas
rg -i 'password|api[_-]?key|secret'

# Código con TODO antiguo
rg 'TODO.*202[0-3]'

# Imports no usados (patrón común)
rg "^import .* from .*$" --no-filename | sort | uniq -c | sort -rn
```

## Patrones de Migración

### De legacy a moderno
```bash
# ❌ Antes
cat file.txt | grep pattern | wc -l

# ✅ Después
rg pattern file.txt | wc -l

# ❌ Antes
find . -name "*.ts" -exec grep -l "pattern" {} \;

# ✅ Después
rg -t ts -l 'pattern'

# ❌ Antes
find . -type f -name "*.log" -exec rm {} \;

# ✅ Después
fd -e log -x rm {}
```

---

**Nota:** Todos estos ejemplos asumen que tienes instaladas las herramientas con `brew install bat ripgrep fd sd eza`.

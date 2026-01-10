# Modern CLI Tools — Referencia Completa

Flags, opciones y configuración avanzada para cada herramienta.

## bat — Cat con Syntax Highlighting

### Instalación
```bash
brew install bat
```

### Flags Comunes
| Flag | Descripción |
|------|-------------|
| `-p, --plain` | Sin decoraciones (solo colores) |
| `-n, --number` | Mostrar números de línea |
| `-l, --language` | Especificar lenguaje para highlighting |
| `-A, --show-all` | Mostrar caracteres no imprimibles |
| `--style` | Personalizar estilo (numbers, grid, header, etc.) |
| `--theme` | Cambiar tema de colores |
| `--list-languages` | Listar lenguajes soportados |
| `--list-themes` | Listar temas disponibles |

### Estilos Disponibles
```bash
bat --style=auto               # Automático
bat --style=plain              # Sin decoraciones
bat --style=numbers            # Solo números
bat --style=grid               # Con separadores
bat --style=header             # Con header de archivo
bat --style=numbers,grid       # Combinado
```

### Configuración
```bash
# ~/.config/bat/config
--theme="Dracula"
--style="numbers,grid"
--pager="less -FR"
```

---

## ripgrep — Búsqueda Ultra-rápida

### Instalación
```bash
brew install ripgrep
```

### Flags Comunes
| Flag | Descripción |
|------|-------------|
| `-i, --ignore-case` | Búsqueda case-insensitive |
| `-l, --files-with-matches` | Solo listar nombres de archivos |
| `-c, --count` | Contar matches por archivo |
| `-C, --context NUM` | Mostrar NUM líneas de contexto |
| `-B, --before-context NUM` | Líneas antes del match |
| `-A, --after-context NUM` | Líneas después del match |
| `-t, --type TYPE` | Filtrar por tipo (ts, js, py, etc.) |
| `-g, --glob PATTERN` | Filtrar por patrón de archivo |
| `--hidden` | Buscar en archivos ocultos |
| `--no-ignore` | No respetar .gitignore |
| `--json` | Output en formato JSON |

### Tipos de Archivo
```bash
rg --type-list           # Ver todos los tipos
rg -t ts 'pattern'       # Solo TypeScript
rg -t js -t jsx 'pattern'  # Multiple tipos
rg -T log 'pattern'      # Excluir tipo
```

### Patrones Regex
```bash
rg '^\s*export'          # Exports al inicio de línea
rg 'function\s+\w+'      # Funciones
rg '\b[A-Z]{3,}\b'       # Constantes en mayúscula
rg '(?i)todo'            # Case-insensitive en regex
```

### Configuración
```bash
# ~/.config/ripgrep/config (o RIPGREP_CONFIG_PATH)
--smart-case
--hidden
--glob=!.git/
--max-columns=150
```

---

## fd — Find Intuitivo

### Instalación
```bash
brew install fd
```

### Flags Comunes
| Flag | Descripción |
|------|-------------|
| `-e, --extension EXT` | Filtrar por extensión |
| `-t, --type TYPE` | Tipo: f(ile), d(irectory), l(ink) |
| `-H, --hidden` | Incluir archivos ocultos |
| `-I, --no-ignore` | No respetar .gitignore |
| `-x, --exec CMD` | Ejecutar comando en cada resultado |
| `-X, --exec-batch CMD` | Ejecutar comando en batch |
| `-d, --max-depth NUM` | Profundidad máxima |
| `--changed-within TIME` | Modificados en período |
| `--changed-before TIME` | Modificados antes de |
| `--size SIZE` | Filtrar por tamaño |

### Tipos
```bash
fd -t f 'pattern'        # Solo archivos
fd -t d 'pattern'        # Solo directorios
fd -t l                  # Solo links simbólicos
```

### Filtros de Tiempo
```bash
fd --changed-within 1d   # Último día
fd --changed-within 2w   # Últimas 2 semanas
fd --changed-before 1m   # Antes de hace 1 mes
```

### Ejecución de Comandos
```bash
fd -e log -x rm {}            # Ejecutar por cada archivo
fd -e log -X rm               # Ejecutar una vez con todos
fd -e json -x cat {} | jq     # Pipeline por archivo
```

---

## sd — Sed Intuitivo

### Instalación
```bash
brew install sd
```

### Flags Comunes
| Flag | Descripción |
|------|-------------|
| `-i, --in-place` | Modificar archivo directamente |
| `-s, --string-mode` | Modo literal (no regex) |
| `-f, --flags FLAGS` | Flags de regex (i, m, s) |
| `-p, --preview` | Preview de cambios |

### Modos de Uso
```bash
# Literal (sin regex)
sd -s 'old.text' 'new.text' file

# Regex (por defecto)
sd '(\w+)@' '$1-replaced@' file

# In-place
sd -i 'old' 'new' file

# Via stdin
echo 'text' | sd 'text' 'new'
```

### Grupos de Captura
```bash
# Capturar y reusar
sd '(\w+)-(\d+)' '$2-$1' file

# Named groups
sd '(?P<word>\w+)' '${word}_modified' file
```

---

## eza — Listado Moderno

### Instalación
```bash
brew install eza
```

### Flags Comunes
| Flag | Descripción |
|------|-------------|
| `-l, --long` | Listado detallado |
| `-a, --all` | Incluir archivos ocultos |
| `-h, --header` | Añadir header de columnas |
| `-T, --tree` | Vista árbol |
| `-L, --level DEPTH` | Profundidad del árbol |
| `--git` | Mostrar estado Git |
| `--icons` | Mostrar iconos de archivo |
| `-s, --sort FIELD` | Ordenar por campo |
| `-r, --reverse` | Orden invertido |
| `--group-directories-first` | Directorios primero |

### Ordenamiento
```bash
eza -s name              # Por nombre
eza -s size              # Por tamaño
eza -s modified          # Por fecha de modificación
eza -s created           # Por fecha de creación
eza -s extension         # Por extensión
```

### Vistas
```bash
eza -1                   # Una columna
eza -l                   # Listado largo
eza --grid               # Vista grid
eza --tree               # Vista árbol
```

### Configuración
```bash
# Alias recomendados en ~/.zshrc
alias ls='eza'
alias ll='eza -lh --git'
alias la='eza -lha --git'
alias tree='eza --tree'
alias lt='eza -lh --sort=modified'
```

---

## Alias Setup Completo

```bash
# ~/.zshrc o ~/.bashrc

# Basic aliases
alias cat='bat'
alias grep='rg'
alias find='fd'
alias sed='sd'
alias ls='eza'

# Extended aliases
alias ll='eza -lh --git'
alias la='eza -lha --git'
alias tree='eza --tree'
alias lt='eza -lh --sort=modified'

# Funciones útiles
fzf-file() {
  fd -t f | fzf --preview 'bat --color=always {}'
}

rg-edit() {
  local file=$(rg -l "$1" | fzf)
  [ -n "$file" ] && ${EDITOR:-vim} "$file"
}
```

---

## Variables de Entorno

```bash
# bat
export BAT_THEME="Dracula"
export BAT_STYLE="numbers,grid"

# ripgrep
export RIPGREP_CONFIG_PATH="$HOME/.config/ripgrep/config"

# eza
export EZA_COLORS="da=1;34:gm=1;33"
```

---

## Performance Tips

### ripgrep
- Usa `-t` para limitar tipos de archivo
- Usa `-g` para patrones de archivo específicos
- Evita `--no-ignore` en repos grandes
- Usa `--max-count` si solo necesitas algunos matches

### fd
- Limita profundidad con `-d`
- Usa `-t` para filtrar tipo temprano
- Aprovecha cache de `.gitignore`

### bat
- Usa `-p` si no necesitas decoraciones
- Desactiva paginación con `--paging=never` para pipes

---

**Última actualización:** 10 de enero de 2026

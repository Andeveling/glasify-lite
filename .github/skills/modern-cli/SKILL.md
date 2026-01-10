---
name: modern-cli-tools
description: Use bat, ripgrep, fd, sd, and eza instead of cat, grep, find, sed, and ls. Faster, better UX, respects .gitignore. Apply when user runs legacy commands or works with terminal workflows.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: terminal
---

# Modern CLI Tools

Herramientas modernas en Rust que reemplazan comandos legacy con mejor rendimiento y UX.

## Quick Start

```bash
# Instalación completa
brew install bat ripgrep fd sd eza

# Setup de alias
cat >> ~/.zshrc << 'EOF'
alias cat="bat"
alias grep="rg"
alias find="fd"
alias sed="sd"
alias ls="eza"
alias ll="eza -la"
EOF

source ~/.zshrc
```

## Herramientas

| Legacy | Moderna | Uso básico        | Ventaja clave                      |
| ------ | ------- | ----------------- | ---------------------------------- |
| `cat`  | **bat** | `bat file.ts`     | Syntax highlighting automático     |
| `grep` | **rg**  | `rg 'pattern'`    | 10x más rápido, respeta .gitignore |
| `find` | **fd**  | `fd -e ts`        | Sintaxis intuitiva                 |
| `sed`  | **sd**  | `sd old new file` | Sin escapes complejos              |
| `ls`   | **eza** | `eza -la`         | Git status integrado               |

## Comandos Esenciales

### bat (cat mejorado)
```bash
bat file.ts                    # Con colores y números
bat -p file.ts                 # Plain (sin decoraciones)
some-cmd | bat -l json         # Highlighting de pipe output
```

### ripgrep (grep rápido)
```bash
rg 'pattern'                   # Búsqueda recursiva
rg -i 'pattern'                # Case-insensitive
rg -t ts 'export'              # Por tipo de archivo
rg -l 'TODO'                   # Listar solo archivos
```

### fd (find intuitivo)
```bash
fd pattern                     # Búsqueda por nombre
fd -e ts -e tsx                # Por extensión
fd -t d node_modules           # Solo directorios
fd -H .env                     # Incluir ocultos
```

### sd (sed claro)
```bash
sd 'old' 'new' file            # Reemplazo básico
sd -i 'old' 'new' file         # In-place
echo 'hi' | sd 'hi' 'bye'      # Via pipe
```

### eza (ls moderno)
```bash
eza -la                        # Listado detallado
eza --tree -L 2                # Vista árbol (2 niveles)
eza -la --git                  # Con estado Git
```

## Cuándo Aplicar Este Skill

Usa estas herramientas cuando:
- El usuario ejecuta comandos legacy (`cat`, `grep`, `find`, `sed`, `ls`)
- Se trabaja con proyectos grandes (rendimiento crítico)
- Se necesita output coloreado o filtrado por `.gitignore`
- Se buscan archivos o texto en repositorios Git

## Sugerencia de Reemplazo

Cuando detectes un comando legacy:

```bash
# ❌ Usuario ejecuta:
grep -r 'useState' .

# ✅ Sugiere inmediatamente:
rg 'useState'  # 10x más rápido, respeta .gitignore
```

## Recursos Adicionales

- [EXAMPLES.md](EXAMPLES.md) — Casos de uso prácticos
- [REFERENCE.md](REFERENCE.md) — Flags y opciones avanzadas

## Links

- [bat](https://github.com/sharkdp/bat) | [rg](https://github.com/BurntSushi/ripgrep) | [fd](https://github.com/sharkdp/fd) | [sd](https://github.com/chmln/sd) | [eza](https://github.com/eza-community/eza)

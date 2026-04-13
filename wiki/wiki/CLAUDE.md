# LLM Wiki — Glasify

**Version**: 2.0

**Last updated**: 2026-04-13

---

## Purpose

Este wiki es la base de conocimiento de Glasify Lite v2.0 CPQ System. Mantenido por Claude Code siguiendo el patrón LLM Wiki de Andrej Karpathy.

## Folder Structure

```
wiki/
├── raw/                    # Source documents (inmutable)
├── wiki/
│   ├── index.md           # Table of contents
│   ├── log.md            # Append-only record
│   ├── CLAUDE.md         # This file
│   ├── 00-glassify/     # Main project docs
│   ├── 10-glass-knowledge/
│   ├── 20-manufacturers/
│   └── 30-clients/
```

## Workflow

### Ingest Workflow

Cuando se agrega una nueva fuente:

1. Leer el documento completo
2. Discutir takeaways con el usuario
3. Crear summary page en `wiki/`
4. Crear o actualizar concept pages para cada idea principal
5. Agregar [[wiki-links]] para conectar páginas relacionadas
6. Actualizar `wiki/index.md`
7. Append entry a `wiki/log.md`

### Page Format

```markdown
# Page Title

**Summary**: One to two sentences.

**Sources**: List of source files.

**Last updated**: Date.

---

Content with [[wiki-links]].

## Related pages
```

### Citation Rules

- Cada claim debe referenciar su source file
- Formato: `(source: filename.md)`
- Si dos sources disagree, notar la contradicción explícitamente

### Question Answering

1. Leer `wiki/index.md` primero
2. Leer las páginas relevantes
3. Citar páginas específicas en la respuesta
4. Si la respuesta no está en el wiki, decirlo claramente

## Rules

- Nunca modificar nada en `raw/`
- Siempre actualizar `wiki/index.md` y `wiki/log.md` después de cambios
- Usar [[wiki-links]] para conectar conceptos
- Escribir en lenguaje claro y simple

## Related pages

- [[prd]]
- [[tech-stack]]
- [[routes]]
- [[entities]]
- [[pricing-formula]]

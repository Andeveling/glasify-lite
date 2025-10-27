# 🚀 Quick Start - Vitro Rojas en GitHub

**¿Solo quieres empezar rápido?** Aquí tienes lo esencial.

---

## 📋 3 Pasos para Empezar

### Paso 1: Entender la Estructura (5 min)

```bash
# Ver índice completo de historias
cat .github/ISSUE_TEMPLATE/vitro-rojas/README.md

# Ver roadmap ejecutivo
cat .github/ISSUE_TEMPLATE/vitro-rojas/VITRO-ROJAS-ROADMAP.yaml

# Ver resumen de conversión
cat .github/ISSUE_TEMPLATE/vitro-rojas/CONVERSION-SUMMARY.md
```

### Paso 2: Configurar GitHub (15 min)

Seguir checklist en:
```bash
cat .github/ISSUE_TEMPLATE/vitro-rojas/GITHUB-SETUP.md
```

**Lo mínimo:**
1. Crear labels (copy-paste desde GITHUB-SETUP.md)
2. Crear proyecto "Vitro Rojas - v1"
3. Crear 2 milestones: Sprint 1, Sprint 2

### Paso 3: Crear Issues (10 min)

**Opción A: Manual (UI)**
- Ve a Issues → New Issue
- Selecciona template de vitro-rojas
- Click "Create"

**Opción B: Bulk (CLI)**
```bash
# Instalar GitHub CLI si no lo tienes
brew install gh

# Crear todos los issues de Sprint 1
gh issue create --template vitro-rojas/us-001-model-colors --label sprint-1
gh issue create --template vitro-rojas/us-002-color-selector --label sprint-1
# ... etc
```

---

## 📊 Las 16 Historias de Usuario

### 🔴 Alta Prioridad (Sprint 1) - 44 puntos

| #      | Título                          | Pts | Archivo                              |
| ------ | ------------------------------- | --- | ------------------------------------ |
| US-001 | Configurar colores por modelo   | 5   | `us-001-model-colors.md`             |
| US-002 | Seleccionar color en cotización | 3   | `us-002-color-selector.md`           |
| US-006 | Servicios incluidos/opcionales  | 5   | `us-006-services-included.md`        |
| US-007 | Wizard de cotización            | 8   | `us-007-quote-wizard.md`             |
| US-010 | Botón WhatsApp                  | 2   | `us-010-whatsapp-button.md`          |
| US-011 | Dashboard de cotizaciones       | 8   | `us-011-quotes-dashboard.md`         |
| US-013 | Estado "Estimado del Sistema"   | 3   | `us-013-system-estimate-status.md`   |
| US-014 | Estado "En Revisión Comercial"  | 5   | `us-014-commercial-review-status.md` |
| US-015 | Estado "Enviada al Cliente"     | 5   | `us-015-sent-to-client-status.md`    |

### 🟠 Media Prioridad (Sprint 2) - 21 puntos

| #      | Título                           | Pts | Archivo                         |
| ------ | -------------------------------- | --- | ------------------------------- |
| US-003 | Simplificar dirección            | 2   | `us-003-simplify-address.md`    |
| US-004 | Aviso transporte post-cotización | 1   | `us-004-shipping-disclaimer.md` |
| US-005 | Costo transporte por comercial   | 3   | `us-005-shipping-cost.md`       |
| US-008 | Ubicación de ventana             | 2   | `us-008-room-location.md`       |
| US-009 | Branding personalizado           | 5   | `us-009-tenant-branding.md`     |
| US-012 | Asignar comercial                | 5   | `us-012-assign-commercial.md`   |
| US-016 | Regiones por país                | 3   | `us-016-country-regions.md`     |

---

## 📁 Estructura de Archivos

```
.github/ISSUE_TEMPLATE/vitro-rojas/
│
├── README.md                        ← EMPIEZA AQUÍ (índice completo)
├── CONVERSION-SUMMARY.md            ← Resumen de qué se hizo
├── GITHUB-SETUP.md                  ← Cómo configurar GitHub
├── VITRO-ROJAS-ROADMAP.yaml        ← Roadmap ejecutivo
│
└── [Archivos de Historias]
    ├── us-001-model-colors.md
    ├── us-002-color-selector.md
    ├── us-003-simplify-address.md
    ├── us-004-shipping-disclaimer.md
    ├── us-005-shipping-cost.md
    ├── us-006-services-included.md
    ├── us-007-quote-wizard.md
    ├── us-008-room-location.md
    ├── us-009-tenant-branding.md
    ├── us-010-whatsapp-button.md
    ├── us-011-quotes-dashboard.md
    ├── us-012-assign-commercial.md
    ├── us-013-system-estimate-status.md
    ├── us-014-commercial-review-status.md
    ├── us-015-sent-to-client-status.md
    └── us-016-country-regions.md
```

---

## 🎯 Hitos Clave

```
📅 27 Oct 2025: Historias de usuario creadas
📅 01 Nov 2025: Sprint 1 comienza
📅 29 Nov 2025: Sprint 1 termina
📅 01 Dic 2025: Sprint 2 comienza
📅 20 Dic 2025: Sprint 2 termina
📅 31 Dic 2025: v1.0 lista para producción
```

---

## 💡 Tips Útiles

### Buscar historias rápidamente
```bash
# En GitHub: Ir a Issues → Filtrar por label "vitro-rojas"
# O via CLI:
gh issue list --label vitro-rojas --state open
```

### Ver una historia específica
```bash
# Abrir en navegador
gh issue view US-007 --web

# Ver detalles en terminal
gh issue view US-007
```

### Crear rama para una historia
```bash
# Buena práctica de naming
git checkout -b feature/us-007-quote-wizard
```

### Vincular PR con issue
```bash
# En descripción del PR (o commit message):
Closes #[issue-number]

# Ejemplo:
Closes #42 (si la historia es issue #42)
```

---

## ❓ Preguntas Frecuentes

### ¿Dónde encuentro X?
- **Índice de historias**: `README.md`
- **Roadmap ejecutivo**: `VITRO-ROJAS-ROADMAP.yaml`
- **Setup de GitHub**: `GITHUB-SETUP.md`
- **Historia específica**: `us-XXX-*.md`

### ¿Cómo creo un issue?
- **Opción 1 (recomendado)**: GitHub web → Issues → New → Template
- **Opción 2 (rápido)**: CLI `gh issue create --template vitro-rojas/us-001-*`
- **Opción 3 (manual)**: Copy-paste del contenido de `us-XXX-*.md`

### ¿Qué pasa después de crear issues?
1. Agregar al proyecto "Vitro Rojas - v1"
2. Asignar Story Points
3. Asignar developers
4. Comenzar Sprint 1

### ¿Puedo modificar las historias?
Sí, son documentos vivos. Pero:
- Cambios pequeños → comentario en issue
- Cambios grandes → reunión con Vitro Rojas primero

---

## 🔗 Enlaces Importantes

```
GitHub Repository:
  https://github.com/Andeveling/glasify-lite

Vitro Rojas Templates:
  .github/ISSUE_TEMPLATE/vitro-rojas/

Original PRD:
  docs/prd.md

Reuniones con Vitro Rojas:
  docs/context/vitro-rojas/meetings.md

Historias en MD (versión anterior):
  docs/context/vitro-rojas/user-stories.md
```

---

## ✅ Checklist de Today

- [ ] Leer `README.md` (5 min)
- [ ] Revisar `VITRO-ROJAS-ROADMAP.yaml` (5 min)
- [ ] Seguir `GITHUB-SETUP.md` (15 min)
- [ ] Crear 3-5 issues de Sprint 1 para probar (10 min)
- [ ] Agregar al proyecto "Vitro Rojas - v1" (5 min)
- [ ] Compartir con equipo (5 min)

**Total: ~45 min para estar 100% listo**

---

## 🆘 Ayuda

¿Algo no funciona?
1. Mira `GITHUB-SETUP.md` para pasos de configuración
2. Lee el template específico (`us-XXX-*.md`)
3. Abre un issue con label "help-wanted"
4. Contacta al tech lead

---

**¡Listo! Ahora ve a `README.md` para comenzar.**

**Última actualización**: 27 de octubre de 2025

# Setup de GitHub para Vitro Rojas

**Fecha**: 27 de octubre de 2025  
**Objetivo**: Configurar GitHub Projects, labels, y templates para gestión de historias de usuario

---

## ✅ Checklist de Configuración

### 1. GitHub Labels

Crear estos labels en el repositorio:

```
vitro-rojas
├─ color: #FFD700 (dorado)
├─ description: "Historias de usuario para cliente Vitro Rojas"

sprint-1
├─ color: #FF6B6B (rojo)
├─ description: "Sprint 1: Funcionalidades Core (29 nov)"

sprint-2
├─ color: #FF8C42 (naranja)
├─ description: "Sprint 2: Mejoras UX (20 dic)"

alta-prioridad
├─ color: #E74C3C (rojo oscuro)
├─ description: "Bloqueante o crítica"

media-prioridad
├─ color: #F39C12 (naranja oscuro)
├─ description: "Importante pero no bloqueante"

backend
├─ color: #3498DB (azul)
├─ description: "Cambios en API/Database"

frontend
├─ color: #9B59B6 (púrpura)
├─ description: "Cambios en UI/UX"

admin
├─ color: #2ECC71 (verde)
├─ description: "Panel administrativo"

feature
├─ color: #1ABC9C (teal)
├─ description: "Nueva funcionalidad"

ui-ux
├─ color: #34495E (gris oscuro)
├─ description: "Experiencia de usuario"

database
├─ color: #C0392B (rojo sangre)
├─ description: "Schema o migraciones"

pricing
├─ color: #16A085 (verde oscuro)
├─ description: "Motor de cálculo de precios"

email
├─ color: #8E44AD (púrpura oscuro)
├─ description: "Integración de email"

pdf
├─ color: #D35400 (naranja")
├─ description: "Generación de PDFs"

rbac
├─ color: #27AE60 (verde claro)
├─ description: "Control de acceso basado en roles"

complex
├─ color: #C0392B (rojo)
├─ description: "Complejidad alta, requiere especial atención"
```

### 2. GitHub Project

**Crear proyecto: "Vitro Rojas - v1"**

- Tipo: Table (más visual que Kanban para este caso)
- Visibilidad: Public

#### Columnas del Proyecto:

1. **Backlog**
   - Historias no planificadas
   - Filter: `is:issue status:open`

2. **Sprint 1 Planning**
   - Historias seleccionadas para Sprint 1
   - Filter: `label:sprint-1 status:open`

3. **Sprint 1 - In Progress**
   - Actualmente en desarrollo
   - Filter: `label:sprint-1 assignee:*`

4. **Sprint 1 - Review**
   - En revisión de código
   - Filter: `label:sprint-1 status:open review:requested`

5. **Sprint 1 - Done**
   - Completadas y mergeadas
   - Filter: `label:sprint-1 status:closed`

6. **Sprint 2 - Backlog**
   - Historias para Sprint 2
   - Filter: `label:sprint-2 status:open`

#### Custom Fields:

- **Story Points**: Number field (1-8)
- **Epic**: Single select (9 épicas)
- **Client**: Text (Vitro Rojas)
- **Blocked By**: Issue reference field

### 3. Templates de Issue

✅ **Ya creados en `.github/ISSUE_TEMPLATE/vitro-rojas/`:**

- `us-001-model-colors.md`
- `us-002-color-selector.md`
- `us-003-simplify-address.md`
- `us-004-shipping-disclaimer.md`
- `us-005-shipping-cost.md`
- `us-006-services-included.md`
- `us-007-quote-wizard.md`
- `us-008-room-location.md`
- `us-009-tenant-branding.md`
- `us-010-whatsapp-button.md`
- `us-011-quotes-dashboard.md`
- `us-012-assign-commercial.md`
- `us-013-system-estimate-status.md`
- `us-014-commercial-review-status.md`
- `us-015-sent-to-client-status.md`
- `us-016-country-regions.md`
- `README.md` (índice)

### 4. Branch Protection (develop)

Configurar en Settings → Branches → Branch protection rules:

```
Branch name pattern: develop

Require pull request reviews before merging:
  ✓ Required number of review approvals: 1

Require status checks to pass before merging:
  ✓ Require branches to be up to date before merging
  ✓ Status checks that must pass:
    - build
    - tests
    - lint

Restrict who can push to matching branches:
  ✓ Restrict pushes that create matching branches
  ✓ Allow force pushes: Nobody
```

### 5. Milestones

Crear milestones en Issues:

```
Sprint 1
├─ Description: "Funcionalidades Core (44 puntos)"
├─ Due date: 2025-11-29
├─ Historias: US-001, US-002, US-006, US-007, US-010, US-011, US-013, US-014, US-015

Sprint 2
├─ Description: "Mejoras UX y Configuración (21 puntos)"
├─ Due date: 2025-12-20
├─ Historias: US-003, US-004, US-005, US-008, US-009, US-012, US-016

v1.0 Release
├─ Description: "Versión 1.0 para Vitro Rojas"
├─ Due date: 2025-12-31
├─ Milestone principal
```

### 6. Automaciones

#### Auto-labeling (si disponible):

```
TODO:
- Issues creados desde template vitro-rojas/ → agregar label "vitro-rojas"
- PRs con "Closes #" → enlazar automáticamente
```

#### GitHub Actions (opcional para futuro):

```
workflows/vitro-rojas-summary.yml
├─ Trigger: Weekly (viernes)
├─ Action: Generar resumen de progreso
├─ Output: Comentario en issue de seguimiento
```

---

## 📋 Cómo Usar los Templates

### Opción 1: Desde GitHub Web UI

1. Ve a Issues → New Issue
2. Haz clic en "Vitro Rojas - US-001"
3. Se pre-llena automáticamente
4. Edita solo si es necesario
5. Ajusta Labels y Assignee
6. Crea el issue

### Opción 2: GitHub CLI

```bash
# Crear issue desde template
gh issue create \
  --title "US-001: Configurar colores disponibles por modelo" \
  --label "vitro-rojas,sprint-1,alta-prioridad,backend,feature" \
  --milestone "Sprint 1" \
  --body "$(cat .github/ISSUE_TEMPLATE/vitro-rojas/us-001-model-colors.md)"

# Bulk create (todos los issues de Sprint 1)
for f in .github/ISSUE_TEMPLATE/vitro-rojas/us-00{1,2,6,7,10,11,13,14,15}-*.md; do
  gh issue create \
    --label "vitro-rojas,sprint-1" \
    --milestone "Sprint 1" \
    --body "$(cat $f)"
done
```

### Opción 3: Vía API (Programático)

```python
import requests

issues = [
  {
    "title": "US-001: Configurar colores disponibles por modelo",
    "body": open(".github/ISSUE_TEMPLATE/vitro-rojas/us-001-model-colors.md").read(),
    "labels": ["vitro-rojas", "sprint-1", "alta-prioridad"],
    "milestone": 1  # ID del milestone
  },
  # ... más issues
]

for issue in issues:
  requests.post(
    f"https://api.github.com/repos/{OWNER}/{REPO}/issues",
    headers={"Authorization": f"token {TOKEN}"},
    json=issue
  )
```

---

## 🔧 Configuración Recomendada en `package.json`

```json
{
  "scripts": {
    "vitro-rojas:create-issues": "node scripts/create-vitro-rojas-issues.js",
    "vitro-rojas:sync": "node scripts/sync-vitro-rojas.js"
  },
  "devDependencies": {
    "@octokit/rest": "^19.0.0"
  }
}
```

---

## 📊 Vista Inicial del Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│ Vitro Rojas - v1                                        [+New]  │
├──────────────────────┬──────────────────────┬──────────────────┤
│ Backlog (16)         │ Sprint 1 (9)         │ Done (0)         │
├──────────────────────┼──────────────────────┼──────────────────┤
│                      │ US-001: Colores      │                  │
│ US-003: Dirección    │ [5 pts] [Backend]    │                  │
│ [2 pts] [Media]      │                      │                  │
│                      │ US-002: Color Sel.   │                  │
│ US-004: Transporte   │ [3 pts] [Frontend]   │                  │
│ [1 pt] [Media]       │                      │                  │
│                      │ ...                  │                  │
│ ...                  │                      │                  │
└──────────────────────┴──────────────────────┴──────────────────┘

Stats:
Sprint 1: 44 puntos (9 historias)
Sprint 2: 21 puntos (7 historias)
Total: 65 puntos (16 historias)
```

---

## 🚀 Próximos Pasos

1. **Crear labels** en Settings → Labels
2. **Crear proyecto** en Projects → New Project
3. **Crear milestones** en Issues → Milestones
4. **Crear issues** usando templates (o bulk create con CLI)
5. **Asignar puntos** en el proyecto (Story Points custom field)
6. **Inicio Sprint 1**: 2025-11-01

---

## 📞 Contacto y Soporte

- **Product Owner**: Vitro Rojas (contacto@vitrorojas.com)
- **Tech Lead**: [Tu nombre]
- **Reunión Semanal**: Viernes 2pm CT (Zoom)
- **Slack Channel**: #vitro-rojas (futuro)

---

**Creado**: 27 de octubre de 2025  
**Versión**: 1.0  
**Próxima Revisión**: 03 de noviembre de 2025

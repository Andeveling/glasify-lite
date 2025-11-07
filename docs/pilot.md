---
post_title: "Piloto — Asistencia Inteligente para Cotizaciones"
author1: "Andrés"
post_slug: "piloto-asistencia-inteligente-cotizaciones"
microsoft_alias: "n/a"
featured_image: "/images/glasify-pilot.png"
categories: ["product", "requirements"]
tags: ["piloto", "IA", "cotizaciones", "ventanas", "PVC", "aluminio"]
ai_note: "yes"
summary: "Plan de piloto (12 meses) para transformar el primer minuto de atención comercial con cotización asistida; IA condicional (meta founders USD 4,000); KPIs claros y cofinanciación con aliados."
post_date: "2025-10-19"
---

## Propósito del piloto

Transformar el primer minuto de atención comercial en carpinterías y fábricas de ventanas, entregando cotizaciones automáticas y reportes accionables para el equipo comercial. 

**Modelo financiero**: modelo de cofinanciación compartida donde los Aliados Fundadores financian directamente el piloto (I+D, cloud, soporte) sin que Glasify absorba los gastos operativos. Las capacidades de IA son parte del roadmap y se activarán cuando se cumpla la meta colectiva (USD 4,000 para activar Fase 3.1 IA).

## Concepto

Nombre: "Piloto de Asistencia Inteligente para Cotizaciones".

Enfoque: experiencia comercial + cotización asistida (IA en roadmap condicional), no fabricación ni estandarización técnica per se.

## Problema (contexto resumido)

- Cotizaciones demoran horas o días.
- Los asesores no cuentan con diagnóstico ni guía técnica para argumentar.
- El cliente no se siente acompañado en el primer contacto.

## Solución propuesta (qué probaremos en el piloto)

Un sistema que automatiza el primer minuto de atención comercial combinando cálculo técnico con inteligencia conversacional.

| Etapa                        | Qué hace el sistema                                                                           | Valor agregado                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 🧮 Cotización inmediata       | Genera precio base según medidas, tipo de apertura y material (PVC o aluminio).               | Reduce tiempos y errores.                        |
| 💬 Asistente IA (condicional) | Atiende y asesora con lenguaje natural; sugiere mejoras (p. ej., mayor aislamiento acústico). | Se activa al alcanzar meta founders (USD 4,000). |
| 📑 Reporte para el asesor     | Resume perfil del cliente y estrategia de contacto (p. ej., orientado a precio vs confort).   | Permite personalizar y cerrar con argumentos.    |
| ⚙️ Gestión centralizada       | Guarda cada cotización con datos estructurados (perfil, preferencias, zona, proyecto).        | Analítica de mercado y mejora continua.          |

## Objetivos del piloto (SMART)

- Reducir el tiempo de primera cotización a ≤ 5 minutos en ≥ 70% de casos piloto (periodo 12 meses).
- Incrementar en ≥ 15% la conversión de pre‑cotización a propuesta formal vs línea base del aliado.
- Tiempo de respuesta comercial al primer contacto ≤ 24 h con brief automático.
- Recolectar evidencia para decisión go/no‑go y plan de escalamiento.
- Condicional (si IA activada por meta founders): ≥ 30% de aceptación de recomendaciones del asistente.

## Alcance y exclusiones

Incluye:
- Catálogo base + límites técnicos por modelo; pricing engine transparente (< 200 ms cálculo).
- Budget sin fricción, exportación PDF/Excel, conversión a Quote.
- Reporte de asesor para primer contacto (resumen + próximos pasos sugeridos).

Condicional (meta founders):
- Asistente IA orientado a beneficios (térmico/acústico/seguridad) con RAG por tenant.

Excluye (en el piloto):
- ERP/MRP, inventarios, órdenes de fabricación.
- Logística y despacho.
- Integraciones complejas no pactadas (se prioriza 1 CRM si aplica).

## Cohorte y criterios de selección de empresas

- Cupos: 5 aliados en la cohorte inicial (Cohorte 0; máx. 2 por ciudad para diversidad).
- Perfiles buscados: fabricantes de PVC y/o aluminio con foco en residencial y mixto.
- Criterios:
	- Compromiso de un owner comercial y un owner técnico (2–4 h/semana cada uno).
	- Catálogo y listas de precios actualizadas o validadas.
	- Disposición a compartir datos de uso anónimos para mejorar el producto.
	- Firma de NDA y DPA (acuerdo de procesamiento de datos).

## Piloto de 12 meses (cohortes continuas)

Este piloto se ejecuta durante 12 meses con un único desarrollador (founder técnico). El objetivo es recolectar datos de uso reales, validar adopción y ajustar el producto con base en evidencia. Las funcionalidades de IA son una promesa de valor futura y están sujetas a una meta de cofinanciación colectiva.

Hitos por trimestre (referenciales):

| Trimestre | Enfoque principal                                     | Entregables clave                                                                |
| --------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Q1        | Onboarding, catálogo y pricing base                   | Tenant y branding, catálogo inicial, cálculo core (< 200 ms), Budget + PDF/Excel |
| Q2        | Iteración por feedback y métricas                     | Telemetría básica, ajustes de UX, mejoras de performance y exportaciones         |
| Q3        | Integraciones opcionales (1 CRM) y reportes de asesor | Reporte de asesor, integración con 1 CRM (si aplica), procesos y disclaimers     |
| Q4        | Consolidación, evaluación de impacto y decisión       | Informe anual de uso, KPIs, decisión go/no‑go y plan de escalamiento             |
Notas:
IA no se activa en etapas tempranas. Se habilitará únicamente si se cumple la meta del Programa Founders (USD 4,000) y según prioridades acordadas.
El alcance es incremental para asegurar sostenibilidad con un equipo de 1 dev.

## Entregables por rol y limite de riesgo

### Glasify (responsabilidades limitadas)

**Compromisos técnicos**:
- Desarrollo y mantenimiento de plataforma core (cotización, Budget, PDF/Excel, reportes).
- Tenant configurado con branding del aliado.
- Integración con 1 CRM (según paquete: Premium/Estratégico).
- Soporte y training: 2 sesiones en vivo (Pionero), 3 sesiones (Premium/Estratégico) + manual + FAQ.
- Monitoreo de performance y SLA: disponibilidad ≥ 99%, tiempo de respuesta API < 200ms.

**Condicional (meta colectiva alcanzada USD 4,000)**:
- Fase 3.1 IA: Asistente de resúmenes de cotización con prompts estáticos y disclaimers claros.

**Límites de responsabilidad (Glasify NO cubre)**:
- ❌ Costos cloud no anticipados por sobre-consumo del aliado (se alertará con 2 semanas anticipación).
- ❌ Customizaciones fuera del alcance del paquete (beyond scope → cotización adicional).
- ❌ Datos históricos del aliado previos al piloto; importación de datos legacy responsabilidad del aliado.
- ❌ Cambios en catálogos frecuentes (> 1x por semana); si requiere sincronización automatizada, es adicional.
- ❌ Troubleshooting de sistemas internos del aliado (ERP, CRM, redes); Glasify solo soporta integración Glasify ↔ CRM.

**Garantía de continuidad**:
- Si Glasify no puede continuar el piloto por motivos técnicos/recursos, se notifica con 30 días anticipación.
- Acceso a exportación de datos (CSV/JSON) sin costo para que aliado pueda migrar.
- Documentación de APIs para permitir integración alternativa.

### Aliado (empresa participante)

**Compromisos obligatorios**:
- Catálogo y precios (m², accesorios, servicios) validados y actualizados; responsable de veracidad.
- Contacto técnico y comercial con disponibilidad mínima 4 h/semana (puede ser el mismo).
- Aprobación de textos, branding y disclaimers dentro de 5 días hábiles.
- Consentimiento y políticas internas para tratamiento de datos de leads de clientes.
- Participación en junta de innovación (Glasify Innovation Board) al menos 1 reunión trimestral.

**Responsabilidades operacionales**:
- Provisión de catálogo en formato Excel/CSV (plantilla Glasify).
- Actualización de precios cuando haya cambios (aliado informa vía dashboard o API).
- Feedback en sesiones de testing (mínimo 1 reunión/mes para Pionero; 2x/mes para Premium/Estratégico).
- Reporte de bugs/issues con contexto suficiente (reproducible, screenshot, usuario/sesión).

**Riesgos no asumidos por Glasify**:
- Catálogo incompleto o errores de precios: Glasify no es responsable de inexactitudes en datos suministrados por aliado.
- Cambios de requisitos frecuentes sin consenso: requieren renegociación de paquete.
- Saturación de uso (ej. > 1,000 cotizaciones/día): dispara revisión de costos y capacidad.

## Requerimientos previos e integraciones

- Datos mínimos: productos/modelos, límites de dimensiones, vidrios compatibles, reglas de precio, servicios.
- Accesos (si CRM): sandbox/API key de HubSpot, Salesforce, Zoho o PipeDrive.
- Legales: NDA, DPA, consentimiento de geolocalización cuando aplique.

## KPIs del piloto

- Negocio: tiempo a primera cotización, conversión Budget → Quote, tasa de respuesta < 24 h.
- Producto: tiempo de cálculo (< 200 ms), tiempo de carga catálogo (< 2 s), éxito de exportación (> 95%).
- Condicional (si IA activada): % aceptación de recomendaciones (> 30%), grounding rate con citas (> 90%), error de estimación dB (±3–5 cuando haya validación en campo).

## Modelos de financiación (co‑creación)

### Programa Founders (cofinanciación colectiva)

Objetivo: alcanzar una meta colectiva de USD 4,000 para desbloquear la primera fase de IA (asistente para cliente con recomendaciones básicas y RAG por tenant). Este programa funciona como un crowdfunding orientado a empresas fundadoras que co‑crean el producto.

Cómo funciona:
- Las empresas eligen un paquete de participación (ver abajo). Su aporte se suma a la meta colectiva (USD 4,000).
- Mientras la meta no se cumpla, el foco es el core (catálogo, cotización, Budget, PDF/Excel, reportes de asesor) durante el piloto de 12 meses.
- Al alcanzar la meta, se planifica y ejecuta la activación de IA de forma incremental y segura.

Transparencia y uso de fondos:
- Los aportes financian investigación y desarrollo (I+D), costos cloud y tiempo de implementación.
- - Se publica un tablero con avance hacia la meta y el estado de cada entregable asociado.

### Paquetes de participación (USD — cofinanciamiento inclusivo)

**Modelo**: Los aportes financian directamente I+D y costos cloud del piloto. Cada aliado paga proporcionalmente según su nivel de servicio. **No hay costo oculto**: todo es transparente y previsible.

| Nivel                | Aporte USD | Duración | Incluye                                                                        | Cobertura de costos             | Beneficios post‑piloto                                                    | Votos Board |
| -------------------- | ---------- | -------- | ------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------- | ----------- |
| 🧱 Aliado Pionero     | USD 500    | 12 meses | Tenant básico, catálogo simple, 1 CRM, 2 trainings, acceso Board               | Cubre ~45% costos cloud tenant  | 10% off licencia año 1; 50% aporte → crédito licencia; 1 voto             | 1           |
| ⚙️ Aliado Premium     | USD 900    | 12 meses | Tenant personalizado, catálogo complejo, 1 CRM avanzado, 3 trainings, reportes | Cubre ~75% costos cloud tenant  | 20% off licencia año 1; 75% aporte → crédito licencia; feature priorizada | 2           |
| 🧠 Aliado Estratégico | USD 1,600  | 12 meses | Personalización profunda, doble CRM, 5 trainings/consultoría, data tuning      | Cubre ~100% costos cloud tenant | 30% off licencia año 1; 100% aporte → crédito licencia; prioridad roadmap | 3           |

**Sobre costos cloud**: Los aportes están diseñados para cubrir 12 meses de hosting, database, almacenamiento y observabilidad. Si un aliado excede consumo esperado (> 2,000 cotizaciones/mes), se acuerda renegociación con 15 días anticipación.

**Calendario de pagos**:
- 50% a la firma del MoU (asegura cupo e infraestructura).
- 50% al mes 3 (post‑Q1, validamos adopción).
- Alternativa: 3 cuotas mensuales iguales iniciando mes 1 (vía contrato).

**Facturación**: Todos los aportes en USD. Si el aliado paga en moneda local (COP), se usa TRM del día de factura.

### Paquetes de participación (USD — precios de referencia)

Pensados para LATAM y claros para aliados fundadores. Facturación en USD (si el aliado prefiere COP, se usa la TRM del día de factura). Los aportes se acumulan hacia la meta colectiva de USD 4,000.

| Nivel                | Precio USD | Para quién                                 | Qué incluye (clave)                                                       | Resultados esperados (12 meses)                                         | Beneficios/Condiciones                                                               |
| -------------------- | ---------- | ------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 🧱 Aliado Pionero     | USD 500    | Micro/pequeña con catálogo simple          | Piloto con sus precios y branding; 1 sesión de training; acceso al Board  | Cotización ≤ 5 min (≥ 70% casos); 10–20 cotizaciones reales; PDF/Excel  | 10% off licencia año 1; hasta 50% del aporte abonable a licencia post‑piloto; 1 voto |
| ⚙️ Aliado Premium     | USD 900    | Equipo con CRM y catálogo por fabricante   | Catálogo personalizado; 1 CRM; 2 trainings; reporte para asesor           | Cotización ≤ 5 min; 20–40 cotizaciones; reporte asesor; CRM 1 pipeline  | 20% off licencia año 1; 1 feature menor priorizada; créditos de voto: 2              |
| 🧠 Aliado Estratégico | USD 1,600  | Fabricante con histórico para tuning de IA | 10 h de personalización; soporte ampliado; evaluación de datos históricos | Cotización ≤ 5 min; 30–60 cotizaciones; plan de mejoras basado en datos | 30% off licencia año 1; prioridad en roadmap; créditos de voto: 3; soporte ampliado  |

Notas de facturación y moneda:
- Los precios están expresados en USD. Si se paga en moneda local, se usará la TRM del día de facturación.
- Descuentos “early adopter” aplican según fecha de confirmación y cupos disponibles.
- Costos cloud del piloto se estiman y cobran en USD; variarán según uso (almacenamiento, base de datos, vector store, observabilidad y exportaciones).

Calendario de pagos sugerido: 50% a la firma (asegura cupo), 50% al mes 2. Facturación en USD. Los aportes se contabilizan hacia la meta colectiva (USD 4,000) para activar IA.

### Gestión de Riesgos y Cláusulas de Protección (Glasify + Aliados)

**Riesgos de Glasify** (mitigación):
- ✅ **Riesgo técnico**: límite de SLA 99% uptime; si se cae, se compensa con extensión de piloto (sin costo adicional). Backup geográfico asegurado.
- ✅ **Riesgo de capacidad**: si > 5 aliados solicitan al mismo tiempo, se abre Cohorte 1 (máx. 5 aliados/cohorte) con timeline de activación claro. Prioridad: Estratégico > Premium > Pionero.
- ✅ **Riesgo de escalabilidad**: si consumo cloud > presupuesto inicial, se notifica con 2 semanas anticipación. Opciones: (a) ajustar consumo con aliado, (b) renegociar aporte, o (c) pausar piloto temporalmente.
- ✅ **Riesgo de recursos**: si Glasify no puede continuar con 1 dev, se comunica con 30 días anticipación. Opciones: (a) contratar dev adicional (co‑costo con aliados Estratégico/Premium), o (b) venta a tercero con preservación de datos del aliado.

**Riesgos del Aliado** (mitigación):
- ✅ **Catálogo incompleto**: Glasify no es responsable si hay errores de precios; aliado mantiene veracidad. Cotización incluye disclaimer: "Precios indicativos sujetos a validación por asesor".
- ✅ **Baja adopción comercial**: si < 50% del equipo comercial usa el piloto, se replantea estrategia en mes 4 (revisión conjunta). Opción de capacitación adicional (sin costo si es Premium/Estratégico).
- ✅ **Datos históricos perdidos**: Glasify proporciona exportación de datos en cualquier momento (JSON/CSV); responsabilidad del aliado hacer backup.
- ✅ **Cambios de requisitos**: si aliado solicita cambios fuera del paquete, se evalúa y cotiza por separado. No frena el piloto.

**Cláusula de "No Sorpresas"**:
- Costos cloud definidos y publicados en dashboard (actualizados diariamente).
- Si hay variación > 20% vs presupuesto, se alertan ambas partes con 10 días anticipación.
- Capacidad API/DB monitorea y alerta si se aproxima a límites (80% de cuota).
- Cambios de términos requieren consenso escrito en junta (no pueden imponerse unilateralmente).

### Alternativas de Cofinanciación (Opcionales)

Para aliados que prefieren modelos alternativos:

1. **Revenue share temporal** (3–6 meses): 1–2% sobre ventas nuevas originadas por Glasify. Requiere auditoría clara de atribución (cookie/referral code).
2. **Aporte en especie**: horas de ingeniería de datos o documentación técnica. Valuadas a USD 80–120/h según expertise.
3. **Crédito acelerado**: 100% del aporte se abona a licencia post‑piloto (en lugar de 50–75%). Aplica solo a Estratégico/Premium.
4. **Pago por uso variable**: después de Q1 exitoso, cambiar a modelo de pago variable (p. ej., USD 0.50 por cotización generada, con mínimo mensual de USD 200). Evaluado en mes 4.

### Aliados Fundadores — Cohorte 0 (Protecciones especiales)

**Beneficios exclusivos**:
- ✅ Descuento del 15% sobre el paquete elegido (suma a descuentos post‑piloto).
- ✅ Espacio asegurado en Glasify Innovation Board con créditos de voto según paquete.
- ✅ Acceso prioritario a demos, roadmap y cambios antes de publicar.
- ✅ Visibilidad en tiempo real del dashboard de costos cloud y consumo.
- ✅ Primera opción para integración con nuevas funcionalidades (beta testing).

**Compromisos mínimos**:
- Disponibilidad: 4 h/semana entre owners comercial y técnico (flexible, documentado).
- Datos: compartir métricas de uso anónimas (no PII) para evaluación de impacto.
- Junta: asistencia a mínimo 3 reuniones trimestrales del Innovation Board (con opción remota).

**Garantías de salida y protección** (crítico para reducir tu riesgo):
- **Portabilidad de datos**: en cualquier momento, aliado puede solicitar exportación de (a) catálogo, (b) cotizaciones, (c) leads generados. Formato: JSON/CSV, sin costo. Entrega en < 5 días hábiles.
- **Continuidad asegurada**: si Glasify discontinúa el piloto, se notifica con mínimo 30 días. Durante ese tiempo, acceso sin restricción a plataforma para migrar datos.
- **Crédito de lealtad**: si completas 12 meses de piloto, 100% de aporte es crédito disponible para licencia post‑piloto o servicios profesionales (no reembolsable en cash).
- **Escalada de soporte**: acceso a contacto directo de Glasify para problemas críticos; SLA respuesta 4 horas (vs 24h estándar).
- **Garantía de performance**: si 3 meses consecutivos no cumple KPI de TTR ≤ 5 min (≥ 70% casos), se audita y/o se ofrece extensión sin costo.

**Renegociación de términos**:
- Al mes 6, revisión conjunta de adopción vs objetivos. Si hay desviaciones, se consensúan ajustes (scope, recursos, timeline).
- Cualquier cambio unilateral de Glasify requiere consenso previo y documentación formal.

**Post‑piloto (decisión go/no-go)**:
- **Si continúa**: Aporte del piloto se abona 50–100% según paquete (Pionero 50%, Premium 75%, Estratégico 100%) a licencia anual o servicios.
- **Si no continúa**: Acceso a exportación de datos sin costo; se ofrece período de gracia 30 días para transición.

### Costos Cloud Estimados (USD/mes) y Límites de Consumo

**Modelo**: Los costos se publican en dashboard en tiempo real. **No hay sorpresas**: alertas al 80% de cuota.

| Rubro                  | Pionero       | Premium       | Estratégico    | Notas                                          |
| ---------------------- | ------------- | ------------- | -------------- | ---------------------------------------------- |
| Base de datos (DB)     | USD 5–10      | USD 8–20      | USD 15–40      | PostgreSQL managed, backups, réplicas          |
| Almacenamiento (S3)    | USD 2–5       | USD 5–10      | USD 10–20      | Exportaciones PDF/Excel, logs, respaldos       |
| Observabilidad/Logs    | USD 0–5       | USD 5–10      | USD 10–20      | Monitoring, alertas, dashboards en tiempo real |
| Exportaciones (PDF)    | USD 0–5       | USD 2–8       | USD 5–15       | Costo por generación + almacenamiento          |
| **Total/mes estimado** | **USD 10–30** | **USD 20–60** | **USD 40–120** | Basado en 100–500 cotizaciones/mes por tenant  |

**Límites de consumo y escalada**:
- **Pionero**: hasta 500 cotizaciones/mes. Si supera, se alert y se negocia upgrade a Premium.
- **Premium**: hasta 1,500 cotizaciones/mes. Escalada a Estratégico si excede.
- **Estratégico**: hasta 5,000 cotizaciones/mes. Si requiere más, se evalúa arquitectura (caché, distribución).

**Transparencia total**: Dashboard de costos con desglose diario. Si consumo real varía > 20% vs estimado en 2 meses consecutivos, se renegocia automáticamente.

**Garantía anti‑sorpresas**: Si costos cloud exceden presupuesto negociado, Glasify cubre el 50% del exceso. El otro 50% se negocia con aliado antes de incurrir (no retroactivo).

## Escenarios de Riesgo Anticipado y Mitigación

| Escenario                              | Probabilidad  | Impacto | Acción Preventiva                                                         | Plan de Contingencia                                                         |
| -------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Caída de servicio (> 2 h)**          | Baja (5%)     | Alto    | Redundancia multi-región, monitoreo 24/7, alertas automáticas             | Extensión sin costo del piloto (5 días por 1 h de outage)                    |
| **Sobre-consumo cloud (> 50%)**        | Media (20%)   | Medio   | Límites de consumo por paquete, alertas al 80%, caché de respuestas       | Renegociación con 15 días anticipación; opción de Glasify cubrir 50% exceso  |
| **Catálogo del aliado con errores**    | Media (30%)   | Bajo    | Validación en onboarding, plantilla clara, checklist de datos             | Aliado responsable; Glasify incluye disclaimer en cotización                 |
| **Baja adopción del equipo comercial** | Media (25%)   | Medio   | Entrenamiento intenso (Q1), plantillas de uso, soporte dedicado           | Revisión en mes 4; sesiones de capacitación adicional sin costo (Premium+)   |
| **Cambios de requisitos frecuentes**   | Media (35%)   | Medio   | Scope claro en MoU, feature voting en Board, priorización documentada     | Cambios fuera del alcance → cotización separada; no frenan piloto core       |
| **Glasify no puede continuar (1 dev)** | Baja (10%)    | Alto    | Rotación de tareas documentada, manuales, soporte escalado si > 5 aliados | 30 días de notificación; opción de contratar dev con co-costo Estratégico    |
| **Datos del aliado perdidos**          | Muy baja (1%) | Crítico | Backups automatizados diarios, replicación, disaster recovery plan        | Restauración sin costo en < 4 h; exportación anterior guardada por aliado    |
| **Incumplimiento de SLA por Glasify**  | Baja (8%)     | Medio   | Monitoreo de 99% uptime, alertas proactivas, escala técnica si falla      | Extensión piloto sin costo; auditoría de root cause; plan de mejora acordado |
| **Disputa sobre costos cloud**         | Media (20%)   | Medio   | Dashboard en tiempo real, presupuestos negociados, alertas anticipadas    | Auditoría independiente; Glasify cubre 50% si hay discrepancia > 10%         |
| **Aliado solicita salida anticipada**  | Baja (10%)    | Bajo    | Acuerdo claro en MoU sobre términos; descuentos por permanencia           | Exportación de datos sin costo; crédito del aporte se transfiere a nuevo kit |

## Gobernanza, soporte y compliance

- Glasify Innovation Board (quincenal): revisión de métricas y co‑priorización de features del ciclo.
- Soporte: canal dedicado (WhatsApp/Slack), SLA respuesta 24 h hábiles.
- Seguridad/privacidad: RAG con citas, PII‑safe, retención limitada, trazabilidad de acciones.
- Propiedad de datos: el aliado mantiene titularidad de sus datos; uso agregado/anonimizado para mejora del producto.

## Glasify Innovation Board (gobernanza de co‑creación)

Objetivo: priorizar en conjunto las features a desarrollar primero durante el piloto, maximizando impacto en KPIs (TTR, conversión, adopción) con capacidad técnica disponible.

Composición y cadencia:
- 1 representante por aliado (owner comercial o técnico) + product/tech de Glasify.
- Reunión remota quincenal (45 min). Minuta y tablero público de seguimiento.

Alcance del Board:
- Priorización de backlog del piloto y pre‑roadmap v2.0 (no define precios ni contratos).
- Puede proponer experimentos y toggles por tenant. Guardrails de seguridad/privacidad/arquitectura aplican.

Créditos de voto por ciclo (no acumulables más de 2 ciclos):

| Paquete              | Créditos de voto |
| -------------------- | ---------------- |
| 🧱 Aliado Pionero     | 1                |
| ⚙️ Aliado Premium     | 2                |
| 🧠 Aliado Estratégico | 3                |

Proceso de priorización (quincenal):
1) Propuestas (hasta 48 h antes): plantilla breve con problema, hipótesis, impacto esperado en KPI(s) y evidencias.
2) Grooming técnico por Glasify: estimación de esfuerzo (T‑shirt size: S/M/L) y dependencias.
3) Votación: dot voting ponderado por créditos + scoring de impacto: score = (votos ponderados × impacto KPI) / esfuerzo.
4) Selección Top‑N según capacidad del ciclo; se publican ítems seleccionados y diferidos.
5) Seguimiento: tablero público con estado (todo/doing/done), changelog y demo al cierre del ciclo.

Reglas y guardrails:
- Veto de seguridad/privacidad/arquitectura por product/tech cuando aplique; se documenta la razón y alternativa.
- Empates: decide product considerando mayor impacto en KPIs del piloto y menor riesgo técnico.
- Fondo de cofinanciación: al menos 30% de capacidad del ciclo se asigna a ítems votados por el Board.

## Riesgos y Mitigaciones (Resumen Ejecutivo)

### Riesgos de Glasify (Mitigación Enfocada)

| Riesgo                              | Mitigación Técnica                                             | Responsable | KPI Control                                    |
| ----------------------------------- | -------------------------------------------------------------- | ----------- | ---------------------------------------------- |
| Downtime / Indisponibilidad         | Multi-región, auto-scaling, monitoring 24/7                    | DevOps      | SLA 99% uptime; alertas < 15 min               |
| Costos cloud descontrolados         | Límites por paquete, alertas al 80%, dashboard transparente    | Producto    | Variación ≤ 20% vs presupuesto / 2 meses       |
| Performance degradado (TTR > 5 min) | Caché, indexación, query optimization, load testing            | Backend     | P95 latencia < 200ms; 99% dentro SLA           |
| Seguridad/Privacidad (PII breach)   | PII filtering, encriptación, auditoría de logs, GDPR compliant | Security    | 0 breaches; auditoría trimestral               |
| Escalabilidad limitada (1 dev)      | Documentación clara, procesos automatizados, escalada técnica  | Producto    | Time to resolution < 2h para P1; capacity plan |

### Riesgos del Aliado (Protecciones del Piloto)

| Riesgo                         | Protección Glasify                                              | Garantía           |
| ------------------------------ | --------------------------------------------------------------- | ------------------ |
| Datos perdidos/corrupción      | Backups automatizados diarios, replicación, recuperación < 4h   | 100% covered       |
| Costos cloud > presupuesto     | Glasify cubre 50% de excesos; dashboard en tiempo real          | Máx. 50% adicional |
| Servicio no cumple performance | Extensión sin costo si SLA incumplido 3 meses consecutivos      | 5 días/1h outage   |
| Salida anticipada              | Exportación de datos sin costo; crédito del aporte transferible | 30 días aviso      |
| Catálogo con errores de precio | Disclaimer en cada cotización; aliado responsable veracidad     | No-liability       |

### Protecciones Mutuas (Acuerdo Vinculante)

✅ **Ambas partes se comprometen a**:
- Comunicación clara y oportuna de issues (máx. 48h para notificación).
- Revisiones conjuntas mensuales (o según frecuencia pactada).
- Escalada documentada de conflictos (no decisiones unilaterales).
- Confidencialidad de datos del aliado (uso solo para agregado/anónimo).
- Cumplimiento de leyes de privacidad (GDPR, CCPA, LGPD si aplica a LATAM).

✅ **Cláusulas especiales**:
- **Sin lock-in excesivo**: Cualquier aliado puede salir con 30 días de aviso; todos sus datos son portables.
- **Transparencia de costos**: Dashboard público de gastos reales vs presupuesto.
- **Escalada técnica**: Acceso directo a PM de Glasify si hay P1 / SLA risk.
- **Evaluación de impacto**: Auditoría independiente al mes 6 (opcional, cofinanciado).

## Resumen Financiero y Modelo de Riesgos Compartidos

### Inversión Total Piloto (12 meses, 5 aliados máximo)

| Componente         | Costo Glasify      | Cofinanciado por Aliados | Total Presupuesto      |
| ------------------ | ------------------ | ------------------------ | ---------------------- |
| I+D (dev, product) | USD 3,000/mes      | —                        | USD 36,000/12 meses    |
| Cloud hosting/DB   | —                  | USD 20–60/mes/tenant     | USD 1,200–3,600        |
| Training/Soporte   | USD 500/mes        | (incluido en paquete)    | USD 6,000/12 meses     |
| Contingencia (15%) | USD 600/mes        | —                        | USD 7,200/12 meses     |
| **Total Glasify**  | **~USD 5,000/mes** | —                        | **~USD 50,000**        |
| **Total Aliados**  | —                  | **USD 500–1,600 c/uno**  | **USD 2,500–8,000**    |
| **TOTAL PILOTO**   | —                  | —                        | **~USD 53,000–60,000** |

**Nota**: Glasify invierte I+D fija (1 dev); aliados cofinancian costos cloud. **Sin que Glasify tenga cash-out neto mayor a presupuesto I+D**.

### Distribución de Riesgo Financiero

| Riesgo                    | Glasify Asume | Aliado Asume   | Nota                                        |
| ------------------------- | ------------- | -------------- | ------------------------------------------- |
| I+D (salarios, tools)     | 100%          | —              | Inversión directa de Glasify en equipo      |
| Costos cloud esperados    | —             | 100%           | Cubiertos por aportes iniciales             |
| Costos cloud exceso (50%) | 50%           | 50%            | Acuerdo de co-costo si supera presupuesto   |
| Outage/SLA incumplido     | 100%          | —              | Glasify compensa con extensión sin costo    |
| Catálogo con errores      | —             | 100%           | Aliado responsable de veracidad de datos    |
| Salida anticipada         | —             | Crédito > cash | Aporte se convierte en crédito transferible |

### Protecciones Clave para Glasify (Reducción de Riesgo)

✅ **Modelo de pago**: 50% upfront reduce riesgo de non-payment; segundo pago al mes 3 (cuando hay evidencia de adoption).

✅ **Límites de consumo**: Cada paquete tiene techo máximo de cotizaciones/mes. Sobrepaso requiere upgrade o renegociación.

✅ **Escalada de costos**: Si exceede 20% presupuesto, Glasify cubre solo 50% del exceso. Aliado negocia el resto.

✅ **SLA vinculante**: Si Glasify no cumple 99% uptime, aliado obtiene extensión sin costo (no reembolso cash, reduce riesgo).

✅ **Salida sin lock-in**: Aliados pueden irse con 30 días aviso; datos portables. Evita demandas, mantiene reputación.

✅ **Dashboard de costos**: Transparencia = menos disputas = relación de confianza.

### Proyección de ROI (12 meses)

**Escenario Conservador** (3 aliados, Pionero):
- Ingresos: 3 × USD 500 = USD 1,500
- Costos netos: USD 50,000 − USD 1,500 = USD 48,500
- **Pérdida**: −USD 48,500 (pero datos de mercado + validación = valuación futura)

**Escenario Optimista** (5 aliados: 2 Pionero + 2 Premium + 1 Estratégico):
- Ingresos: 2×USD 500 + 2×USD 900 + 1×USD 1,600 = USD 5,400
- Costos netos: USD 50,000 − USD 5,400 = USD 44,600
- **Pérdida**: −USD 44,600 (con datos ricos para Series A / próxima ronda)

**Post-Piloto Go/No-Go** (mes 12):
- Si go: Aliados migran a licencia anual (USD 2,500–5,000/año) = payback en 8–12 meses.
- Si no-go: Exportación de datos, fin amigable, lecciones aplicadas a v2.

## Próximos pasos (CTA)

1) Agendemos demo de 20–30 minutos.
2) Selecciona paquete (Pionero/Premium/Estratégico) como Aliado Fundador.
3) Firmemos MoU + NDA/DPA.
4) Inicio T0 del piloto (12 meses) y, si aplica, cronograma de activación de IA al alcanzar la meta founders.

## Ejemplo de mensaje de invitación

> Asunto: Invitación exclusiva — sea pionero en atención comercial asistida por IA
>
> Estimado [Nombre/Empresa],
>
> Estamos impulsando un piloto de 12 meses que transforma el primer minuto de atención comercial con cotización automática y reportes para el asesor. Las capacidades de IA se activarán cuando la cohorte de Aliados Fundadores alcance la meta colectiva (USD 4,000), priorizando siempre seguridad y evidencia de uso.
>
> Nos gustaría contar con su empresa como aliado pionero, probando la herramienta con su catálogo y procesos de venta. ¿Podemos agendar una breve demostración?
>
> Atentamente,
> Andrés [tu apellido]
> Proyecto Nojau — Piloto de Asistencia Inteligente
> [tu contacto]

---

Si lo deseas, puedo preparar un brochure PDF (2 páginas) con este enfoque (flujo visual, tabla de beneficios, plan de participación) listo para enviar por correo o WhatsApp.

## Checklist de onboarding (express)

- Catálogo y listas de precios en plantilla (CSV/Excel) o Google Sheets.
- Logos/branding (PNG/SVG), textos básicos y datos de contacto.
- Dueños del piloto (comercial/técnico) y horarios de atención.
- Política interna de datos (contacto de privacidad) y confirmación de consentimiento de leads.

## Preguntas frecuentes (FAQs)

1) ¿Necesito cambiar mi CRM? No. Integramos con 1 CRM en Premium/Estratégico; si no tienes CRM, seguimos sin fricción.
2) ¿Qué pasa si mis precios cambian? Puedes actualizar listas; guardamos histórico para trazabilidad.
3) ¿La IA alucina? Usamos RAG con citas y guardrails; si no hay confianza, caemos a flujo manual.
4) ¿Quién es dueño de los datos? El aliado. Nosotros usamos métricas agregadas y anónimas para mejorar el producto.
5) ¿Qué soporte recibo? Canal dedicado, SLA 24h hábil, 2 sesiones de training (más en Estratégico).

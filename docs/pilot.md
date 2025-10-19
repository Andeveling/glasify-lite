---
post_title: "Piloto — Asistencia Inteligente para Cotizaciones"
author1: "Andrés"
post_slug: "piloto-asistencia-inteligente-cotizaciones"
microsoft_alias: "n/a"
featured_image: "/images/glasify-pilot.png"
categories: ["product", "requirements"]
tags: ["piloto", "IA", "cotizaciones", "ventanas", "PVC", "aluminio"]
ai_note: "yes"
summary: "Plan de piloto para transformar el primer minuto de atención comercial con cotización asistida por IA, KPIs claros y modelos de cofinanciación con aliados."
post_date: "2025-10-19"
---

## Propósito del piloto

Transformar el primer minuto de atención comercial en carpinterías y fábricas de ventanas, entregando cotizaciones automáticas, asesoría asistida por IA y reportes accionables para el equipo comercial.

## Concepto

Nombre: "Piloto de Asistencia Inteligente para Cotizaciones".

Enfoque: experiencia comercial + IA + cotización asistida, no fabricación ni estandarización técnica per se.

## Problema (contexto resumido)

- Cotizaciones demoran horas o días.
- Los asesores no cuentan con diagnóstico ni guía técnica para argumentar.
- El cliente no se siente acompañado en el primer contacto.

## Solución propuesta (qué probaremos en el piloto)

Un sistema que automatiza el primer minuto de atención comercial combinando cálculo técnico con inteligencia conversacional.

| Etapa                          | Qué hace el sistema                                                                           | Valor agregado                                |
| ------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 🧮 Cotización inmediata         | Genera precio base según medidas, tipo de apertura y material (PVC o aluminio).               | Reduce tiempos y errores.                     |
| 💬 Asistente IA para el cliente | Atiende y asesora con lenguaje natural; sugiere mejoras (p. ej., mayor aislamiento acústico). | Acompañamiento técnico desde el minuto 1.     |
| 📑 Reporte para el asesor       | Resume perfil del cliente y estrategia de contacto (p. ej., orientado a precio vs confort).   | Permite personalizar y cerrar con argumentos. |
| ⚙️ Gestión centralizada         | Guarda cada cotización con datos estructurados (perfil, preferencias, zona, proyecto).        | Analítica de mercado y mejora continua.       |

## Objetivos del piloto (SMART)

- Reducir el tiempo de primera cotización a ≤ 5 minutos en ≥ 80% de casos piloto.
- Incrementar en ≥ 20% la conversión de pre‑cotización a propuesta formal vs línea base del aliado.
- Lograr aceptación ≥ 30% de recomendaciones del asistente (vidrios/variantes).
- Tiempo de respuesta comercial al primer contacto ≤ 24 h con brief automático.
- Recoger evidencia para decisión go/no‑go y plan de escalamiento (v2.0 admin panel).

## Alcance y exclusiones

Incluye:
- Catálogo base + límites técnicos por modelo; pricing engine transparente (<200 ms cálculo).
- Budget sin fricción, exportación PDF/Excel, conversión a Quote.
- Asistente IA orientado a beneficios (térmico/acústico/seguridad) con RAG por tenant.
- Reporte de asesor para primer contacto (resumen + próximos pasos sugeridos).

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

## Cronograma del piloto (8 semanas)

| Semana | Hitos clave                                          | Entregables                                                | Pago sugerido |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------- | ------------- |
| 1      | Kick‑off, NDA/DPA, recolección de catálogo y precios | Matriz de catálogo, pricing de referencia, plan de pruebas | 30%           |
| 2      | Configuración tenant + branding, setup de RAG base   | Tenant activo, mock data cargada, checklist de datos       | 0%            |
| 3      | Flujo de cotización y Budget                         | Cotización en 5 min (walking skeleton), PDF básico         | 20%           |
| 4      | Asistente IA (cliente)                               | Chat guiado con 3 recomendaciones por rango de presupuesto | 0%            |
| 5      | Reporte para asesor + CRM (opcional)                 | Resumen de perfil y próxima acción; integración 1 CRM      | 20%           |
| 6      | Ajustes por feedback, guardrails y métricas          | Toggles por tenant, disclaimers, telemetría                | 0%            |
| 7      | Ensayo general con leads reales                      | 10–20 interacciones reales; reporte de resultados          | 20%           |
| 8      | Cierre: resultados, KPIs, contrato post‑piloto       | Informe final, propuesta comercial v2.0                    | 10%           |

Notas:
- El calendario puede comprimirse a 6 semanas si el aliado tiene datos listos.
- Los porcentajes son referencia; pueden adaptarse por paquete.

## Entregables por rol

Nosotros (Glasify):
- Tenant configurado con branding y catálogo de prueba/real.
- Flujo de cotización + Budget + PDF/Excel.
- Asistente IA con RAG por tenant y guardrails básicos.
- Reporte para asesor + integración con 1 CRM (opcional según paquete).
- Soporte y training: 2 sesiones en vivo + manual corto.

Aliado (empresa participante):
- Catálogo y precios (m², accesorios, servicios) validados.
- Contacto técnico y comercial con disponibilidad semanal.
- Aprobación de textos/branding y disclaimers.
- Consentimiento y políticas internas para tratamiento de datos de leads.

## Requerimientos previos e integraciones

- Datos mínimos: productos/modelos, límites de dimensiones, vidrios compatibles, reglas de precio, servicios.
- Accesos (si CRM): sandbox/API key de HubSpot, Salesforce, Zoho o PipeDrive.
- Legales: NDA, DPA, consentimiento de geolocalización cuando aplique.

## KPIs del piloto

- Negocio: tiempo a primera cotización, conversión Budget → Quote, tasa de respuesta < 24 h.
- Producto: tiempo de cálculo (< 200 ms), tiempo de carga catálogo (< 2 s), éxito de exportación (> 95%).
- IA: % aceptación de recomendaciones (> 30%), grounding rate con citas (> 90%), error de estimación dB (±3–5 cuando haya validación en campo).

## Modelos de financiación (co‑creación)

### Paquetes de participación (USD — precios de referencia)

Punto de partida pensado para LATAM y claro para inversionistas. Facturación en USD (si el aliado prefiere COP, se usa la TRM del día de factura). Resultados esperados en 8 semanas, según paquete.

| Nivel                | Precio USD | Para quién                                 | Qué incluye (clave)                                                               | Resultados esperados (8 semanas)                                          | Beneficios/Condiciones                                                               |
| -------------------- | ---------- | ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 🧱 Aliado Pionero     | USD 400    | Micro/pequeña con catálogo simple          | Piloto completo con sus precios y branding; 1 sesión de training; acceso al Board | Cotización ≤ 5 min (≥ 80% casos); 10–15 cotizaciones reales; PDF/Excel    | 10% off licencia año 1; hasta 50% del aporte abonable a licencia post‑piloto; 1 voto |
| ⚙️ Aliado Premium     | USD 800    | Equipo con CRM y catálogo por fabricante   | Catálogo personalizado; 1 CRM; 2 trainings; reporte para asesor                   | Cotización ≤ 5 min; 20–30 cotizaciones; reporte asesor; CRM 1 pipeline    | 20% off licencia año 1; 1 feature menor priorizada; créditos de voto: 2              |
| 🧠 Aliado Estratégico | USD 1,500  | Fabricante con histórico para tuning de IA | Entrenamiento IA con histórico; 10 h de personalización; piloto de 10 semanas     | Cotización ≤ 5 min; 30–50 cotizaciones; recomendaciones IA ajustadas; A/B | 30% off licencia año 1; prioridad en roadmap; créditos de voto: 3; soporte ampliado  |

Notas de facturación y moneda:
- Los precios están expresados en USD. Si se paga en moneda local, se usará la TRM del día de facturación.
- Descuentos “early adopter” aplican según fecha de confirmación y cupos disponibles.
- Costos cloud del piloto se estiman y cobran en USD; variarán según uso (almacenamiento, base de datos, vector store, observabilidad y exportaciones).

Calendario de pagos sugerido: 30/20/20/20/10 según hitos (tabla de cronograma). Facturación en USD.

### Alternativas de cofinanciación

- Créditos contra licencia: el 50–100% del aporte se abona a la licencia anual post‑piloto.
- Revenue share temporal: 3–6 meses de fee variable (p. ej., 1–2%) sobre ventas originadas por el piloto.
- Aporte en especie: horas de ingeniería comercial/datos a cambio de descuento equivalente.
- Early adopter: 15% adicional si confirma antes de [fecha], cupos limitados (máx. 6 empresas).

### Programa Early Adopter (Cohorte 0)

Beneficios:
- Descuento adicional del 15% sobre el paquete elegido.
- Espacio asegurado en el Glasify Innovation Board (créditos de voto según paquete).
- Acceso prioritario a demos internas y roadmap previo al cierre de cada ciclo.

Compromisos:
- Disponibilidad de owners (comercial/técnico) 2–4 h/semana.
- Compartir métricas de uso anónimas del piloto para evaluación de impacto.
- Participación en al menos 3 de las 4 ceremonias quincenales del Board durante el piloto.

Salida (si aplica):
- Si no se renueva post‑piloto, acceso a exportación de datos (PDF/CSV) sin costo adicional.
- Si se migra a licencia anual, se abona 50–100% del aporte del piloto según paquete.

### Costos cloud estimados (USD/mes)

Rangos referenciales por uso típico del piloto. Optimizamos con métricas reales; si hay sobreconsumo, se acuerda antes de incurrir.

| Rubro               | Pionero (USD) | Premium (USD) | Estratégico (USD) |
| ------------------- | ------------- | ------------- | ----------------- |
| Base de datos (DB)  | 5–10          | 8–20          | 15–40             |
| Almacenamiento (S3) | 2–5           | 5–10          | 10–20             |
| Vector store (RAG)  | 3–8           | 5–20          | 10–40             |
| Observabilidad      | 0–5           | 5–10          | 10–20             |
| Exportaciones (PDF) | 0–5           | 2–8           | 5–15              |
| Total estimado      | 10–30         | 20–60         | 40–120            |

Nota: Durante el piloto, estos costos están cubiertos dentro del alcance normal. Cualquier exceso material se acuerda por escrito.

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

## Riesgos y mitigaciones

- Datos incompletos o desactualizados → checklist de datos, disclaimers y supuestos claros.
- Alucinaciones de IA → RAG estricto, citas, guardrails y fallback manual.
- Baja adopción comercial → entrenamiento, plantillas de contacto y UX centrada en tareas.
- Latencia/costos → caché, límites por tenant y evaluación continua.

## Próximos pasos (CTA)

1) Agendemos demo de 30 minutos.
2) Seleccione paquete (Pionero/Premium/Estratégico) y confirme participantes.
3) Firmemos MoU + NDA/DPA.
4) Kick‑off y arranque semana 1.

## Ejemplo de mensaje de invitación

> Asunto: Invitación exclusiva — sea pionero en atención comercial asistida por IA
>
> Estimado [Nombre/Empresa],
>
> Estamos impulsando un piloto que transforma el primer minuto de atención comercial con cotización automática y asesoría integrada por IA. El sistema genera cotizaciones rápidas y produce reportes para que su equipo comercial tenga estrategias listas para orientar la decisión del cliente.
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

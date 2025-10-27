## Reunion 001

### Necesidades del cliente
1. El cliente hizo énfasis en que necesita colores para los modelos, dice que puede manejarse con un aumento porcentual.
2. Simplificar la dirección del formulario de cotización _No usar código postal_.
3. Aclarar que el transporte se calculara post cotización, el calculo del transporte es una tarea a día de hoy muy compleja la cual requiere interacción humana con el cliente. 
4. Branding de logo de empresa, redes sociales, Botón de comunicación a WhatsApp.
5. El cliente y este es el segundo solicita que los servicios puedan ser de dos tipos 1 cálculos ocultos en el precio de la ventana, es decir se pueden presentar estos dos escenarios
	1. _Quiero vender mi ventana con instalación (servicios) incluida para garantizar mi producto_
	2. _Quiero vender mi ventana con la posibilidad de que el cliente escoja si cotizamos con o sin instalación _

### Observaciones 
1. **Usuario:*** El formulario de modelo en el catalogo es redundante y tiene demasiada información, debemos simplificar el formulario para tener solo inputs de, ubicación de la ventana(alcoba, oficina, bano), ancho, alto, selección de vidrio, servicios, puede ser un wizard, stepper minimista para no sobrecargar la UI, (Bajar la carga cognitiva).
2. **Administrador:** Falta poder visualizar todas las cotizaciones con información relevante.
3. Se pensó en temas de precision, el mercado de las ventanas es muy complejo y una falla puede ser critica, Glasify no busca ser preciso ya que nuestro enfoque es hacer que la persona se sienta atendida para el primer contacto.

### Reflexión
Es posible que replantemos el estado de la cotización en cuanto a borrador.
Nuevo Flujo propuesto
1. Usuario configura sus ventanas, el sistema arroja un valor estimado.
2. La cotización es enviada -> Al `admin/seller`  estado borrador.
3. El comercial evalúa y configura lo faltan te, transporte, instalaciones complejas en pisos altos como el 20 etc, el comercial completa y envía (cambia de estado) a cotización completada o algo similar que es cuando el comercial reviso, afino precios, aplico descuentos, calculo el transporte etc. 
4. El usuario es contactado con la nueva version en PDF


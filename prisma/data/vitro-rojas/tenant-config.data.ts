/**
 * Vitro Rojas - Tenant Configuration
 *
 * Configuración de negocio para Vitro Rojas S.A.
 * Este archivo contiene los datos que irán en el TenantConfig singleton.
 *
 * Nota: Los datos deben coincidir con las variables de entorno TENANT_*
 * definidas en .env para que seed-tenant.ts funcione correctamente.
 *
 * Variables de entorno requeridas (.env):
 * ```
 * TENANT_BUSINESS_NAME="Vitro Rojas S.A."
 * TENANT_CURRENCY="USD"
 * TENANT_LOCALE="es-PA"
 * TENANT_TIMEZONE="America/Panama"
 * TENANT_QUOTE_VALIDITY_DAYS="15"
 * TENANT_CONTACT_EMAIL="ventas@vitrorojas.com"
 * TENANT_CONTACT_PHONE="+507-123-4567"
 * TENANT_BUSINESS_ADDRESS="Ciudad de Panamá, Panamá"
 * ```
 *
 * @version 1.0.0
 * @date 2025-01-21
 */

export const vitroRojasTenantConfig = {
  businessName: 'Vitro Rojas S.A.',
  businessAddress: 'Ciudad de Panamá, Panamá',
  contactEmail: 'ventas@vitrorojas.com',
  contactPhone: '+507-123-4567',
  currency: 'USD', // Dólar estadounidense (moneda oficial de Panamá)
  locale: 'es-PA', // Español de Panamá
  quoteValidityDays: 15, // 15 días de validez para cotizaciones
  timezone: 'America/Panama', // Zona horaria EST (UTC-5)
} as const;

/**
 * Notas sobre configuración de Panamá:
 *
 * - Moneda: USD es la moneda oficial de Panamá (no tienen moneda local propia)
 * - Locale: es-PA para formateo de fechas/números en español panameño
 * - Timezone: America/Panama (equivalente a EST, UTC-5, sin DST)
 * - IVA: Panamá tiene ITBMS (7%) pero no se incluye en configuración base
 */

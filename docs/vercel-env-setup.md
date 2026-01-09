# Configuración de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Deploy Fallará Sin Estas Variables

El build en Vercel **fallará** si no configuras las variables de entorno requeridas.

## 📋 Variables Requeridas

Agrega estas 5 variables en Vercel Dashboard:

### 1. NEXT_PUBLIC_TENANT_BUSINESS_NAME
- **Valor**: `"Vitro Rojas Panamá"`
- **Descripción**: Nombre del negocio

### 2. NEXT_PUBLIC_TENANT_CURRENCY  
- **Valor**: `"USD"`
- **Descripción**: Código de moneda (ISO 4217, 3 letras)

### 3. NEXT_PUBLIC_TENANT_LOCALE
- **Valor**: `"es-PA"`  
- **Descripción**: Locale (formato: idioma-PAÍS)

### 4. NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS
- **Valor**: `"15"`
- **Descripción**: Días de validez de cotizaciones

### 5. NEXT_PUBLIC_TENANT_TIMEZONE
- **Valor**: `"America/Panama"`
- **Descripción**: Zona horaria (IANA identifier)

## 🚀 Pasos en Vercel Dashboard

1. Ve a: https://vercel.com/andeveling/glasify-lite/settings/environment-variables
2. Click en "Add New" 
3. Para cada variable:
   - **Name**: Copia el nombre exacto (ej: `NEXT_PUBLIC_TENANT_BUSINESS_NAME`)
   - **Value**: Pega el valor (ej: `Vitro Rojas Panamá`)
   - **Environments**: Selecciona **Production, Preview, Development**
4. Click "Save"
5. Repite para las 5 variables

## ✅ Verificación

Después de agregar todas las variables:
- Vercel hará **auto-redeploy** del último commit
- El build debería completarse exitosamente
- Revisa los logs: https://vercel.com/andeveling/glasify-lite/deployments

## 🔄 Cambiar Configuración de Tenant

Si necesitas cambiar el nombre del negocio, moneda, etc:
1. Edita las variables en Vercel Dashboard
2. Click "Redeploy" → Se rebuildeará la app con la nueva config

## ❓ Troubleshooting

**Error**: `ZodError: Required at "NEXT_PUBLIC_TENANT_BUSINESS_NAME"`
- **Solución**: Falta agregar esa variable en Vercel

**Cambié una variable pero no se refleja**
- **Solución**: Necesitas hacer re-deploy manual en Vercel

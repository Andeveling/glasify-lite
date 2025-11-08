#!/bin/bash
# ============================================================
# Glasify Lite - Pre-Deployment Verification Script
# ============================================================
# Verifica que todas las variables de entorno estén
# configuradas correctamente antes de desplegar a Vercel
# ============================================================

set -e

echo "🔍 Verificando configuración de Vitro Rojas..."
echo ""

# ============================================================
# 1. Verificar .env.local existe
# ============================================================
echo "📋 1. Verificando archivos de configuración..."
if [ ! -f .env.local ]; then
  echo "❌ ERROR: .env.local no existe"
  echo "   Solución: Copiar .env.vitro-rojas-production.example a .env.local"
  exit 1
fi
echo "✅ .env.local existe"

# ============================================================
# 2. Contar variables en .env.local
# ============================================================
VARS_COUNT=$(grep -c "^[A-Z_]" .env.local || true)
echo "✅ Variables en .env.local: $VARS_COUNT"

# ============================================================
# 3. Verificar variables críticas
# ============================================================
echo ""
echo "🔐 2. Verificando variables CRÍTICAS..."

CRITICAL_VARS=(
  "BETTER_AUTH_SECRET"
  "AUTH_GOOGLE_ID"
  "AUTH_GOOGLE_SECRET"
  "DATABASE_URL"
  "DIRECT_URL"
  "BASE_URL"
  "ADMIN_EMAIL"
)

for var in "${CRITICAL_VARS[@]}"; do
  if grep -q "^$var=" .env.local; then
    VALUE=$(grep "^$var=" .env.local | cut -d= -f2- | tr -d '"')
    if [ -z "$VALUE" ]; then
      echo "⚠️  $var está vacío"
    else
      # Show first/last 10 chars para verificar sin mostrar secreto completo
      if [ ${#VALUE} -gt 20 ]; then
        PREVIEW="${VALUE:0:10}...${VALUE: -10}"
      else
        PREVIEW="$VALUE"
      fi
      echo "✅ $var = $PREVIEW"
    fi
  else
    echo "❌ ERROR: $var NO ENCONTRADA en .env.local"
  fi
done

# ============================================================
# 4. Verificar no hay secretos en git
# ============================================================
echo ""
echo "🔒 3. Verificando que no haya secretos en git..."

SECRETS_FOUND=0
for var in BETTER_AUTH_SECRET AUTH_GOOGLE_SECRET; do
  if git log -p --all -- '*.md' '*.example' | grep -q "$var.*[a-zA-Z0-9]"; then
    echo "⚠️  Posible $var encontrado en historial"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
  fi
done

if [ $SECRETS_FOUND -eq 0 ]; then
  echo "✅ No se encontraron secretos comprometidos en git"
else
  echo "⚠️  Revisar posibles secretos en git"
fi

# ============================================================
# 5. Verificar .gitignore
# ============================================================
echo ""
echo "📝 4. Verificando .gitignore..."

if grep -q "^\.env$" .gitignore; then
  echo "✅ .env está en .gitignore"
else
  echo "❌ .env NO está en .gitignore"
fi

if grep -q "\.env\.local" .gitignore; then
  echo "✅ .env.local está en .gitignore"
else
  echo "❌ .env.local NO está en .gitignore"
fi

# ============================================================
# 6. Verificar TypeScript compila
# ============================================================
echo ""
echo "🏗️  5. Verificando TypeScript compilation..."

if pnpm typecheck > /dev/null 2>&1; then
  echo "✅ TypeScript compila sin errores"
else
  echo "❌ ERROR: TypeScript tiene errores"
  pnpm typecheck
  exit 1
fi

# ============================================================
# 7. Verificar variables de Tenant
# ============================================================
echo ""
echo "🏢 6. Verificando configuración de TENANT..."

TENANT_VARS=(
  "TENANT_BUSINESS_NAME:Vitro Rojas"
  "TENANT_CURRENCY:USD"
  "TENANT_LOCALE:es-PA"
  "TENANT_TIMEZONE:America/Panama"
)

for var_spec in "${TENANT_VARS[@]}"; do
  var_name="${var_spec%%:*}"
  expected_value="${var_spec##*:}"
  
  if grep -q "^$var_name=" .env.local; then
    actual_value=$(grep "^$var_name=" .env.local | cut -d= -f2- | tr -d '"')
    if [ "$actual_value" == "$expected_value" ]; then
      echo "✅ $var_name = $actual_value"
    else
      echo "⚠️  $var_name = $actual_value (esperado: $expected_value)"
    fi
  else
    echo "❌ $var_name NO ENCONTRADA"
  fi
done

# ============================================================
# 8. Verificar branding
# ============================================================
echo ""
echo "🎨 7. Verificando BRANDING..."

if grep -q "NEXT_PUBLIC_COMPANY_NAME=\"Vitro Rojas\"" .env.local; then
  echo "✅ NEXT_PUBLIC_COMPANY_NAME = Vitro Rojas"
else
  echo "⚠️  NEXT_PUBLIC_COMPANY_NAME no es 'Vitro Rojas'"
fi

if grep -q "NEXT_PUBLIC_COMPANY_LOGO_URL" .env.local; then
  echo "✅ NEXT_PUBLIC_COMPANY_LOGO_URL configurada"
else
  echo "⚠️  NEXT_PUBLIC_COMPANY_LOGO_URL no configurada"
fi

# ============================================================
# 9. Resumen final
# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ VERIFICACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Verifica los valores ⚠️  si los hay"
echo "  2. Ve a: https://vercel.com/dashboard"
echo "  3. Proyecto: glasify-lite"
echo "  4. Settings → Environment Variables"
echo "  5. Agrega todas las variables de .env.local"
echo "  6. Redeploy"
echo ""
echo "📚 Referencias:"
echo "  - Guía rápida: docs/vitro-rojas-quick-start.md"
echo "  - Checklist completo: docs/vitro-rojas-deployment-checklist.md"
echo "  - Copy/paste: docs/vercel-environment-variables-copy-paste.md"
echo ""

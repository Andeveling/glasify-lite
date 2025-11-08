#!/bin/bash
# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                           ║
# ║   🚀 MIGRACIÓN PRISMA → DRIZZLE - VERIFICACIÓN SETUP                    ║
# ║                                                                           ║
# ║   Verifica que todos los archivos necesarios están en su lugar           ║
# ║                                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

echo ""
echo "📋 VERIFICANDO SETUP MIGRACIÓN PRISMA → DRIZZLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_TOTAL=0

# Helper function
check_file() {
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌${NC} $2"
        echo "   Falta: $1"
    fi
}

check_dir() {
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌${NC} $2"
        echo "   Falta: $1"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════

echo "📁 ARCHIVOS DE CÓDIGO:"
echo "─────────────────────────"
check_file "src/server/db/schema.ts" "Schema Drizzle (27 tablas, 11 enums)"
check_file "src/server/db/index.ts" "Cliente Drizzle singleton"
check_file "drizzle.config.ts" "Configuración Drizzle"

echo ""
echo "📄 DOCUMENTACIÓN:"
echo "─────────────────────────"
check_dir "docs/migrations" "Carpeta docs/migrations"
check_file "docs/migrations/README.md" "Índice maestro"
check_file "docs/migrations/EXECUTIVE_SUMMARY.md" "Resumen ejecutivo"
check_file "docs/migrations/PHASE_1_SETUP_INSTRUCTIONS.md" "Setup instructions"
check_file "docs/migrations/EXECUTION_GUIDE_PHASE1.md" "Guía de ejecución"
check_file "docs/migrations/CONVERSION_GUIDE.md" "Guía de conversión"
check_file "docs/migrations/DEVELOPER_TIPS.md" "Developer tips"

echo ""
echo "📌 ARCHIVOS EN RAÍZ:"
echo "─────────────────────────"
check_file "FINAL_SUMMARY.md" "Resumen final"
check_file "PRISMA_TO_DRIZZLE_MIGRATION.md" "Guía principal"
check_file ".DRIZZLE_START_HERE.txt" "Referencia visual rápida"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════════════════════════════════════

echo "📊 RESUMEN:"
echo "─────────────────────────"
echo "Verificaciones pasadas: $CHECKS_PASSED/$CHECKS_TOTAL"
echo ""

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}✅ TODO ESTÁ LISTO${NC}"
    echo ""
    echo "Próximo paso:"
    echo "  cat docs/migrations/EXECUTION_GUIDE_PHASE1.md"
    echo ""
else
    echo -e "${YELLOW}⚠️  FALTA COMPLETAR${NC}"
    echo "Verifica los archivos faltantes"
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════

echo "📚 GUÍA RÁPIDA:"
echo "─────────────────────────"
echo "1. Resumen (5 min)      → cat FINAL_SUMMARY.md"
echo "2. Ejecutivo (15 min)   → cat docs/migrations/EXECUTIVE_SUMMARY.md"
echo "3. Comienza aquí (2-3h) → cat docs/migrations/EXECUTION_GUIDE_PHASE1.md"
echo ""
echo "📖 Índice completo: cat docs/migrations/README.md"
echo ""

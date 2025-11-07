#!/bin/bash

# Script para configurar DATABASE_URL con Neon MCP Server
# Uso: ./scripts/setup-neon-mcp.sh

set -e

echo "🔧 Glasify Lite - Neon MCP Configuration Helper"
echo "================================================"
echo ""

# Check if MCP connection string is provided
if [ -z "$1" ]; then
  echo "📋 Copia la connection string del panel MCP de VS Code"
  echo "   Ejemplo: postgresql://neon:mpg@localhost:5432/neondb"
  echo ""
  read -p "Pega aquí la connection string: " MCP_URL
else
  MCP_URL=$1
fi

# Validate format
if [[ ! "$MCP_URL" =~ ^postgresql:// ]]; then
  echo "❌ Error: La URL debe empezar con 'postgresql://'"
  exit 1
fi

# Backup existing .env if it exists
if [ -f .env ]; then
  BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
  cp .env "$BACKUP_FILE"
  echo "✅ Backup creado: $BACKUP_FILE"
fi

# Update or create .env
if [ -f .env ]; then
  # Update existing DATABASE_URL
  if grep -q "^DATABASE_URL=" .env; then
    sed -i.tmp "s|^DATABASE_URL=.*|DATABASE_URL=\"$MCP_URL\"|" .env
    rm -f .env.tmp
    echo "✅ DATABASE_URL actualizado en .env"
  else
    echo "DATABASE_URL=\"$MCP_URL\"" >> .env
    echo "✅ DATABASE_URL agregado a .env"
  fi
else
  # Create new .env from example
  if [ -f .env.example ]; then
    cp .env.example .env
    sed -i.tmp "s|^DATABASE_URL=.*|DATABASE_URL=\"$MCP_URL\"|" .env
    rm -f .env.tmp
    echo "✅ .env creado desde .env.example"
  else
    echo "DATABASE_URL=\"$MCP_URL\"" > .env
    echo "✅ .env creado con DATABASE_URL"
  fi
fi

echo ""
echo "🎯 Próximos pasos:"
echo "1. Asegúrate de que el MCP server esté conectado en VS Code"
echo "2. Ejecuta: pnpm prisma generate"
echo "3. Ejecuta: pnpm db:migrate (para aplicar migraciones)"
echo "4. Ejecuta: pnpm seed:minimal (opcional, para datos de prueba)"
echo ""
echo "✨ Configuración completa!"

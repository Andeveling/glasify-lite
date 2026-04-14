#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Initializing Glasify Lite..."

cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install --frozen-lockfile
else
    echo "✓ Dependencies already installed"
fi

echo "🔧 Generating Prisma client..."
pnpm prisma generate

echo "🗄️  Syncing database schema..."
DATABASE_URL="file:./prisma/dev.db" pnpm prisma db push

echo "✅ Ready! Starting dev server on http://localhost:3000"
pnpm dev --port 3000

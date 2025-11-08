#!/bin/bash
# ============================================================
# Upload Environment Variables to Vercel
# ============================================================
# This script uploads all required environment variables from .env.local
# to Vercel for production, preview, and development environments
#
# Usage: chmod +x scripts/upload-vercel-env.sh && ./scripts/upload-vercel-env.sh
# ============================================================

set -e  # Exit on error

echo "🚀 Uploading environment variables to Vercel..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Load .env.local safely (handles spaces in values)
set -o allexport
source .env.local
set +o allexport

# Function to add environment variable to Vercel
add_env() {
    local key=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo "⚠️  Skipping $key (empty value)"
        return
    fi
    
    echo "📝 Adding $key to production..."
    echo "$value" | vercel env add "$key" production
    
    echo "📝 Adding $key to preview..."
    echo "$value" | vercel env add "$key" preview
    
    echo "📝 Adding $key to development..."
    echo "$value" | vercel env add "$key" development
    
    echo "✅ $key added to all environments"
    echo ""
}

# ============================================================
# SERVER-SIDE VARIABLES (All Environments)
# ============================================================
echo "📦 Server-Side Variables (production, preview, development):"
echo ""

add_env "DATABASE_URL" "$DATABASE_URL"
add_env "DIRECT_URL" "$DIRECT_URL"
add_env "PRISMA_CONNECTION_LIMIT" "$PRISMA_CONNECTION_LIMIT"

add_env "BETTER_AUTH_SECRET" "$BETTER_AUTH_SECRET"
add_env "BASE_URL" "$BASE_URL"

add_env "AUTH_GOOGLE_ID" "$AUTH_GOOGLE_ID"
add_env "AUTH_GOOGLE_SECRET" "$AUTH_GOOGLE_SECRET"

add_env "ADMIN_EMAIL" "$ADMIN_EMAIL"

add_env "RESEND_API_KEY" "$RESEND_API_KEY"
add_env "FROM_EMAIL" "$FROM_EMAIL"

add_env "EXPORT_PDF_PAGE_SIZE" "$EXPORT_PDF_PAGE_SIZE"
add_env "EXPORT_MAX_ITEMS" "$EXPORT_MAX_ITEMS"

add_env "TENANT_BUSINESS_NAME" "$TENANT_BUSINESS_NAME"
add_env "TENANT_CURRENCY" "$TENANT_CURRENCY"
add_env "TENANT_LOCALE" "$TENANT_LOCALE"
add_env "TENANT_TIMEZONE" "$TENANT_TIMEZONE"
add_env "TENANT_QUOTE_VALIDITY_DAYS" "$TENANT_QUOTE_VALIDITY_DAYS"

add_env "TENANT_CONTACT_EMAIL" "$TENANT_CONTACT_EMAIL"
add_env "TENANT_CONTACT_PHONE" "$TENANT_CONTACT_PHONE"
add_env "TENANT_BUSINESS_ADDRESS" "$TENANT_BUSINESS_ADDRESS"

# ============================================================
# CLIENT-SIDE VARIABLES (NEXT_PUBLIC_*)
# ============================================================
echo ""
echo "🌐 Client-Side Variables (production, preview, development):"
echo ""

add_env "NEXT_PUBLIC_COMPANY_NAME" "$NEXT_PUBLIC_COMPANY_NAME"
add_env "NEXT_PUBLIC_COMPANY_LOGO_URL" "$NEXT_PUBLIC_COMPANY_LOGO_URL"

echo ""
echo "✅ All environment variables uploaded to Vercel!"
echo ""
echo "🔄 Next steps:"
echo "  1. Trigger a new deployment: vercel deploy --prod"
echo "  2. Or push to GitHub to trigger automatic deployment"
echo ""

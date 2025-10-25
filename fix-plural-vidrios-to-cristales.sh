#!/bin/bash

##############################################################################
# Script: fix-plural-cristales-to-cristales.sh
# Description: Replace remaining "cristales" with "cristales" throughout the project
# Usage: ./fix-plural-cristales-to-cristales.sh
# Note: This script preserves case sensitivity and creates backups
##############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" || exit 1
BACKUP_DIR="${PROJECT_ROOT}/.backups/cristales-to-cristales-$(date +%s)"
LOG_FILE="${PROJECT_ROOT}/.backups/fix-plural-log-$(date +%Y%m%d-%H%M%S).txt"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Script: Fix 'cristales' → 'cristales' (Plural)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}" || { echo -e "${RED}Error creating backup directory${NC}"; exit 1; }
mkdir -p "$(dirname "${LOG_FILE}")" || { echo -e "${RED}Error creating log directory${NC}"; exit 1; }

echo -e "${YELLOW}Backup directory: ${BACKUP_DIR}${NC}"
echo ""

# Find all relevant files
echo -e "${BLUE}Searching for files containing 'cristales'...${NC}"

# Use find with simpler syntax
FILES_WITH_VIDRIOS=$(find "${PROJECT_ROOT}" \
  -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/.playwright-mcp/*" \
  -not -path "*/.backups/*" \
  -not -name "*.lock" \
  -not -name "pnpm-lock.yaml" \
  -not -name "*.swp" \
  -not -name "*.swo" \
  -not -name "*~" \
  2>/dev/null)

# Filter files that contain cristales
FILTERED_FILES=""
while IFS= read -r file; do
  if [ -n "$file" ] && grep -q "cristales" "$file" 2>/dev/null; then
    FILTERED_FILES="${FILTERED_FILES}${file}"$'\n'
  fi
done <<< "$FILES_WITH_VIDRIOS"

# Remove trailing newline
FILES_WITH_VIDRIOS=$(echo "$FILTERED_FILES" | sed '/^$/d')

if [ -z "$FILES_WITH_VIDRIOS" ]; then
  echo -e "${YELLOW}No files containing 'cristales' found.${NC}"
  exit 0
fi

FILE_COUNT=$(echo "$FILES_WITH_VIDRIOS" | wc -l)
echo -e "${GREEN}Found ${FILE_COUNT} files containing 'cristales'${NC}"
echo ""

# Initialize counters
TOTAL_FILES=0
TOTAL_REPLACEMENTS=0

echo -e "${BLUE}Processing files...${NC}"
echo ""

# Process each file
while IFS= read -r file; do
  if [ -z "$file" ]; then
    continue
  fi
  
  # Count occurrences before
  BEFORE=$(grep -o "cristales" "$file" 2>/dev/null | wc -l)
  
  if [ "$BEFORE" -eq 0 ]; then
    continue
  fi
  
  # Create backup
  RELATIVE_PATH="${file#$PROJECT_ROOT/}"
  BACKUP_FILE="${BACKUP_DIR}/${RELATIVE_PATH}"
  mkdir -p "$(dirname "$BACKUP_FILE")" || continue
  cp "$file" "$BACKUP_FILE" || continue
  
  # Replace in the file - only "cristales" → "cristales"
  if ! sed -i 's/cristales/cristales/g' "$file"; then
    echo -e "${RED}✗${NC} ${RELATIVE_PATH} (error in sed)"
    continue
  fi
  
  # Count occurrences after
  AFTER=$(grep -o "cristales" "$file" 2>/dev/null | wc -l)
  
  TOTAL_FILES=$((TOTAL_FILES + 1))
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + BEFORE))
  
  echo -e "${GREEN}✓${NC} ${RELATIVE_PATH}"
  echo "  Replacements: ${BEFORE} instances of 'cristales' → 'cristales'" | tee -a "${LOG_FILE}"
  
done <<< "$FILES_WITH_VIDRIOS"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Replacement completed!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  Total files processed: ${TOTAL_FILES}"
echo "  Total replacements: ${TOTAL_REPLACEMENTS}"
echo "  Backup location: ${BACKUP_DIR}"
echo "  Log file: ${LOG_FILE}"
echo ""

echo -e "${YELLOW}To rollback changes:${NC}"
echo "  cp -r ${BACKUP_DIR}/* ${PROJECT_ROOT}/"
echo ""

# Add summary to log file
{
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "SUMMARY"
  echo "════════════════════════════════════════════════════════════"
  echo "Total files processed: ${TOTAL_FILES}"
  echo "Total replacements: ${TOTAL_REPLACEMENTS}"
  echo "Timestamp: $(date)"
  echo "Backup location: ${BACKUP_DIR}"
} >> "${LOG_FILE}"

echo -e "${GREEN}Done!${NC}"

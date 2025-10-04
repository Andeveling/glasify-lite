#!/bin/bash

# Authentication Testing Suite
# Runs all authentication-related tests to verify functionality

set -e

echo "🔐 Starting Glasify Authentication Test Suite"
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
UNIT_TESTS_PASSED=false
INTEGRATION_TESTS_PASSED=false
E2E_TESTS_PASSED=false

echo ""
echo -e "${BLUE}📋 Pre-test Checklist${NC}"
echo "================================"

# Check if dependencies are installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if [ ! -f package.json ]; then
    echo -e "${RED}❌ package.json not found. Run from project root.${NC}"
    exit 1
fi

if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  Node modules not found. Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Environment check passed${NC}"

echo ""
echo -e "${BLUE}🧪 Running Unit Tests${NC}"
echo "================================"

# Run unit tests for authentication components
echo "Running SignInForm component tests..."
if npm run test -- tests/unit/auth/signin-form.spec.tsx --run; then
    echo -e "${GREEN}✅ SignInForm tests passed${NC}"
else
    echo -e "${RED}❌ SignInForm tests failed${NC}"
    exit 1
fi

echo "Running AuthCard component tests..."
if npm run test -- tests/unit/auth/auth-card.spec.tsx --run; then
    echo -e "${GREEN}✅ AuthCard tests passed${NC}"
    UNIT_TESTS_PASSED=true
else
    echo -e "${RED}❌ AuthCard tests failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Running Integration Tests${NC}"
echo "================================"

# Run integration tests for authentication flow
echo "Running authentication flow integration tests..."
if npm run test -- tests/integration/auth/signin-flow.spec.tsx --run; then
    echo -e "${GREEN}✅ Authentication flow tests passed${NC}"
    INTEGRATION_TESTS_PASSED=true
else
    echo -e "${RED}❌ Authentication flow tests failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🎭 Running E2E Tests${NC}"
echo "================================"

# Check if development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${YELLOW}⚠️  Development server not running. Starting...${NC}"
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for development server to start..."
    sleep 10
    
    # Check if server is now running
    if ! curl -s http://localhost:3000 > /dev/null; then
        echo -e "${RED}❌ Failed to start development server${NC}"
        kill $DEV_SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    STARTED_DEV_SERVER=true
else
    echo -e "${GREEN}✅ Development server is running${NC}"
    STARTED_DEV_SERVER=false
fi

# Run E2E tests
echo "Running authentication E2E tests..."
if npm run test:e2e -- e2e/auth/signin.spec.ts; then
    echo -e "${GREEN}✅ E2E authentication tests passed${NC}"
    E2E_TESTS_PASSED=true
else
    echo -e "${RED}❌ E2E authentication tests failed${NC}"
    
    # Clean up dev server if we started it
    if [ "$STARTED_DEV_SERVER" = true ]; then
        echo "Stopping development server..."
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
    
    exit 1
fi

# Clean up dev server if we started it
if [ "$STARTED_DEV_SERVER" = true ]; then
    echo "Stopping development server..."
    kill $DEV_SERVER_PID 2>/dev/null || true
fi

echo ""
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "================================"

echo -n "Unit Tests: "
if [ "$UNIT_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "Integration Tests: "
if [ "$INTEGRATION_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo -n "E2E Tests: "
if [ "$E2E_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo ""
if [ "$UNIT_TESTS_PASSED" = true ] && [ "$INTEGRATION_TESTS_PASSED" = true ] && [ "$E2E_TESTS_PASSED" = true ]; then
    echo -e "${GREEN}🎉 All authentication tests passed!${NC}"
    echo ""
    echo -e "${BLUE}📋 Manual Testing${NC}"
    echo "Next steps:"
    echo "1. Review the manual testing checklist: tests/manual/auth-ui-checklist.md"
    echo "2. Test the sign-in page manually at: http://localhost:3000/signin"
    echo "3. Verify authentication flow in different browsers"
    echo "4. Test responsive design on various screen sizes"
    echo ""
    echo -e "${GREEN}Authentication system is ready for production! 🚀${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the output above.${NC}"
    exit 1
fi
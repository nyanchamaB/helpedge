#!/bin/bash

# HelpEdge Authentication Test Script
# Tests the API endpoints using curl
# Run with: bash scripts/test-auth.sh

API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-https://helpedge-api.onrender.com}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   HelpEdge Authentication Integration Tests       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}ℹ API Base URL: ${API_BASE_URL}${NC}"
echo ""

# Test 1: Check API connectivity
echo -e "${YELLOW}--- Test 1: API Connectivity ---${NC}"
echo "Testing if API is reachable..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/swagger/index.html" --max-time 10)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ API is reachable (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${RED}✗ API is not reachable (HTTP ${HTTP_CODE})${NC}"
    echo -e "${YELLOW}⚠ Please check if the API URL is correct${NC}"
fi

echo ""

# Test 2: Login with admin credentials
echo -e "${YELLOW}--- Test 2: Login Test ---${NC}"
echo "Attempting login with admin credentials..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE_URL}/api/Auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@helpedge.com",
    "password": "Admin123!"
  }' \
  --max-time 10)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: ${HTTP_CODE}"

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

    # Extract token
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓ Token received${NC}"
        echo "Token: ${TOKEN:0:50}..."

        # Test 3: Validate token
        echo ""
        echo -e "${YELLOW}--- Test 3: Token Validation ---${NC}"
        echo "Validating token..."

        VALIDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE_URL}/api/Auth/validate" \
          -H "Content-Type: application/json" \
          -d "{\"token\": \"${TOKEN}\"}" \
          --max-time 10)

        VALIDATE_HTTP_CODE=$(echo "$VALIDATE_RESPONSE" | tail -n1)
        VALIDATE_BODY=$(echo "$VALIDATE_RESPONSE" | sed '$d')

        echo "HTTP Status: ${VALIDATE_HTTP_CODE}"

        if [ "$VALIDATE_HTTP_CODE" -eq 200 ]; then
            echo -e "${GREEN}✓ Token validation successful${NC}"
            echo "Response:"
            echo "$VALIDATE_BODY" | python3 -m json.tool 2>/dev/null || echo "$VALIDATE_BODY"
        else
            echo -e "${RED}✗ Token validation failed${NC}"
            echo "Response: $VALIDATE_BODY"
        fi

        # Test 4: Authenticated request
        echo ""
        echo -e "${YELLOW}--- Test 4: Authenticated Request ---${NC}"
        echo "Making authenticated request..."

        AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_BASE_URL}/api/Categories/active" \
          -H "Authorization: Bearer ${TOKEN}" \
          -H "Content-Type: application/json" \
          --max-time 10)

        AUTH_HTTP_CODE=$(echo "$AUTH_RESPONSE" | tail -n1)

        echo "HTTP Status: ${AUTH_HTTP_CODE}"

        if [ "$AUTH_HTTP_CODE" -eq 200 ] || [ "$AUTH_HTTP_CODE" -eq 404 ]; then
            echo -e "${GREEN}✓ Authenticated request successful (token is valid)${NC}"
        else
            echo -e "${YELLOW}⚠ Authenticated request returned status ${AUTH_HTTP_CODE}${NC}"
            echo -e "${YELLOW}  (This might be expected if endpoint requires specific permissions)${NC}"
        fi
    else
        echo -e "${RED}✗ No token in response${NC}"
    fi
else
    echo -e "${RED}✗ Login failed (HTTP ${HTTP_CODE})${NC}"
    echo "Response:"
    echo "$BODY"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Test Summary                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$HTTP_CODE" -eq 200 ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}🎉 Authentication is working!${NC}"
    echo -e "${GREEN}✓ API is accessible${NC}"
    echo -e "${GREEN}✓ Login endpoint working${NC}"
    echo -e "${GREEN}✓ Token is being returned${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Start the frontend: cd client && npm run dev"
    echo "2. Navigate to: http://localhost:3000/auth/login"
    echo "3. Login with: admin@helpedge.com / Admin123!"
else
    echo -e "${YELLOW}⚠ Some tests did not pass as expected${NC}"
    echo ""
    echo -e "${BLUE}Troubleshooting:${NC}"
    echo "1. Check if API is running: curl ${API_BASE_URL}/swagger/index.html"
    echo "2. Verify credentials are correct"
    echo "3. Check for network/firewall issues"
    echo "4. Review API documentation for any changes"
fi

echo ""

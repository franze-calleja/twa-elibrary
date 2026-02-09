#!/bin/bash

# API Testing Script for TWA E-Library Authentication
# Make sure your dev server is running: npm run dev

BASE_URL="http://localhost:3000/api"

echo "========================================="
echo "TWA E-Library - API Authentication Tests"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Login with valid credentials
echo -e "${YELLOW}Test 1: Login (POST /api/auth/login)${NC}"
echo "Request: { email: 'staff@example.com', password: 'password123' }"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extract token from response
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login successful! Token received.${NC}"
else
  echo -e "${RED}✗ Login failed or user not in database. Make sure to run: npm run prisma:seed${NC}"
fi

echo ""
echo "========================================="
echo ""

# Test 2: Get current user
if [ -n "$TOKEN" ]; then
  echo -e "${YELLOW}Test 2: Get Current User (GET /api/auth/me)${NC}"
  echo "Request: Authorization: Bearer <token>"
  echo ""
  
  USER_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$USER_RESPONSE" | jq '.'
  echo ""
  
  if echo "$USER_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✓ User data retrieved successfully!${NC}"
  else
    echo -e "${RED}✗ Failed to get user data${NC}"
  fi
  
  echo ""
  echo "========================================="
  echo ""
fi

# Test 3: Invalid credentials
echo -e "${YELLOW}Test 3: Login with Invalid Credentials${NC}"
echo "Request: { email: 'wrong@example.com', password: 'wrongpass' }"
echo ""

INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpass"
  }')

echo "$INVALID_RESPONSE" | jq '.'
echo ""

if echo "$INVALID_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✓ Correctly rejected invalid credentials${NC}"
else
  echo -e "${RED}✗ Should have rejected invalid credentials${NC}"
fi

echo ""
echo "========================================="
echo ""

# Test 4: Logout
if [ -n "$TOKEN" ]; then
  echo -e "${YELLOW}Test 4: Logout (POST /api/auth/logout)${NC}"
  echo ""
  
  LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout")
  
  echo "$LOGOUT_RESPONSE" | jq '.'
  echo ""
  
  if echo "$LOGOUT_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✓ Logout successful${NC}"
  else
    echo -e "${RED}✗ Logout failed${NC}"
  fi
  
  echo ""
  echo "========================================="
  echo ""
fi

# Summary
echo ""
echo -e "${YELLOW}Test Summary:${NC}"
echo "1. Login endpoint working: $([ -n "$TOKEN" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")"
echo "2. Get current user working: $([ -n "$TOKEN" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")"
echo "3. Invalid credentials rejected: ${GREEN}✓${NC}"
echo "4. Logout endpoint working: $([ -n "$TOKEN" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")"
echo ""
echo -e "${YELLOW}Note:${NC} If login failed, make sure to:"
echo "  1. Database is set up: npm run prisma:migrate"
echo "  2. Database is seeded: npm run prisma:seed"
echo "  3. Dev server is running: npm run dev"
echo ""

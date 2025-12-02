#!/bin/bash
# Script to run pytest tests in Docker container

echo "================================================"
echo "Property Management System - Test Runner"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing test dependencies...${NC}"
docker exec pm-backend-python pip install -q pytest pytest-asyncio pytest-cov httpx

echo ""
echo -e "${GREEN}Running tests with coverage...${NC}"
echo ""

docker exec pm-backend-python pytest tests/ \
    -v \
    --tb=short \
    --cov=app \
    --cov-report=term-missing \
    --cov-report=html

echo ""
echo "================================================"
echo -e "${GREEN}Tests completed!${NC}"
echo "Coverage report generated in htmlcov/index.html"
echo "================================================"

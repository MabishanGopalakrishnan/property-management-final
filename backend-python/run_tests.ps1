# PowerShell script to run pytest tests in Docker container

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Property Management System - Test Runner" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing test dependencies..." -ForegroundColor Yellow
docker exec pm-backend-python pip install -q pytest pytest-asyncio pytest-cov httpx

Write-Host ""
Write-Host "Running tests with coverage..." -ForegroundColor Green
Write-Host ""

docker exec pm-backend-python pytest tests/ `
    -v `
    --tb=short `
    --cov=app `
    --cov-report=term-missing `
    --cov-report=html

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Green
Write-Host "Coverage report generated in htmlcov/index.html" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

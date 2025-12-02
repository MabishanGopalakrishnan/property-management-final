# Property Management System - Test Suite

## Overview
Comprehensive pytest-based test suite for the Property Management FastAPI backend.

## Test Coverage

### 1. Authentication Tests (`test_auth.py`)
- ✅ User registration (landlord & tenant)
- ✅ Duplicate email validation
- ✅ Login with correct/incorrect credentials
- ✅ JWT token generation and validation
- ✅ Role-based access control
- ✅ Protected route authentication

### 2. Property Management Tests (`test_properties.py`)
- ✅ Property CRUD operations
- ✅ Authorization checks (landlord-only)
- ✅ Property listing and filtering
- ✅ Input validation

### 3. Lease Management Tests (`test_leases.py`)
- ✅ Lease creation
- ✅ **Duplicate active lease prevention** (business rule)
- ✅ Date validation (end date after start date)
- ✅ Lease status updates
- ✅ Tenant lease access

### 4. Payment Processing Tests (`test_payments.py`)
- ✅ Payment creation and retrieval
- ✅ Payment status transitions (PENDING → PAID)
- ✅ Stripe checkout session creation
- ✅ Payment validation (no negative/zero amounts)
- ✅ Tenant payment access

### 5. Tenant Management Tests (`test_tenants.py`)
- ✅ Tenant listing with user information
- ✅ **Tenant deletion with active lease validation** (business rule)
- ✅ Authorization checks (landlord-only operations)
- ✅ Cascade deletion handling

### 6. Dashboard & Analytics Tests (`test_dashboard.py`)
- ✅ Manager statistics (properties, units, occupancy, revenue)
- ✅ Occupancy rate calculation accuracy
- ✅ Recent activity feed (user-specific filtering)
- ✅ Authorization checks (landlord-only)

## Running Tests

### Install Test Dependencies
```bash
# Inside Docker container
docker exec -it pm-backend-python bash
pip install -r requirements.txt
```

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest tests/test_auth.py
pytest tests/test_leases.py
```

### Run With Coverage Report
```bash
pytest --cov=app --cov-report=html
```

### Run Specific Test Class
```bash
pytest tests/test_leases.py::TestLeaseCreation
```

### Run Specific Test
```bash
pytest tests/test_leases.py::TestLeaseCreation::test_create_duplicate_active_lease_fails
```

### Verbose Output
```bash
pytest -v
```

### Run Tests in Parallel (faster)
```bash
pip install pytest-xdist
pytest -n auto
```

## Test Structure

```
tests/
├── conftest.py              # Fixtures and test configuration
├── test_auth.py            # Authentication & authorization
├── test_properties.py      # Property CRUD operations
├── test_leases.py          # Lease management & validation
├── test_payments.py        # Payment processing & Stripe
├── test_tenants.py         # Tenant management
└── test_dashboard.py       # Dashboard statistics & analytics
```

## Key Test Fixtures (conftest.py)

- `db_session`: Fresh in-memory database for each test
- `client`: FastAPI TestClient with database override
- `landlord_user`: Pre-created landlord account
- `tenant_user`: Pre-created tenant account with Tenant record
- `auth_headers_landlord`: Authorization headers for landlord
- `auth_headers_tenant`: Authorization headers for tenant
- `sample_property`: Pre-created property
- `sample_unit`: Pre-created unit
- `sample_lease`: Pre-created active lease

## Business Rules Tested

1. **Duplicate Lease Prevention**: Cannot create multiple ACTIVE leases on same unit
2. **Tenant Deletion Validation**: Cannot delete tenant with active leases
3. **Role-Based Authorization**: Landlords and tenants have different permissions
4. **Payment Validation**: Payments must have positive amounts
5. **Date Validation**: Lease end date must be after start date
6. **User-Specific Data**: Dashboard activity filtered by landlordId

## Coverage Goals

- Minimum 80% code coverage
- All critical business logic tested
- All API endpoints tested
- Authorization rules validated
- Edge cases handled

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    docker exec pm-backend-python pytest --cov=app --cov-report=xml
```

## Notes

- Tests use in-memory SQLite database for speed
- Each test has isolated database state (fixtures)
- Authentication uses real bcrypt hashing
- JWT tokens are generated for authorization tests
- Stripe integration tests use mock sessions

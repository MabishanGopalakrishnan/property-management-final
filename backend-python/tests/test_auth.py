"""
Test Authentication Endpoints
Tests for user registration, login, JWT token generation, and role-based access
"""
import pytest


class TestUserRegistration:
    """Test user registration functionality"""
    
    def test_register_landlord_success(self, client):
        """Test successful landlord registration"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newlandlord@test.com",
                "name": "New Landlord",
                "password": "SecurePass123!",
                "role": "LANDLORD",
                "phone": "5551234567"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "newlandlord@test.com"
        assert data["user"]["role"] == "LANDLORD"
    
    def test_register_tenant_success(self, client):
        """Test successful tenant registration with tenant record creation"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newtenant@test.com",
                "name": "New Tenant",
                "password": "SecurePass123!",
                "role": "TENANT",
                "phone": "5559876543"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["user"]["role"] == "TENANT"
        # Tenant record should be automatically created
    
    def test_register_duplicate_email(self, client, landlord_user):
        """Test registration with existing email fails"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "landlord@test.com",  # Already exists
                "name": "Duplicate User",
                "password": "password123",
                "role": "LANDLORD"
            }
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email format"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "invalid-email",
                "name": "Test User",
                "password": "password123",
                "role": "LANDLORD"
            }
        )
        assert response.status_code == 422  # Validation error
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@test.com"
                # Missing name, password, role
            }
        )
        assert response.status_code == 422


class TestUserLogin:
    """Test user login functionality"""
    
    def test_login_success(self, client, landlord_user):
        """Test successful login with correct credentials"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "landlord@test.com",
                "password": "password123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "landlord@test.com"
    
    def test_login_wrong_password(self, client, landlord_user):
        """Test login fails with incorrect password"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "landlord@test.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower() or "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client):
        """Test login fails for non-existent user"""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "password123"
            }
        )
        assert response.status_code == 401
    
    def test_login_missing_credentials(self, client):
        """Test login fails with missing credentials"""
        response = client.post(
            "/api/auth/login",
            json={"email": "test@test.com"}  # Missing password
        )
        assert response.status_code == 422


class TestAuthenticatedAccess:
    """Test authentication and authorization"""
    
    def test_get_current_user_with_token(self, client, auth_headers_landlord, landlord_user):
        """Test accessing current user info with valid token"""
        response = client.get(
            "/api/auth/me",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "landlord@test.com"
        assert data["role"] == "LANDLORD"
    
    def test_get_current_user_without_token(self, client):
        """Test accessing protected route without token fails"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client):
        """Test accessing protected route with invalid token fails"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code == 401
    
    def test_role_based_access_landlord(self, client, auth_headers_landlord):
        """Test landlord can access landlord-only endpoints"""
        response = client.get(
            "/api/properties",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
    
    def test_role_based_access_tenant(self, client, auth_headers_tenant):
        """Test tenant cannot create properties (landlord-only)"""
        response = client.post(
            "/api/properties",
            headers=auth_headers_tenant,
            json={
                "name": "Unauthorized Property",
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zipCode": "12345"
            }
        )
        # Should fail because tenants can't create properties
        assert response.status_code in [403, 401]

"""
Test Tenant Management
Tests for tenant CRUD operations, tenant deletion validation, and active lease checks
"""
import pytest


class TestTenantCreation:
    """Test tenant operations"""
    
    def test_get_all_tenants(self, client, auth_headers_landlord, tenant_user):
        """Test landlord can retrieve all tenants"""
        response = client.get(
            "/api/tenants/",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_tenant_with_user_info(self, client, auth_headers_landlord, tenant_user):
        """Test tenant includes user information (name, email)"""
        response = client.get(
            "/api/tenants/",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        tenant = data[0]
        assert "user" in tenant
        assert tenant["user"]["email"] == "tenant@test.com"
        assert tenant["user"]["name"] == "Test Tenant"


class TestTenantDeletion:
    """Test tenant deletion with active lease validation"""
    
    def test_delete_tenant_without_lease(self, client, auth_headers_landlord, db_session):
        """Test deleting tenant without active leases succeeds"""
        from app.models import User, Tenant
        from passlib.context import CryptContext
        
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Create a tenant without any leases
        user = User(
            email="deleteme@test.com",
            name="Delete Me",
            password=pwd_context.hash("password123"),
            role="TENANT"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        tenant = Tenant(userId=user.id)
        db_session.add(tenant)
        db_session.commit()
        db_session.refresh(tenant)
        
        # Delete the tenant
        response = client.delete(
            f"/api/tenants/{tenant.id}",
            headers=auth_headers_landlord
        )
        assert response.status_code in [200, 204]
    
    def test_delete_tenant_with_active_lease_fails(self, client, auth_headers_landlord, sample_lease, db_session):
        """Test deleting tenant with active lease fails"""
        from app.models import Tenant
        
        tenant = db_session.query(Tenant).filter(Tenant.id == sample_lease.tenantId).first()
        
        response = client.delete(
            f"/api/tenants/{tenant.id}",
            headers=auth_headers_landlord
        )
        assert response.status_code == 400
        assert "active lease" in response.json()["detail"].lower()
    
    def test_delete_nonexistent_tenant(self, client, auth_headers_landlord):
        """Test deleting non-existent tenant returns 404"""
        response = client.delete(
            "/api/tenants/99999",
            headers=auth_headers_landlord
        )
        assert response.status_code == 404


class TestTenantAuthorization:
    """Test tenant cannot access landlord-only operations"""
    
    def test_tenant_cannot_delete_other_tenants(self, client, auth_headers_tenant, tenant_user, db_session):
        """Test tenant cannot delete other tenant records"""
        from app.models import Tenant
        
        tenant = db_session.query(Tenant).filter(Tenant.userId == tenant_user.id).first()
        
        response = client.delete(
            f"/api/tenants/{tenant.id}",
            headers=auth_headers_tenant
        )
        assert response.status_code in [403, 401]
    
    def test_tenant_cannot_list_all_tenants(self, client, auth_headers_tenant):
        """Test tenant cannot list all tenants (authorization check)"""
        response = client.get(
            "/api/tenants/",
            headers=auth_headers_tenant
        )
        assert response.status_code in [403, 401]

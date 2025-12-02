"""
Test Lease Management
Tests for lease creation, duplicate lease prevention, and lease lifecycle
"""
import pytest
from datetime import datetime, timedelta


class TestLeaseCreation:
    """Test lease creation functionality"""
    
    def test_create_lease_success(self, client, auth_headers_landlord, sample_unit, tenant_user, db_session):
        """Test creating a new lease"""
        from app.models import Tenant
        tenant = db_session.query(Tenant).filter(Tenant.userId == tenant_user.id).first()
        
        start_date = datetime.now()
        end_date = start_date + timedelta(days=365)
        
        response = client.post(
            "/api/leases",
            headers=auth_headers_landlord,
            json={
                "tenantId": tenant.id,
                "unitId": sample_unit.id,
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat(),
                "rent": 1200,
                "status": "ACTIVE"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["tenantId"] == tenant.id
        assert data["unitId"] == sample_unit.id
        assert data["status"] == "ACTIVE"
        assert float(data["rent"]) == 1200.00
    
    def test_create_duplicate_active_lease_fails(self, client, auth_headers_landlord, sample_lease, db_session):
        """Test creating duplicate active lease on same unit fails"""
        from app.models import Tenant
        # Try to create another lease on the same unit
        tenant = db_session.query(Tenant).first()
        
        start_date = datetime.now()
        end_date = start_date + timedelta(days=365)
        
        response = client.post(
            "/api/leases/",
            headers=auth_headers_landlord,
            json={
                "tenantId": tenant.id,
                "unitId": sample_lease.unitId,  # Same unit as existing active lease
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat(),
                "rent": 1300,
                "status": "ACTIVE"
            }
        )
        assert response.status_code == 400
        assert "already has an active lease" in response.json()["detail"].lower()
    
    def test_create_lease_invalid_dates(self, client, auth_headers_landlord, sample_unit, tenant_user, db_session):
        """Test creating lease with end date before start date fails"""
        from app.models import Tenant
        tenant = db_session.query(Tenant).filter(Tenant.userId == tenant_user.id).first()
        
        start_date = datetime.now()
        end_date = start_date - timedelta(days=30)  # End before start
        
        response = client.post(
            "/api/leases/",
            headers=auth_headers_landlord,
            json={
                "tenantId": tenant.id,
                "unitId": sample_unit.id,
                "startDate": start_date.isoformat(),
                "endDate": end_date.isoformat(),
                "rent": 1200,
                "status": "ACTIVE"
            }
        )
        assert response.status_code == 400


class TestLeaseRetrieval:
    """Test lease retrieval operations"""
    
    def test_get_all_leases(self, client, auth_headers_landlord, sample_lease):
        """Test retrieving all leases"""
        response = client.get(
            "/api/leases/",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_lease_by_id(self, client, auth_headers_landlord, sample_lease):
        """Test retrieving specific lease"""
        response = client.get(
            f"/api/leases/{sample_lease.id}",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_lease.id
        assert data["status"] == "ACTIVE"
    
    def test_tenant_can_view_their_lease(self, client, auth_headers_tenant, sample_lease):
        """Test tenant can view their own lease"""
        response = client.get(
            "/api/tenant-portal/my-leases",
            headers=auth_headers_tenant
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestLeaseUpdate:
    """Test lease update operations"""
    
    def test_update_lease_status(self, client, auth_headers_landlord, sample_lease):
        """Test updating lease status"""
        response = client.put(
            f"/api/leases/{sample_lease.id}",
            headers=auth_headers_landlord,
            json={
                "status": "TERMINATED"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "TERMINATED"
    
    def test_update_lease_rent(self, client, auth_headers_landlord, sample_lease):
        """Test updating lease rent amount"""
        response = client.put(
            f"/api/leases/{sample_lease.id}",
            headers=auth_headers_landlord,
            json={
                "rent": 1500
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["rent"] == 1500

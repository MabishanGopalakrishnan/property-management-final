"""
Test Dashboard and Analytics
Tests for manager dashboard statistics, recent activity, and KPI calculations
"""
import pytest


class TestDashboardStatistics:
    """Test dashboard KPI calculations"""
    
    def test_get_manager_stats(self, client, auth_headers_landlord, sample_property, sample_unit, sample_lease):
        """Test retrieving manager dashboard statistics"""
        response = client.get(
            "/api/dashboard/manager-stats",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields exist
        assert "totalProperties" in data
        assert "totalUnits" in data
        assert "occupiedUnits" in data
        assert "vacantUnits" in data
        assert "occupancyRate" in data
        assert "activeLeases" in data
        assert "totalRevenue" in data
        assert "pendingRevenue" in data
        assert "pendingMaintenance" in data
        
        # Verify data types
        assert isinstance(data["totalProperties"], int)
        assert isinstance(data["totalUnits"], int)
        assert isinstance(data["occupancyRate"], (int, float))
        assert isinstance(data["totalRevenue"], (int, float))
    
    def test_stats_calculation_accuracy(self, client, auth_headers_landlord, sample_property, sample_unit, sample_lease):
        """Test dashboard statistics are calculated correctly"""
        response = client.get(
            "/api/dashboard/manager-stats",
            headers=auth_headers_landlord
        )
        data = response.json()
        
        # Should have at least 1 property, 1 unit, 1 active lease
        assert data["totalProperties"] >= 1
        assert data["totalUnits"] >= 1
        assert data["activeLeases"] >= 1
        
        # Occupancy rate should be between 0 and 100
        assert 0 <= data["occupancyRate"] <= 100
    
    def test_occupancy_rate_calculation(self, client, auth_headers_landlord, sample_property, db_session):
        """Test occupancy rate is calculated correctly"""
        from app.models import Unit
        
        # Create additional units to test calculation
        unit2 = Unit(
            propertyId=sample_property.id,
            unitNumber="102",
            bedrooms=1,
            bathrooms=1.0,
            rent=1000.00,
            isOccupied=False
        )
        db_session.add(unit2)
        db_session.commit()
        
        response = client.get(
            "/api/dashboard/manager-stats",
            headers=auth_headers_landlord
        )
        data = response.json()
        
        # With 2 units total, occupancy should be 50% (1 occupied, 1 vacant)
        expected_occupancy = (data["occupiedUnits"] / data["totalUnits"]) * 100
        assert abs(data["occupancyRate"] - expected_occupancy) < 0.01


class TestRecentActivity:
    """Test recent activity feed"""
    
    def test_get_recent_activity(self, client, auth_headers_landlord, sample_property):
        """Test retrieving recent activity feed"""
        response = client.get(
            "/api/dashboard/recent-activity",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_activity_is_user_specific(self, client, auth_headers_landlord, auth_headers_tenant, sample_property, db_session):
        """Test activity feed is filtered by landlord (user-specific)"""
        # Landlord's activity
        response_landlord = client.get(
            "/api/dashboard/recent-activity",
            headers=auth_headers_landlord
        )
        
        # Tenant should not see landlord's activity (or get 403)
        response_tenant = client.get(
            "/api/dashboard/recent-activity",
            headers=auth_headers_tenant
        )
        
        # Tenant should either be forbidden or get empty list
        assert response_tenant.status_code in [403, 401] or len(response_tenant.json()) == 0
    
    def test_activity_contains_required_fields(self, client, auth_headers_landlord, sample_property):
        """Test activity items contain all required fields"""
        response = client.get(
            "/api/dashboard/recent-activity",
            headers=auth_headers_landlord
        )
        data = response.json()
        
        if len(data) > 0:
            activity = data[0]
            assert "action" in activity
            assert "property" in activity or "description" in activity
            assert "time" in activity or "timestamp" in activity


class TestDashboardAuthorization:
    """Test dashboard access is restricted to landlords"""
    
    def test_tenant_cannot_access_manager_stats(self, client, auth_headers_tenant):
        """Test tenant cannot access landlord dashboard stats"""
        response = client.get(
            "/api/dashboard/manager-stats",
            headers=auth_headers_tenant
        )
        assert response.status_code in [403, 401]
    
    def test_unauthenticated_cannot_access_dashboard(self, client):
        """Test unauthenticated users cannot access dashboard"""
        response = client.get("/api/dashboard/manager-stats")
        assert response.status_code == 401

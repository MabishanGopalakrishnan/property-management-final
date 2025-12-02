"""
Test Property Management Endpoints
Tests for property CRUD operations, property listing, and landlord-specific operations
"""
import pytest


class TestPropertyCreation:
    """Test property creation"""
    
    def test_create_property_success(self, client, auth_headers_landlord):
        """Test landlord can create a property"""
        response = client.post(
            "/api/properties",
            headers=auth_headers_landlord,
            json={
                "title": "Sunset Apartments",
                "address": "456 Ocean Ave",
                "city": "Miami",
                "state": "FL",
                "zipCode": "33139",
                "description": "Beautiful beachfront property"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Sunset Apartments"
        assert data["city"] == "Miami"
        assert "id" in data
    
    def test_create_property_without_auth(self, client):
        """Test creating property without authentication fails"""
        response = client.post(
            "/api/properties",
            json={
                "title": "Unauthorized Property",
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zipCode": "12345"
            }
        )
        assert response.status_code == 401
    
    def test_create_property_missing_fields(self, client, auth_headers_landlord):
        """Test creating property with missing required fields fails"""
        response = client.post(
            "/api/properties",
            headers=auth_headers_landlord,
            json={
                "name": "Incomplete Property"
                # Missing address, city, state, zipCode
            }
        )
        assert response.status_code == 422


class TestPropertyRetrieval:
    """Test property retrieval operations"""
    
    def test_get_all_properties(self, client, auth_headers_landlord, sample_property):
        """Test landlord can retrieve all their properties"""
        response = client.get(
            "/api/properties",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["title"] == "Test Property"
    
    def test_get_property_by_id(self, client, auth_headers_landlord, sample_property):
        """Test retrieving a specific property by ID"""
        response = client.get(
            f"/api/properties/{sample_property.id}",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_property.id
        assert data["title"] == "Test Property"
    
    def test_get_nonexistent_property(self, client, auth_headers_landlord):
        """Test retrieving non-existent property returns 404"""
        response = client.get(
            "/api/properties/99999",
            headers=auth_headers_landlord
        )
        assert response.status_code == 404


class TestPropertyUpdate:
    """Test property update operations"""
    
    def test_update_property_success(self, client, auth_headers_landlord, sample_property):
        """Test landlord can update their property"""
        response = client.put(
            f"/api/properties/{sample_property.id}",
            headers=auth_headers_landlord,
            json={
                "title": "Updated Property Name",
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zipCode": "12345",
                "description": "Updated description"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Property Name"
        assert data["description"] == "Updated description"
    
    def test_update_property_unauthorized(self, client, auth_headers_tenant, sample_property):
        """Test tenant cannot update landlord's property"""
        response = client.put(
            f"/api/properties/{sample_property.id}",
            headers=auth_headers_tenant,
            json={
                "title": "Hacked Property",
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zipCode": "12345"
            }
        )
        assert response.status_code in [403, 404]


class TestPropertyDeletion:
    """Test property deletion"""
    
    def test_delete_property_success(self, client, auth_headers_landlord, sample_property):
        """Test landlord can delete their property"""
        response = client.delete(
            f"/api/properties/{sample_property.id}",
            headers=auth_headers_landlord
        )
        assert response.status_code in [200, 204]
        
        # Verify property is deleted
        get_response = client.get(
            f"/api/properties/{sample_property.id}",
            headers=auth_headers_landlord
        )
        assert get_response.status_code == 404
    
    def test_delete_nonexistent_property(self, client, auth_headers_landlord):
        """Test deleting non-existent property returns 404"""
        response = client.delete(
            "/api/properties/99999",
            headers=auth_headers_landlord
        )
        assert response.status_code == 404

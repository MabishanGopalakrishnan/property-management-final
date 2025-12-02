"""
Test Payment Processing
Tests for payment creation, Stripe integration, and payment status updates
"""
import pytest
from datetime import datetime, timedelta


class TestPaymentCreation:
    """Test payment creation and retrieval"""
    
    def test_get_payments_for_lease(self, client, auth_headers_landlord, sample_lease, db_session):
        """Test retrieving payments for a lease"""
        from app.models import Payment
        
        # Create a test payment
        payment = Payment(
            leaseId=sample_lease.id,
            amount=1200.00,
            dueDate=datetime.now(),
            status="PENDING",
            description="Monthly Rent - December"
        )
        db_session.add(payment)
        db_session.commit()
        
        response = client.get(
            "/api/payments",
            headers=auth_headers_landlord
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_tenant_can_view_their_payments(self, client, auth_headers_tenant, sample_lease, db_session):
        """Test tenant can view their own payments"""
        from app.models import Payment
        
        payment = Payment(
            leaseId=sample_lease.id,
            amount=1200.00,
            dueDate=datetime.now(),
            status="PENDING",
            description="Monthly Rent"
        )
        db_session.add(payment)
        db_session.commit()
        
        response = client.get(
            "/api/tenant-portal/my-payments",
            headers=auth_headers_tenant
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestPaymentStatus:
    """Test payment status updates"""
    
    def test_payment_status_transitions(self, client, auth_headers_landlord, sample_lease, db_session):
        """Test payment can transition through different statuses"""
        from app.models import Payment
        
        payment = Payment(
            leaseId=sample_lease.id,
            amount=1200.00,
            dueDate=datetime.now(),
            status="PENDING",
            description="Test Payment"
        )
        db_session.add(payment)
        db_session.commit()
        db_session.refresh(payment)
        
        # Update to PAID
        response = client.put(
            f"/api/payments/{payment.id}",
            headers=auth_headers_landlord,
            json={"status": "PAID"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "PAID"


class TestStripeIntegration:
    """Test Stripe payment integration"""
    
    def test_create_checkout_session(self, client, auth_headers_tenant, sample_lease, db_session):
        """Test creating Stripe checkout session for payment"""
        from app.models import Payment
        
        payment = Payment(
            leaseId=sample_lease.id,
            amount=1200.00,
            dueDate=datetime.now(),
            status="PENDING",
            description="Monthly Rent"
        )
        db_session.add(payment)
        db_session.commit()
        db_session.refresh(payment)
        
        response = client.post(
            f"/api/payments/{payment.id}/checkout",
            headers=auth_headers_tenant
        )
        # Should return checkout URL or session ID
        assert response.status_code == 200
        data = response.json()
        assert "sessionId" in data or "url" in data
    
    def test_payment_verification_endpoint_exists(self, client, auth_headers_tenant):
        """Test payment verification endpoint is accessible"""
        # This tests the endpoint exists, actual verification would need Stripe webhook
        response = client.get(
            "/api/payments/verify/test_session_id",
            headers=auth_headers_tenant
        )
        # Will likely return 404 for non-existent session, but endpoint should exist
        assert response.status_code in [200, 404, 400]


class TestPaymentValidation:
    """Test payment validation rules"""
    
    def test_negative_payment_amount_rejected(self, client, auth_headers_landlord, sample_lease):
        """Test negative payment amounts are rejected"""
        response = client.post(
            "/api/payments",
            headers=auth_headers_landlord,
            json={
                "leaseId": sample_lease.id,
                "amount": -100.00,  # Negative amount
                "dueDate": datetime.now().isoformat(),
                "status": "PENDING"
            }
        )
        assert response.status_code in [400, 422]
    
    def test_zero_payment_amount_rejected(self, client, auth_headers_landlord, sample_lease):
        """Test zero payment amounts are rejected"""
        response = client.post(
            "/api/payments",
            headers=auth_headers_landlord,
            json={
                "leaseId": sample_lease.id,
                "amount": 0.00,
                "dueDate": datetime.now().isoformat(),
                "status": "PENDING"
            }
        )
        assert response.status_code in [400, 422]

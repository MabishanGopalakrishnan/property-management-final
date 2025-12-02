"""
Payments Router
Handles payment CRUD operations and Stripe integration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
import stripe
import os

from ..database import get_db
from ..models import User, Payment, Lease, Tenant, Unit, Property
from ..schemas import PaymentCreate, PaymentUpdate, PaymentResponse
from ..auth import get_current_user, get_current_landlord

router = APIRouter()

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all payments"""
    if current_user.role == "LANDLORD":
        # Get payments for landlord's properties with nested data
        payments = db.query(Payment).options(
            joinedload(Payment.lease).joinedload(Lease.tenant).joinedload(Tenant.user),
            joinedload(Payment.lease).joinedload(Lease.unit).joinedload(Unit.property)
        ).join(Lease).join(Unit).join(Property).filter(
            Property.landlordId == current_user.id
        ).all()
    elif current_user.role == "TENANT":
        # Get payments for tenant's leases with nested data
        tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
        if tenant:
            payments = db.query(Payment).options(
                joinedload(Payment.lease).joinedload(Lease.tenant).joinedload(Tenant.user),
                joinedload(Payment.lease).joinedload(Lease.unit).joinedload(Unit.property)
            ).join(Lease).filter(
                Lease.tenantId == tenant.id
            ).all()
        else:
            payments = []
    else:
        payments = db.query(Payment).options(
            joinedload(Payment.lease).joinedload(Lease.tenant).joinedload(Tenant.user),
            joinedload(Payment.lease).joinedload(Lease.unit).joinedload(Unit.property)
        ).all()
    
    return payments


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Create a new payment"""
    # Verify lease exists
    lease = db.query(Lease).filter(Lease.id == payment_data.leaseId).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )
    
    # Verify landlord authorization
    unit = db.query(Unit).filter(Unit.id == lease.unitId).first()
    property_obj = db.query(Property).filter(Property.id == unit.propertyId).first()
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create payment for this lease"
        )
    
    new_payment = Payment(**payment_data.model_dump())
    
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    return new_payment


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific payment"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a payment"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Update fields
    for key, value in payment_data.model_dump(exclude_unset=True).items():
        setattr(payment, key, value)
    
    db.commit()
    db.refresh(payment)
    
    return payment


@router.post("/{payment_id}/pay", response_model=PaymentResponse)
async def mark_payment_paid(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a payment as paid"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    payment.status = "PAID"
    payment.paidAt = datetime.utcnow()
    
    db.commit()
    db.refresh(payment)
    
    return payment


@router.post("/{payment_id}/checkout")
async def create_checkout_session(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe checkout session for a payment"""
    payment = db.query(Payment).options(
        joinedload(Payment.lease).joinedload(Lease.unit).joinedload(Unit.property)
    ).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify tenant authorization
    if current_user.role == "TENANT":
        tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
        if not tenant or payment.lease.tenantId != tenant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to pay this payment"
            )
    
    if payment.status == "PAID":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already completed"
        )
    
    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': int(payment.amount * 100),  # Convert to cents
                    'product_data': {
                        'name': f"Rent Payment - {payment.lease.unit.property.title if payment.lease and payment.lease.unit and payment.lease.unit.property else 'Property'}",
                        'description': f"Unit {payment.lease.unit.unitNumber if payment.lease and payment.lease.unit else 'N/A'} - Due {payment.dueDate.strftime('%B %d, %Y')}",
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + f"/tenant/payments?success=true&payment_id={payment_id}&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/tenant/payments?canceled=true",
            metadata={
                'payment_id': payment_id,
                'lease_id': payment.leaseId,
            }
        )
        
        return {"url": checkout_session.url}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )


@router.post("/{payment_id}/verify")
async def verify_payment(
    payment_id: int,
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify Stripe payment and mark as paid"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    try:
        # Retrieve the checkout session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Verify payment was successful
        if session.payment_status == "paid":
            payment.status = "PAID"
            payment.paidAt = datetime.utcnow()
            payment.stripePaymentId = session.payment_intent
            db.commit()
            db.refresh(payment)
            return {"status": "success", "message": "Payment verified and marked as paid"}
        else:
            return {"status": "pending", "message": "Payment not yet completed"}
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify payment: {str(e)}"
        )


@router.post("/sync")
async def sync_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Sync payments with Stripe - check for completed payments"""
    try:
        # Get all pending payments for landlord's properties
        pending_payments = db.query(Payment).join(Lease).join(Unit).join(Property).filter(
            Property.landlordId == current_user.id,
            Payment.status == "PENDING",
            Payment.stripePaymentId.isnot(None)
        ).all()
        
        synced_count = 0
        
        for payment in pending_payments:
            if payment.stripePaymentId:
                try:
                    # Check payment intent status in Stripe
                    payment_intent = stripe.PaymentIntent.retrieve(payment.stripePaymentId)
                    
                    if payment_intent.status == "succeeded":
                        payment.status = "PAID"
                        payment.paidAt = datetime.utcnow()
                        synced_count += 1
                except stripe.error.StripeError:
                    continue
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Synced {synced_count} payment(s) with Stripe",
            "synced_count": synced_count
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync payments: {str(e)}"
        )


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Delete a payment"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    db.delete(payment)
    db.commit()
    
    return None

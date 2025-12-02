"""
Webhooks Router
Handles external webhooks (e.g., Stripe)
"""
from fastapi import APIRouter, Request, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime
import os
import stripe

from ..database import SessionLocal
from ..models import Payment

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Handle Stripe webhook events"""
    
    if not webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook secret not configured"
        )
    
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        
        # Get payment_id from metadata
        payment_id = session.get("metadata", {}).get("payment_id")
        
        if payment_id:
            db = SessionLocal()
            try:
                payment = db.query(Payment).filter(Payment.id == int(payment_id)).first()
                if payment:
                    payment.status = "PAID"
                    payment.paidAt = datetime.utcnow()
                    payment.stripePaymentId = session.get("payment_intent")
                    db.commit()
                    print(f"✅ Payment {payment_id} marked as PAID")
                else:
                    print(f"❌ Payment {payment_id} not found")
            except Exception as e:
                print(f"❌ Error updating payment: {str(e)}")
                db.rollback()
            finally:
                db.close()
    
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        print(f"❌ Payment failed: {payment_intent['id']}")
    
    return {"status": "success"}

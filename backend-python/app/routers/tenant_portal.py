"""
Tenant Portal Router
Special endpoints for tenant-specific operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import User, Tenant, Lease, Payment, MaintenanceRequest, Unit, Property
from ..auth import get_current_user, get_current_tenant

router = APIRouter()


@router.get("/my-leases")
async def get_my_leases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_tenant)
):
    """Get current tenant's leases"""
    tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
    
    if not tenant:
        return []
    
    leases = db.query(Lease).options(
        joinedload(Lease.tenant).joinedload(Tenant.user),
        joinedload(Lease.unit).joinedload(Unit.property)
    ).filter(Lease.tenantId == tenant.id).all()
    return leases


@router.get("/my-payments")
async def get_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_tenant)
):
    """Get current tenant's payments"""
    tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
    
    if not tenant:
        return []
    
    payments = db.query(Payment).options(
        joinedload(Payment.lease).joinedload(Lease.tenant).joinedload(Tenant.user),
        joinedload(Payment.lease).joinedload(Lease.unit).joinedload(Unit.property)
    ).join(Lease).filter(
        Lease.tenantId == tenant.id
    ).all()
    
    return payments


@router.get("/my-maintenance")
async def get_my_maintenance_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_tenant)
):
    """Get current tenant's maintenance requests"""
    tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
    
    if not tenant:
        return []
    
    maintenance = db.query(MaintenanceRequest).options(
        joinedload(MaintenanceRequest.lease).joinedload(Lease.unit).joinedload(Unit.property)
    ).join(Lease).filter(
        Lease.tenantId == tenant.id
    ).all()
    
    return maintenance

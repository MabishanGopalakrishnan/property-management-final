"""
Tenants Router
Handles tenant-related operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from ..database import get_db
from ..models import User, Tenant
from ..schemas import TenantResponse, TenantCreate
from ..auth import get_current_user, get_current_landlord

router = APIRouter()


@router.get("/", response_model=List[TenantResponse])
async def get_tenants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Get all tenants with their user information"""
    tenants = db.query(Tenant).options(
        joinedload(Tenant.user)
    ).all()
    return tenants


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific tenant with user information"""
    tenant = db.query(Tenant).options(
        joinedload(Tenant.user)
    ).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant


@router.get("/user/{user_id}", response_model=TenantResponse)
async def get_tenant_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tenant by user ID"""
    tenant = db.query(Tenant).filter(Tenant.userId == user_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found for this user"
        )
    
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Delete a tenant and their associated user account (landlord only)"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check if tenant has any active leases
    from ..models import Lease
    active_leases = db.query(Lease).filter(
        Lease.tenantId == tenant_id,
        Lease.status == "ACTIVE"
    ).count()
    
    if active_leases > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete tenant with {active_leases} active lease(s). Please end all leases first."
        )
    
    # Delete tenant (this will cascade delete to leases and user due to CASCADE)
    db.delete(tenant)
    db.commit()
    
    return None

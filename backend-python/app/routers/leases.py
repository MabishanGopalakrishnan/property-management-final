"""
Leases Router
Handles lease CRUD operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from ..database import get_db
from ..models import User, Lease, Tenant, Unit, Property, Payment
from ..schemas import LeaseCreate, LeaseUpdate, LeaseResponse
from ..auth import get_current_user, get_current_landlord

router = APIRouter()


@router.get("/", response_model=List[LeaseResponse])
async def get_leases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all leases"""
    if current_user.role == "LANDLORD":
        # Get leases for landlord's properties with tenant and unit data
        leases = db.query(Lease).options(
            joinedload(Lease.tenant).joinedload(Tenant.user),
            joinedload(Lease.unit)
        ).join(Unit).join(Property).filter(
            Property.landlordId == current_user.id
        ).all()
    elif current_user.role == "TENANT":
        # Get leases for tenant
        tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
        if tenant:
            leases = db.query(Lease).options(
                joinedload(Lease.tenant).joinedload(Tenant.user),
                joinedload(Lease.unit)
            ).filter(Lease.tenantId == tenant.id).all()
        else:
            leases = []
    else:
        leases = db.query(Lease).options(
            joinedload(Lease.tenant).joinedload(Tenant.user),
            joinedload(Lease.unit)
        ).all()
    
    return leases


@router.post("/", response_model=LeaseResponse, status_code=status.HTTP_201_CREATED)
async def create_lease(
    lease_data: LeaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Create a new lease"""
    # Verify unit exists and belongs to landlord
    unit = db.query(Unit).filter(Unit.id == lease_data.unitId).first()
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    property_obj = db.query(Property).filter(Property.id == unit.propertyId).first()
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create lease for this unit"
        )
    
    # Check if unit already has an active lease
    existing_active_lease = db.query(Lease).filter(
        Lease.unitId == lease_data.unitId,
        Lease.status == "ACTIVE"
    ).first()
    
    if existing_active_lease:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unit already has an active lease (Lease ID: {existing_active_lease.id}). Please end the current lease before creating a new one."
        )
    
    # Verify tenant exists
    tenant = db.query(Tenant).filter(Tenant.id == lease_data.tenantId).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    new_lease = Lease(**lease_data.model_dump())
    
    db.add(new_lease)
    db.commit()
    db.refresh(new_lease)
    
    # Auto-generate monthly payments for the lease duration
    try:
        start_date = new_lease.startDate
        end_date = new_lease.endDate if new_lease.endDate else start_date + relativedelta(years=1)  # Default 1 year if no end date
        
        current_date = start_date
        payments_created = 0
        
        # Generate payments for each month
        while current_date <= end_date and payments_created < 12:  # Limit to 12 months max
            payment = Payment(
                leaseId=new_lease.id,
                amount=new_lease.rent,
                dueDate=current_date,
                status="PENDING"
            )
            db.add(payment)
            current_date = current_date + relativedelta(months=1)
            payments_created += 1
        
        db.commit()
        print(f"✅ Created {payments_created} payment(s) for lease {new_lease.id}")
    
    except Exception as e:
        print(f"❌ Error creating payments: {str(e)}")
        # Don't fail lease creation if payment generation fails
    
    # Reload with relationships
    lease_with_relations = db.query(Lease).options(
        joinedload(Lease.tenant).joinedload(Tenant.user),
        joinedload(Lease.unit)
    ).filter(Lease.id == new_lease.id).first()
    
    return lease_with_relations


@router.get("/{lease_id}", response_model=LeaseResponse)
async def get_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific lease"""
    lease = db.query(Lease).options(
        joinedload(Lease.tenant).joinedload(Tenant.user),
        joinedload(Lease.unit)
    ).filter(Lease.id == lease_id).first()
    
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )
    
    return lease


@router.put("/{lease_id}", response_model=LeaseResponse)
async def update_lease(
    lease_id: int,
    lease_data: LeaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Update a lease"""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    
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
            detail="Not authorized to update this lease"
        )
    
    # Update fields
    old_status = lease.status
    for key, value in lease_data.model_dump(exclude_unset=True).items():
        setattr(lease, key, value)
    
    db.commit()
    db.refresh(lease)
    
    return lease


@router.delete("/{lease_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Delete a lease"""
    lease = db.query(Lease).filter(Lease.id == lease_id).first()
    
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
            detail="Not authorized to delete this lease"
        )
    
    # Delete associated payments first
    db.query(Payment).filter(Payment.leaseId == lease_id).delete()
    
    # Delete the lease
    db.delete(lease)
    db.commit()
    
    return None


@router.get("/property/{property_id}", response_model=List[LeaseResponse])
async def get_leases_by_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leases for a specific property"""
    # Verify property exists and user has access
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if current_user.role == "LANDLORD" and property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view leases for this property"
        )
    
    leases = db.query(Lease).options(
        joinedload(Lease.tenant).joinedload(Tenant.user),
        joinedload(Lease.unit)
    ).join(Unit).filter(Unit.propertyId == property_id).all()
    return leases


@router.get("/unit/{unit_id}", response_model=List[LeaseResponse])
async def get_leases_by_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leases for a specific unit"""
    leases = db.query(Lease).options(
        joinedload(Lease.tenant).joinedload(Tenant.user),
        joinedload(Lease.unit)
    ).filter(Lease.unitId == unit_id).all()
    return leases

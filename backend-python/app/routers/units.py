"""
Units Router
Handles unit CRUD operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Unit, Property, Lease
from ..schemas import UnitCreate, UnitCreateForProperty, UnitUpdate, UnitResponse
from ..auth import get_current_user, get_current_landlord

router = APIRouter()


def compute_unit_status(unit: Unit, db: Session) -> str:
    """Compute unit status based on active leases"""
    active_lease = db.query(Lease).filter(
        Lease.unitId == unit.id,
        Lease.status == "ACTIVE"
    ).first()
    status = "OCCUPIED" if active_lease else "AVAILABLE"
    print(f"Unit {unit.id} ({unit.unitNumber}): {status} (active_lease: {active_lease.id if active_lease else None})")
    return status


@router.get("/", response_model=List[UnitResponse])
async def get_units(
    property_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all units, optionally filtered by property"""
    query = db.query(Unit)
    
    if property_id:
        query = query.filter(Unit.propertyId == property_id)
    
    units = query.all()
    
    # Add computed status to each unit
    result = []
    for unit in units:
        unit_dict = {
            "id": unit.id,
            "unitNumber": unit.unitNumber,
            "bedrooms": unit.bedrooms,
            "bathrooms": unit.bathrooms,
            "rentAmount": unit.rentAmount,
            "propertyId": unit.propertyId,
            "createdAt": unit.createdAt,
            "updatedAt": unit.updatedAt,
            "status": compute_unit_status(unit, db)
        }
        result.append(unit_dict)
    
    return result


@router.post("/", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_unit(
    unit_data: UnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Create a new unit"""
    # Verify property exists and belongs to landlord
    property_obj = db.query(Property).filter(Property.id == unit_data.propertyId).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add units to this property"
        )
    
    new_unit = Unit(**unit_data.model_dump())
    
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    
    return {
        "id": new_unit.id,
        "unitNumber": new_unit.unitNumber,
        "bedrooms": new_unit.bedrooms,
        "bathrooms": new_unit.bathrooms,
        "rentAmount": new_unit.rentAmount,
        "propertyId": new_unit.propertyId,
        "createdAt": new_unit.createdAt,
        "updatedAt": new_unit.updatedAt,
        "status": "AVAILABLE"  # New units start as available
    }


@router.get("/{unit_id}", response_model=UnitResponse)
async def get_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific unit"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    return {
        "id": unit.id,
        "unitNumber": unit.unitNumber,
        "bedrooms": unit.bedrooms,
        "bathrooms": unit.bathrooms,
        "rentAmount": unit.rentAmount,
        "propertyId": unit.propertyId,
        "createdAt": unit.createdAt,
        "updatedAt": unit.updatedAt,
        "status": compute_unit_status(unit, db)
    }


@router.put("/{unit_id}", response_model=UnitResponse)
async def update_unit(
    unit_id: int,
    unit_data: UnitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Update a unit"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Verify landlord owns the property
    property_obj = db.query(Property).filter(Property.id == unit.propertyId).first()
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this unit"
        )
    
    # Update fields
    for key, value in unit_data.model_dump(exclude_unset=True).items():
        setattr(unit, key, value)
    
    db.commit()
    db.refresh(unit)
    
    return {
        "id": unit.id,
        "unitNumber": unit.unitNumber,
        "bedrooms": unit.bedrooms,
        "bathrooms": unit.bathrooms,
        "rentAmount": unit.rentAmount,
        "propertyId": unit.propertyId,
        "createdAt": unit.createdAt,
        "updatedAt": unit.updatedAt,
        "status": compute_unit_status(unit, db)
    }


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Delete a unit"""
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Verify landlord owns the property
    property_obj = db.query(Property).filter(Property.id == unit.propertyId).first()
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this unit"
        )
    
    db.delete(unit)
    db.commit()
    
    return None


@router.get("/property/{property_id}", response_model=List[UnitResponse])
async def get_units_by_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all units for a specific property"""
    # Verify property exists
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    units = db.query(Unit).filter(Unit.propertyId == property_id).all()
    return units


@router.post("/property/{property_id}", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_unit_for_property(
    property_id: int,
    unit_data: UnitCreateForProperty,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Create a new unit for a specific property"""
    # Verify property exists and belongs to landlord
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add units to this property"
        )
    
    # Override propertyId from URL
    unit_dict = unit_data.model_dump()
    unit_dict['propertyId'] = property_id
    
    # Convert None values to defaults
    if unit_dict.get('bedrooms') is None:
        unit_dict['bedrooms'] = 0
    if unit_dict.get('bathrooms') is None:
        unit_dict['bathrooms'] = 0
    if unit_dict.get('rentAmount') is None:
        unit_dict['rentAmount'] = 0
    
    new_unit = Unit(**unit_dict)
    
    db.add(new_unit)
    db.commit()
    db.refresh(new_unit)
    
    return new_unit

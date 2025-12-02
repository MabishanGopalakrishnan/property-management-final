"""
Properties Router
Handles property CRUD operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Property
from ..schemas import PropertyCreate, PropertyUpdate, PropertyResponse
from ..auth import get_current_user, get_current_landlord

router = APIRouter()


@router.get("", response_model=List[PropertyResponse])
@router.get("/", response_model=List[PropertyResponse])
async def get_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all properties for the current landlord"""
    if current_user.role == "LANDLORD":
        properties = db.query(Property).filter(Property.landlordId == current_user.id).all()
    elif current_user.role == "ADMIN":
        properties = db.query(Property).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view properties"
        )
    
    return properties


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Create a new property"""
    new_property = Property(
        **property_data.model_dump(),
        landlordId=current_user.id
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    return new_property


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific property"""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check authorization
    if current_user.role == "LANDLORD" and property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this property"
        )
    
    return property_obj


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Update a property"""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check authorization
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this property"
        )
    
    # Update fields
    for key, value in property_data.model_dump(exclude_unset=True).items():
        setattr(property_obj, key, value)
    
    db.commit()
    db.refresh(property_obj)
    
    return property_obj


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Delete a property"""
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check authorization
    if property_obj.landlordId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this property"
        )
    
    db.delete(property_obj)
    db.commit()
    
    return None

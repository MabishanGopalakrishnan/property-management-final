"""
Maintenance Router
Handles maintenance request operations with file uploads
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import os
import shutil

from ..database import get_db
from ..models import User, MaintenanceRequest, Lease, Tenant, Unit, Property
from ..schemas import MaintenanceRequestCreate, MaintenanceRequestUpdate, MaintenanceRequestResponse
from ..auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[MaintenanceRequestResponse])
async def get_maintenance_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all maintenance requests"""
    if current_user.role == "LANDLORD":
        # Get maintenance requests for landlord's properties
        requests = db.query(MaintenanceRequest).options(
            joinedload(MaintenanceRequest.lease)
            .joinedload(Lease.unit)
            .joinedload(Unit.property),
            joinedload(MaintenanceRequest.lease)
            .joinedload(Lease.tenant)
            .joinedload(Tenant.user)
        ).join(Lease).join(Unit).join(Property).filter(
            Property.landlordId == current_user.id
        ).all()
    elif current_user.role == "TENANT":
        # Get maintenance requests for tenant's leases
        tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
        if tenant:
            requests = db.query(MaintenanceRequest).options(
                joinedload(MaintenanceRequest.lease)
                .joinedload(Lease.unit)
                .joinedload(Unit.property),
                joinedload(MaintenanceRequest.lease)
                .joinedload(Lease.tenant)
                .joinedload(Tenant.user)
            ).join(Lease).filter(
                Lease.tenantId == tenant.id
            ).all()
        else:
            requests = []
    else:
        requests = db.query(MaintenanceRequest).options(
            joinedload(MaintenanceRequest.lease)
            .joinedload(Lease.unit)
            .joinedload(Unit.property),
            joinedload(MaintenanceRequest.lease)
            .joinedload(Lease.tenant)
            .joinedload(Tenant.user)
        ).all()
    
    return requests


@router.post("", response_model=MaintenanceRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_maintenance_request(
    maintenance_data: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new maintenance request"""
    # Verify lease exists
    lease = db.query(Lease).filter(Lease.id == maintenance_data.leaseId).first()
    if not lease:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lease not found"
        )
    
    # Verify tenant authorization if tenant is creating the request
    if current_user.role == "TENANT":
        tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
        if not tenant or lease.tenantId != tenant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create maintenance request for this lease"
            )
    
    new_request = MaintenanceRequest(**maintenance_data.model_dump())
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request


@router.get("/{request_id}", response_model=MaintenanceRequestResponse)
async def get_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific maintenance request"""
    request = db.query(MaintenanceRequest).options(
        joinedload(MaintenanceRequest.lease)
        .joinedload(Lease.unit)
        .joinedload(Unit.property),
        joinedload(MaintenanceRequest.lease)
        .joinedload(Lease.tenant)
        .joinedload(Tenant.user)
    ).filter(MaintenanceRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    return request


@router.put("/{request_id}", response_model=MaintenanceRequestResponse)
async def update_maintenance_request(
    request_id: int,
    maintenance_data: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a maintenance request"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Update fields
    update_data = maintenance_data.model_dump(exclude_unset=True)
    
    # If status is being set to COMPLETED, set completedAt
    if "status" in update_data and update_data["status"] == "COMPLETED" and not request.completedAt:
        update_data["completedAt"] = datetime.utcnow()
    
    for key, value in update_data.items():
        setattr(request, key, value)
    
    db.commit()
    db.refresh(request)
    
    return request


@router.post("/{request_id}/photos")
async def upload_maintenance_photos(
    request_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload photos for a maintenance request"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = f"uploads/maintenance/{request_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    photo_urls = []
    for file in files:
        # Save file
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Add to photo URLs
        photo_url = f"/uploads/maintenance/{request_id}/{file.filename}"
        photo_urls.append(photo_url)
    
    # Update request with new photo URLs
    if not request.photos:
        request.photos = []
    request.photos.extend(photo_urls)
    
    db.commit()
    db.refresh(request)
    
    return {"message": "Photos uploaded successfully", "photos": photo_urls}


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a maintenance request"""
    request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance request not found"
        )
    
    db.delete(request)
    db.commit()
    
    return None

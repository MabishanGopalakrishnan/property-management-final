"""
Pydantic Schemas for API request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from enum import Enum


# Enums
class RoleEnum(str, Enum):
    LANDLORD = "LANDLORD"
    TENANT = "TENANT"
    ADMIN = "ADMIN"


class LeaseStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    TERMINATED = "TERMINATED"
    EXPIRED = "EXPIRED"


class MaintenanceStatusEnum(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


class PaymentStatusEnum(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"


class MaintenancePriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


# Base Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.TENANT


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserBasic(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBasic


class TokenData(BaseModel):
    email: Optional[str] = None


# Tenant Schemas
class TenantBase(BaseModel):
    phone: Optional[str] = None


class TenantCreate(TenantBase):
    userId: int


class TenantResponse(TenantBase):
    id: int
    userId: int
    user: UserBasic

    model_config = ConfigDict(from_attributes=True)


# Property Schemas
class PropertyBase(BaseModel):
    title: str
    address: str
    city: str
    province: str
    postalCode: str
    description: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    zipCode: Optional[str] = None
    description: Optional[str] = None


class PropertyResponse(PropertyBase):
    id: int
    landlordId: int
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


# Unit Schemas
class UnitBase(BaseModel):
    unitNumber: str
    bedrooms: int = 0
    bathrooms: int = 0
    rentAmount: float = 0


class UnitCreate(UnitBase):
    propertyId: int


class UnitCreateForProperty(BaseModel):
    """Unit creation without propertyId (comes from URL path)"""
    unitNumber: str
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    rentAmount: Optional[float] = 0


class UnitUpdate(BaseModel):
    unitNumber: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    rentAmount: Optional[float] = None


class UnitResponse(UnitBase):
    id: int
    propertyId: int
    createdAt: datetime
    updatedAt: datetime
    status: Optional[str] = None  # Computed field for occupancy status

    model_config = ConfigDict(from_attributes=True)


# Lease Schemas
class LeaseBase(BaseModel):
    startDate: datetime
    endDate: Optional[datetime] = None
    rent: Optional[float] = None
    status: LeaseStatusEnum = LeaseStatusEnum.ACTIVE


class LeaseCreate(LeaseBase):
    tenantId: int
    unitId: int


class LeaseUpdate(BaseModel):
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    rent: Optional[int] = None
    status: Optional[LeaseStatusEnum] = None


class UnitBasic(BaseModel):
    id: int
    unitNumber: str
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    property: Optional['PropertyResponse'] = None

    model_config = ConfigDict(from_attributes=True)


class LeaseResponse(LeaseBase):
    id: int
    tenantId: int
    unitId: int
    tenant: Optional[TenantResponse] = None
    unit: Optional[UnitBasic] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


# Payment Schemas
class PaymentBase(BaseModel):
    amount: float
    dueDate: datetime
    status: PaymentStatusEnum = PaymentStatusEnum.PENDING


class PaymentCreate(PaymentBase):
    leaseId: int


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    dueDate: Optional[datetime] = None
    status: Optional[PaymentStatusEnum] = None
    paidAt: Optional[datetime] = None
    stripePaymentIntentId: Optional[str] = None


class PaymentResponse(PaymentBase):
    id: int
    leaseId: int
    lease: Optional['LeaseResponse'] = None
    paidAt: Optional[datetime] = None
    stripePaymentIntentId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


# Maintenance Request Schemas
class MaintenanceRequestBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: MaintenanceStatusEnum = MaintenanceStatusEnum.PENDING
    priority: MaintenancePriorityEnum = MaintenancePriorityEnum.MEDIUM
    contractor: Optional[str] = None
    photos: List[str] = []


class MaintenanceRequestCreate(MaintenanceRequestBase):
    leaseId: int


class MaintenanceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[MaintenanceStatusEnum] = None
    priority: Optional[MaintenancePriorityEnum] = None
    contractor: Optional[str] = None
    completedAt: Optional[datetime] = None


class MaintenanceRequestResponse(MaintenanceRequestBase):
    id: int
    leaseId: int
    lease: Optional['LeaseResponse'] = None
    createdAt: datetime
    updatedAt: datetime
    completedAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

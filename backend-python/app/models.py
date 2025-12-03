"""
SQLAlchemy Models for Property Management System
Converted from Prisma schema
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from .database import Base


class RoleEnum(str, enum.Enum):
    LANDLORD = "LANDLORD"
    TENANT = "TENANT"
    ADMIN = "ADMIN"


class LeaseStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    TERMINATED = "TERMINATED"
    EXPIRED = "EXPIRED"


class MaintenanceStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


class PaymentStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"


class MaintenancePriorityEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class User(Base):
    __tablename__ = "User"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.TENANT, nullable=False)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="user", uselist=False, cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="landlord", cascade="all, delete-orphan")


class Tenant(Base):
    __tablename__ = "Tenant"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String, nullable=True)
    
    userId = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="tenant")
    leases = relationship("Lease", back_populates="tenant", cascade="all, delete-orphan")


class Property(Base):
    __tablename__ = "Property"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    province = Column(String, nullable=False)
    postalCode = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    landlordId = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    landlord = relationship("User", back_populates="properties")
    units = relationship("Unit", back_populates="property", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "Unit"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    unitNumber = Column(String, nullable=False)
    bedrooms = Column(Integer, default=0, nullable=False)
    bathrooms = Column(Integer, default=0, nullable=False)
    rentAmount = Column(Float, default=0, nullable=False)
    
    propertyId = Column(Integer, ForeignKey("Property.id", ondelete="CASCADE"), nullable=False)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    property = relationship("Property", back_populates="units")
    leases = relationship("Lease", back_populates="unit", cascade="all, delete-orphan")


class Lease(Base):
    __tablename__ = "Lease"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    startDate = Column(DateTime, nullable=False)
    endDate = Column(DateTime, nullable=False)
    rent = Column(Integer, nullable=True)
    status = Column(SQLEnum(LeaseStatusEnum), default=LeaseStatusEnum.ACTIVE, nullable=False)
    
    tenantId = Column(Integer, ForeignKey("Tenant.id", ondelete="CASCADE"), nullable=False)
    unitId = Column(Integer, ForeignKey("Unit.id", ondelete="CASCADE"), nullable=False)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="leases")
    unit = relationship("Unit", back_populates="leases")
    payments = relationship("Payment", back_populates="lease", cascade="all, delete-orphan")
    maintenanceRequests = relationship("MaintenanceRequest", back_populates="lease", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "Payment"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    dueDate = Column(DateTime, nullable=False)
    status = Column(SQLEnum(PaymentStatusEnum), default=PaymentStatusEnum.PENDING, nullable=False)
    paidAt = Column(DateTime, nullable=True)
    stripePaymentIntentId = Column(String, nullable=True)
    
    leaseId = Column(Integer, ForeignKey("Lease.id", ondelete="CASCADE"), nullable=False)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    lease = relationship("Lease", back_populates="payments")


class MaintenanceRequest(Base):
    __tablename__ = "MaintenanceRequest"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(SQLEnum(MaintenanceStatusEnum), default=MaintenanceStatusEnum.PENDING, nullable=False)
    priority = Column(SQLEnum(MaintenancePriorityEnum), default=MaintenancePriorityEnum.MEDIUM, nullable=False)
    contractor = Column(String, nullable=True)
    photos = Column(JSON, default=list, nullable=False)
    
    leaseId = Column(Integer, ForeignKey("Lease.id", ondelete="CASCADE"), nullable=False)
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completedAt = Column(DateTime, nullable=True)

    # Relationships
    lease = relationship("Lease", back_populates="maintenanceRequests")

import pytest
import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from app.database import Base, get_db
from app.models import User, Property, Unit, Lease, Payment, Tenant, MaintenanceRequest

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def landlord_user(db_session):
    """Create a test landlord user"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    user = User(
        email="landlord@test.com",
        name="Test Landlord",
        password=pwd_context.hash("password123"),
        role="LANDLORD"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def tenant_user(db_session):
    """Create a test tenant user"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    user = User(
        email="tenant@test.com",
        name="Test Tenant",
        password=pwd_context.hash("password123"),
        role="TENANT"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Create associated tenant record
    tenant = Tenant(userId=user.id)
    db_session.add(tenant)
    db_session.commit()
    db_session.refresh(tenant)
    
    return user


@pytest.fixture
def auth_headers_landlord(client, landlord_user):
    """Get authentication headers for landlord"""
    response = client.post(
        "/api/auth/login",
        json={"email": "landlord@test.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_tenant(client, tenant_user):
    """Get authentication headers for tenant"""
    response = client.post(
        "/api/auth/login",
        json={"email": "tenant@test.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_property(db_session, landlord_user):
    """Create a sample property"""
    property_obj = Property(
        title="Test Property",
        address="123 Test St",
        city="Test City",
        state="TS",
        zipCode="12345",
        landlordId=landlord_user.id,
        description="Test property description"
    )
    db_session.add(property_obj)
    db_session.commit()
    db_session.refresh(property_obj)
    return property_obj


@pytest.fixture
def sample_unit(db_session, sample_property):
    """Create a sample unit"""
    unit = Unit(
        propertyId=sample_property.id,
        unitNumber="101",
        bedrooms=2,
        bathrooms=1,
        rentAmount=1200.00
    )
    db_session.add(unit)
    db_session.commit()
    db_session.refresh(unit)
    return unit


@pytest.fixture
def sample_lease(db_session, sample_unit, tenant_user):
    """Create a sample lease"""
    from datetime import datetime, timedelta
    
    # Get tenant record
    tenant = db_session.query(Tenant).filter(Tenant.userId == tenant_user.id).first()
    
    lease = Lease(
        tenantId=tenant.id,
        unitId=sample_unit.id,
        startDate=datetime.now(),
        endDate=datetime.now() + timedelta(days=365),
        rent=1200,
        status="ACTIVE"
    )
    db_session.add(lease)
    db_session.commit()
    db_session.refresh(lease)
    return lease

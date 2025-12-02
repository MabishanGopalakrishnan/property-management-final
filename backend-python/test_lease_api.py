import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models import Lease, User, Tenant
from app.schemas import LeaseResponse
from sqlalchemy.orm import joinedload

db = SessionLocal()

# Get a lease with relationships
lease = db.query(Lease).options(
    joinedload(Lease.tenant).joinedload(Tenant.user),
    joinedload(Lease.unit)
).first()

if lease:
    print(f"Lease ID: {lease.id}")
    print(f"Tenant ID: {lease.tenantId}")
    print(f"Tenant Object: {lease.tenant}")
    print(f"User Object: {lease.tenant.user if lease.tenant else None}")
    print(f"User Name: {lease.tenant.user.name if lease.tenant and lease.tenant.user else 'NO USER'}")
    
    # Try to serialize with Pydantic
    try:
        lease_response = LeaseResponse.model_validate(lease)
        print("\n=== Pydantic Serialization ===")
        print(lease_response.model_dump_json(indent=2))
    except Exception as e:
        print(f"\nPydantic Error: {e}")
        import traceback
        traceback.print_exc()

db.close()

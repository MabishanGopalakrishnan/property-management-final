# Property Management API - Python Backend

FastAPI-based backend for the Property Management System.

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL 15 with SQLAlchemy ORM
- **Authentication**: JWT with python-jose, bcrypt password hashing
- **Server**: Uvicorn ASGI server
- **Payment Processing**: Stripe
- **File Uploads**: Multipart form data with aiofiles

## Project Structure

```
backend-python/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
├── .env                   # Environment variables
└── app/
    ├── __init__.py
    ├── database.py        # Database connection and session
    ├── models.py          # SQLAlchemy ORM models
    ├── schemas.py         # Pydantic validation schemas
    ├── auth.py            # JWT and authentication utilities
    └── routers/           # API route handlers
        ├── auth.py
        ├── properties.py
        ├── units.py
        ├── leases.py
        ├── payments.py
        ├── maintenance.py
        ├── tenants.py
        ├── dashboard.py
        ├── tenant_portal.py
        └── webhooks.py
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://user:password@postgres_db:5432/tenant_management
JWT_SECRET=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Installation

### Using Docker (Recommended)

```bash
docker-compose up --build
```

### Local Development

1. Install Python 3.11+
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 5000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/verify` - Verify token validity

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create property (Landlord)
- `GET /api/properties/{id}` - Get property details
- `PUT /api/properties/{id}` - Update property (Landlord)
- `DELETE /api/properties/{id}` - Delete property (Landlord)

### Units
- `GET /api/units` - Get all units
- `POST /api/units` - Create unit (Landlord)
- `GET /api/units/{id}` - Get unit details
- `PUT /api/units/{id}` - Update unit (Landlord)
- `DELETE /api/units/{id}` - Delete unit (Landlord)

### Leases
- `GET /api/leases` - Get all leases
- `POST /api/leases` - Create lease (Landlord)
- `GET /api/leases/{id}` - Get lease details
- `PUT /api/leases/{id}` - Update lease (Landlord)
- `DELETE /api/leases/{id}` - Delete lease (Landlord)

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment (Landlord)
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `POST /api/payments/{id}/pay` - Mark payment as paid
- `DELETE /api/payments/{id}` - Delete payment (Landlord)

### Maintenance
- `GET /api/maintenance` - Get all maintenance requests
- `POST /api/maintenance` - Create maintenance request
- `GET /api/maintenance/{id}` - Get request details
- `PUT /api/maintenance/{id}` - Update request
- `POST /api/maintenance/{id}/photos` - Upload photos
- `DELETE /api/maintenance/{id}` - Delete request

### Dashboard
- `GET /api/dashboard/stats` - Get landlord dashboard stats
- `GET /api/dashboard/tenant/stats` - Get tenant dashboard stats

### Tenant Portal
- `GET /api/tenant-portal/my-leases` - Get tenant's leases
- `GET /api/tenant-portal/my-payments` - Get tenant's payments
- `GET /api/tenant-portal/my-maintenance` - Get tenant's maintenance requests

## Database Models

- **User** - System users (Landlords, Tenants, Admins)
- **Tenant** - Tenant profile information
- **Property** - Real estate properties
- **Unit** - Individual rental units within properties
- **Lease** - Rental agreements
- **Payment** - Rent payments
- **MaintenanceRequest** - Maintenance and repair requests

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### User Roles

- **LANDLORD** - Can manage properties, units, leases, payments
- **TENANT** - Can view their leases, payments, create maintenance requests
- **ADMIN** - Full system access

## Development

### Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

### Testing Endpoints

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"LANDLORD"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get current user (with token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```

## Migration from Node.js Backend

This Python backend is a complete replacement for the Node.js/Express backend. Key differences:

1. **ORM**: Prisma → SQLAlchemy
2. **Validation**: Manual validation → Pydantic schemas
3. **Async**: Express callbacks → Python async/await
4. **Auth**: jsonwebtoken → python-jose
5. **Password hashing**: bcryptjs → passlib with bcrypt

The API contracts remain the same, so the frontend requires minimal changes (only token field name).

## License

ISC

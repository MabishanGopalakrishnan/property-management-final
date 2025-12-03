# UML Package Diagram - Property Management System

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (React Frontend)                          │
│                                 Port: 5173                                       │
├──────────────────┬──────────────────┬──────────────────┬────────────────────────┤
│                  │                  │                  │                        │
│  ┌─────────────┐ │ ┌──────────────┐ │ ┌──────────────┐ │ ┌────────────────────┐ │
│  │   Pages     │ │ │  Components  │ │ │   Context    │ │ │    API Client      │ │
│  │             │ │ │              │ │ │              │ │ │                    │ │
│  │ Dashboard   │ │ │ Navbar       │ │ │ AuthContext  │ │ │ auth.js            │ │
│  │ Properties  │ │ │ Sidebar      │ │ │ State Mgmt   │ │ │ properties.js      │ │
│  │ Leases      │ │ │ Logo         │ │ │              │ │ │ leases.js          │ │
│  │ Tenants     │ │ │ Address      │ │ │              │ │ │ payments.js        │ │
│  │ Payments    │ │ │ Autocomplete │ │ │              │ │ │ tenants.js         │ │
│  │ Maintenance │ │ │ Layouts      │ │ │              │ │ │ maintenance.js     │ │
│  │ Login       │ │ │              │ │ │              │ │ │ axiosConfig.js     │ │
│  └─────────────┘ │ └──────────────┘ │ └──────────────┘ │ └────────────────────┘ │
│         │        │         │        │         │        │            │           │
│         └────────┴─────────┴─────────┴─────────┴────────┴────────────┘           │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        │ HTTP/REST (JSON)
                                        │ <<uses>>
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (FastAPI Backend)                         │
│                                 Port: 5000                                       │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────────┤
│              │              │              │              │                     │
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌─────────────────┐ │
│ │ Routers  │ │ │  Models  │ │ │ Schemas  │ │ │   Auth   │ │ │    Database     │ │
│ │(Control) │ │ │          │ │ │(Validat) │ │ │          │ │ │   Connection    │ │
│ │          │ │ │          │ │ │          │ │ │          │ │ │                 │ │
│ │ auth     │─┼─│ User     │ │ │ UserBase │ │ │ JWT      │ │ │ SessionLocal    │ │
│ │ property │─┼─│ Property │ │ │ PropBase │ │ │ Hash     │ │ │ engine          │ │
│ │ leases   │─┼─│ Unit     │ │ │ LeaseBase│ │ │ Current  │ │ │ get_db()        │ │
│ │ tenants  │─┼─│ Lease    │ │ │ Payment  │ │ │ User()   │ │ │ Base            │ │
│ │ payments │─┼─│ Payment  │ │ │ Tenant   │ │ │ Role     │ │ │                 │ │
│ │ maintain │─┼─│ Tenant   │ │ │ MainReq  │ │ │ Verify   │ │ │                 │ │
│ │ dashboard│─┼─│ MainReq  │ │ │          │ │ │          │ │ │                 │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └─────────────────┘ │
│      │       │       │      │              │       │      │          │          │
│      └───────┴───────┴──────┴──────────────┴───────┴──────┴──────────┘          │
└────────────────────────────────────────────┬────────────────────────────────────┘
                                             │
                                             │ SQLAlchemy ORM
                                             │ <<uses>>
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER (PostgreSQL Database)                          │
│                                Port: 5432                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                          Database Tables                                 │  │
│  │                                                                          │  │
│  │  • User              • Property         • Unit                          │  │
│  │  • Tenant            • Lease            • Payment                       │  │
│  │  • MaintenanceRequest                                                   │  │
│  │                                                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL APIS                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐   │
│  │   Google OAuth 2.0   │  │   Google Maps API    │  │    Stripe API      │   │
│  │  <<external>>        │  │   <<external>>       │  │   <<external>>     │   │
│  │                      │  │                      │  │                    │   │
│  │  Authentication      │  │  Address             │  │  Payment           │   │
│  │  Authorization       │  │  Autocomplete        │  │  Processing        │   │
│  │                      │  │  Location Services   │  │  Transactions      │   │
│  └──────────────────────┘  └──────────────────────┘  └────────────────────┘   │
│           ▲                          ▲                        ▲                │
│           │                          │                        │                │
└───────────┼──────────────────────────┼────────────────────────┼────────────────┘
            │                          │                        │
            └──────────<<uses>>────────┴────────<<uses>>────────┘
```

## Package Dependencies Legend

```
<<uses>>  : Dependency relationship (dashed arrow)
─────►    : Data flow direction
<<external>> : External third-party service
[PK]      : Primary Key
[FK]      : Foreign Key
```

## Layer Descriptions

### Client Layer (Frontend)
- **Purpose**: User interface and client-side logic
- **Technology**: React 18, Vite, React Router
- **Responsibilities**:
  - User interaction handling
  - Form validation
  - State management (Context API)
  - API communication
  - Routing and navigation

### Application Layer (Backend)
- **Purpose**: Business logic and API endpoints
- **Technology**: FastAPI, Python 3.11, SQLAlchemy
- **Responsibilities**:
  - RESTful API endpoints (Routers/Controllers)
  - Data validation (Schemas/Pydantic)
  - Authentication & authorization (JWT)
  - Database ORM (Models)
  - Business rule enforcement

### Data Layer (Database)
- **Purpose**: Data persistence and storage
- **Technology**: PostgreSQL 15
- **Responsibilities**:
  - Data storage
  - Data integrity (constraints, relationships)
  - Transaction management
  - Query optimization

### External APIs
- **Google OAuth 2.0**: User authentication
- **Google Maps API**: Address autocomplete for property locations
- **Stripe API**: Payment processing for rent collection

## Architecture Pattern

**Type**: Monolithic MVC (Model-View-Controller)

- **Model**: SQLAlchemy models (`backend-python/app/models.py`)
- **View**: React components (`frontend/src/pages/`, `frontend/src/components/`)
- **Controller**: FastAPI routers (`backend-python/app/routers/`)

## Communication Flow

1. **Client → Backend**: HTTP REST API calls (JSON)
2. **Backend → Database**: SQLAlchemy ORM queries
3. **Backend → External APIs**: HTTP requests for OAuth, Maps, Payments
4. **Response Flow**: Database → Backend → Client

## Deployment Architecture

All components are containerized using Docker:
- `pm-frontend`: React app served via Nginx
- `pm-backend-python`: FastAPI application
- `postgres_db`: PostgreSQL database

Orchestrated via `docker-compose.yml` with automatic networking and volume management.

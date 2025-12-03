"""
FastAPI Backend for Property Management System
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import engine, Base
from app.routers import (
    auth,
    properties,
    units,
    leases,
    payments,
    maintenance,
    tenants,
    dashboard,
    tenant_portal,
    webhooks
)

# Create database tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for the application"""
    print("🚀 Starting Property Management API...")
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads/maintenance", exist_ok=True)
    yield
    print("👋 Shutting down Property Management API...")


app = FastAPI(
    title="Property Management API",
    description="Backend API for Tenant and Property Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
app.include_router(units.router, prefix="/api/units", tags=["Units"])
app.include_router(leases.router, prefix="/api/leases", tags=["Leases"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["Maintenance"])
app.include_router(tenants.router, prefix="/api/tenants", tags=["Tenants"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(tenant_portal.router, prefix="/api/tenant-portal", tags=["Tenant Portal"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Property Management API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)

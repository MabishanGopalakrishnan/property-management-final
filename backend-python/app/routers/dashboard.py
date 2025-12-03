"""
Dashboard Router
Provides statistics and overview data
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, Property, Unit, Lease, Payment, MaintenanceRequest, Tenant
from ..auth import get_current_user, get_current_landlord

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Get dashboard statistics for landlord"""
    
    # Count properties
    property_count = db.query(func.count(Property.id)).filter(
        Property.landlordId == current_user.id
    ).scalar()
    
    # Count units
    unit_count = db.query(func.count(Unit.id)).join(Property).filter(
        Property.landlordId == current_user.id
    ).scalar()
    
    # Count active leases
    active_lease_count = db.query(func.count(Lease.id)).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Lease.status == "ACTIVE"
    ).scalar()
    
    # Count pending payments
    pending_payments = db.query(func.count(Payment.id)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Payment.status == "PENDING"
    ).scalar()
    
    # Sum pending payment amounts
    pending_amount = db.query(func.sum(Payment.amount)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Payment.status == "PENDING"
    ).scalar() or 0
    
    # Count maintenance requests by status
    pending_maintenance = db.query(func.count(MaintenanceRequest.id)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        MaintenanceRequest.status == "PENDING"
    ).scalar()
    
    in_progress_maintenance = db.query(func.count(MaintenanceRequest.id)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        MaintenanceRequest.status == "IN_PROGRESS"
    ).scalar()
    
    return {
        "properties": property_count,
        "units": unit_count,
        "activeLeases": active_lease_count,
        "pendingPayments": pending_payments,
        "pendingAmount": float(pending_amount),
        "pendingMaintenance": pending_maintenance,
        "inProgressMaintenance": in_progress_maintenance
    }


@router.get("/tenant/stats")
async def get_tenant_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics for tenant"""
    
    # Get tenant record
    tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
    
    if not tenant:
        return {
            "activeLeases": 0,
            "pendingPayments": 0,
            "pendingAmount": 0,
            "maintenanceRequests": 0
        }
    
    # Count active leases
    active_leases = db.query(func.count(Lease.id)).filter(
        Lease.tenantId == tenant.id,
        Lease.status == "ACTIVE"
    ).scalar()
    
    # Count pending payments
    pending_payments = db.query(func.count(Payment.id)).join(Lease).filter(
        Lease.tenantId == tenant.id,
        Payment.status == "PENDING"
    ).scalar()
    
    # Sum pending payment amounts
    pending_amount = db.query(func.sum(Payment.amount)).join(Lease).filter(
        Lease.tenantId == tenant.id,
        Payment.status == "PENDING"
    ).scalar() or 0
    
    # Count maintenance requests
    maintenance_count = db.query(func.count(MaintenanceRequest.id)).join(Lease).filter(
        Lease.tenantId == tenant.id
    ).scalar()
    
    return {
        "activeLeases": active_leases,
        "pendingPayments": pending_payments,
        "pendingAmount": float(pending_amount),
        "maintenanceRequests": maintenance_count
    }


@router.get("/manager-stats")
async def get_manager_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Get manager/landlord dashboard statistics with complete data"""
    
    # Count total properties
    total_properties = db.query(func.count(Property.id)).filter(
        Property.landlordId == current_user.id
    ).scalar() or 0
    
    # Count total units
    total_units = db.query(func.count(Unit.id)).join(Property).filter(
        Property.landlordId == current_user.id
    ).scalar() or 0
    
    # Count occupied units (units with active leases)
    occupied_units = db.query(func.count(func.distinct(Lease.unitId))).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Lease.status == "ACTIVE"
    ).scalar() or 0
    
    # Calculate vacant units
    vacant_units = total_units - occupied_units
    
    # Calculate occupancy rate
    occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0
    
    # Count active leases
    active_leases = db.query(func.count(Lease.id)).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Lease.status == "ACTIVE"
    ).scalar() or 0
    
    # Count pending maintenance
    pending_maintenance = db.query(func.count(MaintenanceRequest.id)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        MaintenanceRequest.status == "PENDING"
    ).scalar() or 0
    
    # Count overdue payments
    from datetime import datetime
    overdue_payments = db.query(func.count(Payment.id)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Payment.status == "PENDING",
        Payment.dueDate < datetime.utcnow()
    ).scalar() or 0
    
    # Calculate total revenue (sum of PAID payments)
    total_revenue = db.query(func.sum(Payment.amount)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Payment.status == "PAID"
    ).scalar() or 0
    
    # Calculate pending revenue (sum of PENDING payments)
    pending_revenue = db.query(func.sum(Payment.amount)).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Payment.status == "PENDING"
    ).scalar() or 0
    
    return {
        "totalProperties": total_properties,
        "totalUnits": total_units,
        "occupiedUnits": occupied_units,
        "vacantUnits": vacant_units,
        "occupancyRate": round(occupancy_rate, 1),
        "activeLeases": active_leases,
        "pendingMaintenance": pending_maintenance,
        "overduePayments": overdue_payments,
        "totalRevenue": float(total_revenue),
        "pendingRevenue": float(pending_revenue)
    }


@router.get("/manager-alerts")
async def get_manager_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Get alerts and notifications for landlord"""
    
    # Get overdue payments
    from datetime import datetime
    overdue_payments = db.query(Payment).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Payment.status == "PENDING",
        Payment.dueDate < datetime.utcnow()
    ).all()
    
    # Get pending maintenance requests
    pending_maintenance = db.query(MaintenanceRequest).join(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        MaintenanceRequest.status == "PENDING"
    ).all()
    
    # Get expiring leases (within 30 days)
    from datetime import timedelta
    expiring_soon = datetime.utcnow() + timedelta(days=30)
    expiring_leases = db.query(Lease).join(Unit).join(Property).filter(
        Property.landlordId == current_user.id,
        Lease.status == "ACTIVE",
        Lease.endDate <= expiring_soon,
        Lease.endDate >= datetime.utcnow()
    ).all()
    
    alerts = []
    
    # Add overdue payment alerts
    for payment in overdue_payments:
        alerts.append({
            "type": "payment",
            "severity": "high",
            "message": f"Overdue payment of ${payment.amount} from lease {payment.leaseId}",
            "date": payment.dueDate.isoformat(),
            "id": payment.id
        })
    
    # Add maintenance alerts
    for maintenance in pending_maintenance:
        alerts.append({
            "type": "maintenance",
            "severity": "medium" if maintenance.priority == "MEDIUM" else "high" if maintenance.priority == "HIGH" else "low",
            "message": f"Maintenance request: {maintenance.title}",
            "date": maintenance.createdAt.isoformat(),
            "id": maintenance.id
        })
    
    # Add expiring lease alerts
    for lease in expiring_leases:
        alerts.append({
            "type": "lease",
            "severity": "medium",
            "message": f"Lease {lease.id} expiring on {lease.endDate.strftime('%Y-%m-%d')}",
            "date": lease.endDate.isoformat(),
            "id": lease.id
        })
    
    return alerts  # Return array directly, not wrapped in object


@router.get("/recent-activity")
async def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_landlord)
):
    """Get recent activity for landlord's properties"""
    from datetime import datetime
    
    activities = []
    
    # Get recently created properties
    recent_properties = db.query(Property).filter(
        Property.landlordId == current_user.id
    ).order_by(Property.createdAt.desc()).limit(5).all()
    
    for prop in recent_properties:
        time_diff = datetime.utcnow() - prop.createdAt
        if time_diff.days == 0:
            if time_diff.seconds < 3600:
                time_str = f"{time_diff.seconds // 60} minutes ago"
            else:
                time_str = f"{time_diff.seconds // 3600} hours ago"
        else:
            time_str = f"{time_diff.days} days ago"
            
        activities.append({
            "action": "Property Added",
            "property": prop.title,
            "time": time_str,
            "timestamp": prop.createdAt.isoformat()
        })
    
    # Get recently created units
    recent_units = db.query(Unit).join(Property).filter(
        Property.landlordId == current_user.id
    ).order_by(Unit.createdAt.desc()).limit(5).all()
    
    for unit in recent_units:
        time_diff = datetime.utcnow() - unit.createdAt
        if time_diff.days == 0:
            if time_diff.seconds < 3600:
                time_str = f"{time_diff.seconds // 60} minutes ago"
            else:
                time_str = f"{time_diff.seconds // 3600} hours ago"
        else:
            time_str = f"{time_diff.days} days ago"
            
        activities.append({
            "action": "Unit Created",
            "property": unit.property.title,
            "time": time_str,
            "timestamp": unit.createdAt.isoformat()
        })
    
    # Get recently updated properties
    recent_updates = db.query(Property).filter(
        Property.landlordId == current_user.id,
        Property.updatedAt > Property.createdAt
    ).order_by(Property.updatedAt.desc()).limit(5).all()
    
    for prop in recent_updates:
        time_diff = datetime.utcnow() - prop.updatedAt
        if time_diff.days == 0:
            if time_diff.seconds < 3600:
                time_str = f"{time_diff.seconds // 60} minutes ago"
            else:
                time_str = f"{time_diff.seconds // 3600} hours ago"
        else:
            time_str = f"{time_diff.days} days ago"
            
        activities.append({
            "action": "Property Updated",
            "property": prop.title,
            "time": time_str,
            "timestamp": prop.updatedAt.isoformat()
        })
    
    # Sort all activities by timestamp and return top 10
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:10]


@router.get("/tenant-alerts")
async def get_tenant_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get alerts and notifications for tenant"""
    from datetime import datetime, timedelta
    
    # Get tenant record
    tenant = db.query(Tenant).filter(Tenant.userId == current_user.id).first()
    
    if not tenant:
        return []
    
    alerts = []
    
    # Get upcoming payments (due within 7 days)
    upcoming_deadline = datetime.utcnow() + timedelta(days=7)
    upcoming_payments = db.query(Payment).join(Lease).filter(
        Lease.tenantId == tenant.id,
        Payment.status == "PENDING",
        Payment.dueDate <= upcoming_deadline,
        Payment.dueDate >= datetime.utcnow()
    ).all()
    
    # Get overdue payments
    overdue_payments = db.query(Payment).join(Lease).filter(
        Lease.tenantId == tenant.id,
        Payment.status == "PENDING",
        Payment.dueDate < datetime.utcnow()
    ).all()
    
    # Get maintenance requests with updates
    recent_maintenance_updates = db.query(MaintenanceRequest).join(Lease).filter(
        Lease.tenantId == tenant.id,
        MaintenanceRequest.status.in_(["IN_PROGRESS", "COMPLETED"])
    ).order_by(MaintenanceRequest.updatedAt.desc()).limit(3).all()
    
    # Add overdue payment alerts (highest priority)
    for payment in overdue_payments:
        days_overdue = (datetime.utcnow() - payment.dueDate).days
        alerts.append({
            "type": "urgent",
            "severity": "high",
            "message": f"Payment of ${payment.amount} is {days_overdue} day{'s' if days_overdue != 1 else ''} overdue",
            "date": payment.dueDate.isoformat(),
            "link": "/tenant/payments",
            "id": payment.id
        })
    
    # Add upcoming payment alerts
    for payment in upcoming_payments:
        days_until = (payment.dueDate - datetime.utcnow()).days
        alerts.append({
            "type": "warning",
            "severity": "medium",
            "message": f"Payment of ${payment.amount} due in {days_until} day{'s' if days_until != 1 else ''}",
            "date": payment.dueDate.isoformat(),
            "link": "/tenant/payments",
            "id": payment.id
        })
    
    # Add maintenance update alerts
    for maintenance in recent_maintenance_updates:
        status_msg = "completed" if maintenance.status == "COMPLETED" else "in progress"
        alerts.append({
            "type": "info",
            "severity": "low",
            "message": f"Maintenance request '{maintenance.title}' is now {status_msg}",
            "date": maintenance.updatedAt.isoformat(),
            "link": "/tenant/maintenance",
            "id": maintenance.id
        })
    
    return alerts

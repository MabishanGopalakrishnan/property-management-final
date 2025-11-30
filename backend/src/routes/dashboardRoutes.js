// backend/src/routes/dashboardRoutes.js
import express from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/authMiddleware.js";
import prisma from "../prisma/client.js";

console.log('🔧 Loading dashboardRoutes...');

const router = express.Router();

// Get manager dashboard statistics
router.get("/manager-stats", authRequired, requireRole("LANDLORD"), async (req, res) => {
  try {
    const landlordId = req.user.id;

    // Get total properties
    const totalProperties = await prisma.property.count({
      where: { landlordId }
    });

    // Get all units for the landlord
    const units = await prisma.unit.findMany({
      where: {
        property: {
          landlordId
        }
      },
      include: {
        leases: {
          where: {
            status: "ACTIVE"
          }
        }
      }
    });

    const totalUnits = units.length;
    const occupiedUnits = units.filter(unit => unit.leases.length > 0).length;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

    // Get pending maintenance count
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        lease: {
          unit: {
            property: {
              landlordId
            }
          }
        },
        status: "PENDING"
      }
    });

    // Get overdue payments
    const now = new Date();
    const overduePayments = await prisma.payment.count({
      where: {
        lease: {
          unit: {
            property: {
              landlordId
            }
          }
        },
        status: "PENDING",
        dueDate: {
          lt: now
        }
      }
    });

    // Calculate total revenue (completed payments)
    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId
            }
          }
        },
        status: "PAID"
      },
      select: {
        amount: true
      }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Get pending payments total
    const pendingPayments = await prisma.payment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId
            }
          }
        },
        status: "PENDING"
      },
      select: {
        amount: true
      }
    });

    const pendingRevenue = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Get active leases
    const activeLeases = await prisma.lease.count({
      where: {
        unit: {
          property: {
            landlordId
          }
        },
        status: "ACTIVE"
      }
    });

    res.json({
      totalProperties,
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate: parseFloat(occupancyRate),
      activeLeases,
      pendingMaintenance,
      overduePayments,
      totalRevenue: totalRevenue.toFixed(2),
      pendingRevenue: pendingRevenue.toFixed(2)
    });
  } catch (error) {
    console.error("Error fetching manager stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Get manager alerts
router.get("/manager-alerts", authRequired, requireRole("LANDLORD"), async (req, res) => {
  try {
    const landlordId = req.user.id;
    const alerts = [];

    // Check for urgent maintenance requests (PENDING status)
    const urgentMaintenance = await prisma.maintenanceRequest.count({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: landlordId
            }
          }
        },
        status: "PENDING"
      }
    });

    if (urgentMaintenance > 0) {
      alerts.push({
        type: "urgent",
        title: `${urgentMaintenance} Pending Maintenance Request${urgentMaintenance > 1 ? 's' : ''}`,
        message: `You have ${urgentMaintenance} maintenance request${urgentMaintenance > 1 ? 's' : ''} waiting for your attention.`,
        link: "/maintenance"
      });
    }

    // Check for in-progress maintenance requests
    const inProgressMaintenance = await prisma.maintenanceRequest.count({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: landlordId
            }
          }
        },
        status: "IN_PROGRESS"
      }
    });

    if (inProgressMaintenance > 0) {
      alerts.push({
        type: "warning",
        title: `${inProgressMaintenance} In-Progress Maintenance`,
        message: `${inProgressMaintenance} maintenance request${inProgressMaintenance > 1 ? 's are' : ' is'} currently being worked on.`,
        link: "/maintenance"
      });
    }

    // Check for overdue payments (payments that should have been made but weren't)
    const now = new Date();
    const overduePayments = await prisma.payment.count({
      where: {
        lease: {
          unit: {
            property: {
              landlordId: landlordId
            }
          }
        },
        status: "PENDING",
        dueDate: {
          lt: now
        }
      }
    });

    if (overduePayments > 0) {
      alerts.push({
        type: "urgent",
        title: `${overduePayments} Overdue Payment${overduePayments > 1 ? 's' : ''}`,
        message: `${overduePayments} rent payment${overduePayments > 1 ? 's are' : ' is'} overdue.`,
        link: "/payments"
      });
    }

    // Check for expiring leases (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringLeases = await prisma.lease.count({
      where: {
        unit: {
          property: {
            landlordId: landlordId
          }
        },
        endDate: {
          gte: now,
          lte: thirtyDaysFromNow
        }
      }
    });

    if (expiringLeases > 0) {
      alerts.push({
        type: "info",
        title: `${expiringLeases} Lease${expiringLeases > 1 ? 's' : ''} Expiring Soon`,
        message: `${expiringLeases} lease${expiringLeases > 1 ? 's' : ''} will expire in the next 30 days.`,
        link: "/leases"
      });
    }

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching manager alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// Get tenant alerts
router.get("/tenant-alerts", authRequired, requireRole("TENANT"), async (req, res) => {
  try {
    const tenantId = req.user.id;
    const alerts = [];

    // Check for overdue payments
    const now = new Date();
    const overduePayments = await prisma.payment.count({
      where: {
        lease: {
          tenantId: tenantId
        },
        status: "PENDING",
        dueDate: {
          lt: now
        }
      }
    });

    if (overduePayments > 0) {
      alerts.push({
        type: "urgent",
        title: `${overduePayments} Overdue Payment${overduePayments > 1 ? 's' : ''}`,
        message: `You have ${overduePayments} overdue rent payment${overduePayments > 1 ? 's' : ''}. Please pay as soon as possible.`,
        link: "/tenant/payments"
      });
    }

    // Check for upcoming payments (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingPayments = await prisma.payment.count({
      where: {
        lease: {
          tenantId: tenantId
        },
        status: "PENDING",
        dueDate: {
          gte: now,
          lte: sevenDaysFromNow
        }
      }
    });

    if (upcomingPayments > 0) {
      alerts.push({
        type: "warning",
        title: `${upcomingPayments} Payment${upcomingPayments > 1 ? 's' : ''} Due Soon`,
        message: `You have ${upcomingPayments} rent payment${upcomingPayments > 1 ? 's' : ''} due in the next 7 days.`,
        link: "/tenant/payments"
      });
    }

    // Check for maintenance request updates
    const updatedMaintenance = await prisma.maintenanceRequest.count({
      where: {
        tenantId: tenantId,
        status: {
          in: ["IN_PROGRESS", "COMPLETED"]
        },
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (updatedMaintenance > 0) {
      alerts.push({
        type: "info",
        title: `Maintenance Request Update${updatedMaintenance > 1 ? 's' : ''}`,
        message: `${updatedMaintenance} of your maintenance request${updatedMaintenance > 1 ? 's have' : ' has'} been updated.`,
        link: "/tenant/maintenance"
      });
    }

    // Check for lease expiration (within 60 days)
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const expiringLease = await prisma.lease.findFirst({
      where: {
        tenantId: tenantId,
        endDate: {
          gte: now,
          lte: sixtyDaysFromNow
        }
      }
    });

    if (expiringLease) {
      const daysUntilExpiry = Math.ceil((expiringLease.endDate - now) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: "warning",
        title: "Lease Expiring Soon",
        message: `Your lease will expire in ${daysUntilExpiry} days. Please contact your landlord to renew.`,
        link: "/tenant"
      });
    }

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching tenant alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

export default router;

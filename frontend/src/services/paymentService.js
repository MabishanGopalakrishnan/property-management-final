// backend/src/services/paymentService.js
import prisma from "../prisma/client.js";

export function computePaymentStatus(payment) {
  if (payment.status === "PAID") return "PAID";
  if (payment.status === "FAILED") return "FAILED";

  const now = new Date();
  if (!payment.paidAt && payment.dueDate && payment.dueDate < now) {
    return "LATE";
  }
  return "PENDING";
}

// Tenant: payments for logged-in tenant
export const getTenantPayments = async (userId) => {
  const tenant = await prisma.tenant.findUnique({
    where: { userId },
  });

  if (!tenant) return [];

  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        tenantId: tenant.id,
      },
    },
    orderBy: { dueDate: "asc" },
    include: {
      lease: {
        include: {
          unit: { include: { property: true } },
          tenant: { include: { user: true } },
        },
      },
    },
  });

  return payments.map((p) => ({
    ...p,
    computedStatus: computePaymentStatus(p),
  }));
};

// Property manager: payments across all properties
export const getLandlordPaymentsService = async (landlordId) => {
  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        unit: {
          property: {
            landlordId,
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
    include: {
      lease: {
        include: {
          unit: { include: { property: true } },
          tenant: { include: { user: true } },
        },
      },
    },
  });

  return payments.map((p) => ({
    ...p,
    computedStatus: computePaymentStatus(p),
  }));
};

// Payments for a specific lease
export const getLeasePaymentsService = async (leaseId) => {
  const id = Number(leaseId);
  const payments = await prisma.payment.findMany({
    where: { leaseId: id },
    orderBy: { dueDate: "asc" },
    include: {
      lease: {
        include: {
          unit: { include: { property: true } },
          tenant: { include: { user: true } },
        },
      },
    },
  });

  return payments.map((p) => ({
    ...p,
    computedStatus: computePaymentStatus(p),
  }));
};

// Mark as paid (simple simulation)
export const markPaymentPaidService = async (paymentId) => {
  const id = Number(paymentId);
  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });
  return updated;
};

// Summary for manager analytics (KPI cards)
export const getLandlordPaymentSummaryService = async (landlordId) => {
  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        unit: {
          property: { landlordId },
        },
      },
    },
    include: {
      lease: true,
    },
  });

  let totalRevenue = 0;
  let pendingCount = 0;
  let lateCount = 0;

  for (const p of payments) {
    const status = computePaymentStatus(p);
    if (status === "PAID") {
      totalRevenue += Number(p.amount);
    } else if (status === "PENDING") {
      pendingCount++;
    } else if (status === "LATE") {
      lateCount++;
    }
  }

  const activeLeases = await prisma.lease.count({
    where: {
      status: "ACTIVE",
      unit: { property: { landlordId } },
    },
  });

  return {
    totalRevenue,
    pendingCount,
    lateCount,
    activeLeases,
  };
};

// Chart data per month for manager
export const getLandlordPaymentChartService = async (landlordId) => {
  const payments = await prisma.payment.findMany({
    where: {
      lease: {
        unit: {
          property: { landlordId },
        },
      },
    },
  });

  const map = new Map();

  for (const p of payments) {
    const d = p.dueDate || p.createdAt;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    if (!map.has(key)) {
      map.set(key, { month: key, expected: 0, collected: 0 });
    }
    const entry = map.get(key);
    entry.expected += Number(p.amount || 0);
    if (p.status === "PAID") {
      entry.collected += Number(p.amount || 0);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
};


// Generate monthly payments for a lease
export async function generateMonthlyPaymentsForLease(
  leaseId,
  startDate,
  endDate,
  rentAmount
) {
  const payments = [];

  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    payments.push({
      leaseId,
      amount: rentAmount,
      dueDate: new Date(current),
      status: "PENDING",
    });

    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }

  // Bulk insert payments
  await prisma.payment.createMany({
    data: payments,
  });

  return payments.length;
}

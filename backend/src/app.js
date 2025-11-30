// backend/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";



import propertyRoutes from "./routes/propertyRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import tenantPortalRoutes from "./routes/tenantPortalRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import startSyncJob from "./tasks/syncPaymentsJob.js";



dotenv.config();

const app = express();

// Stripe webhooks MUST be before express.json, and use raw body.
app.use("/api/webhooks", webhookRoutes);

// Normal JSON parsing for the rest of the app
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tenant", tenantPortalRoutes);
app.use("/api/dashboard", dashboardRoutes);
console.log('✅ Dashboard routes mounted at /api/dashboard');


// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running." });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start background jobs (non-blocking)
try {
  startSyncJob();
  console.log('Background sync job started');
} catch (err) {
  console.warn('Failed to start background jobs:', err.message || err);
}

export default app;

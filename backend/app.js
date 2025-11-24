// backend/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

import propertyRoutes from "./src/routes/propertyRoutes.js";
import unitRoutes from "./src/routes/unitRoutes.js";
import leaseRoutes from "./src/routes/leaseRoutes.js";
import maintenanceRoutes from "./src/routes/maintenanceRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
// if you have webhook routes, keep this, otherwise you can comment it out:
import webhookRoutes from "./src/routes/webhookRoutes.js";

dotenv.config();

const app = express();

// If using Stripe webhooks:
app.use(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

// Normal JSON parsing for the rest of the app
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/payments", paymentRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running..." });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;

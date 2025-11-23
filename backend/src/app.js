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
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Stripe webhooks need raw body on that route only
app.use("/webhooks", webhookRoutes);

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/auth", authRoutes);

// DEV B
app.use("/properties", propertyRoutes);
app.use("/units", unitRoutes);
app.use("/leases", leaseRoutes);
app.use("/maintenance", maintenanceRoutes);

// DEV A
app.use("/payments", paymentRoutes);
app.use("/payment-history", paymentHistoryRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

export default app;

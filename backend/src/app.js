import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

// Routes
import propertyRoutes from "./routes/propertyRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.js";


dotenv.config();

const app = express();

// --------------------------
// 1. WEBHOOK ROUTE RAW BODY
// --------------------------
app.use("/api/webhooks", webhookRoutes);

// --------------------------
// 2. NORMAL MIDDLEWARE
// --------------------------
app.use(express.json());  // After webhook!
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// --------------------------
// 3. API ROUTES
// --------------------------
app.use("/api/properties", propertyRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment-history", paymentHistoryRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running..." });
});

export default app;

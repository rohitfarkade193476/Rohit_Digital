import { toNodeHandler } from "better-auth/node";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";

import { auth } from "./lib/auth.js";
import superAdminRoutes from "./modules/auth/super-admin.routes.js";
import societyRoutes from "./modules/society/society.routes.js";
import flatRoutes from "./modules/flat/flat.routes.js";
import residentRoutes from "./modules/resident/resident.routes.js";
import staffRoutes from "./modules/staff/staff.routes.js";
import vendorRoutes from "./modules/vendor/vendor.routes.js";
import complaintRoutes from "./modules/complaints/complaint.routes.js";
import vendorAssignmentRoutes from "./modules/complaints/vendor-assignment.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  // origin: true,
  credentials: true,
}));
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// app.options("/api/auth/{*any}", cors({
//   origin: env.FRONTEND_URL,
//   credentials: true,
// }));


app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/super-admin", superAdminRoutes);
app.use("/api/society", societyRoutes);
app.use("/api/flats", flatRoutes);


app.use("/api/residents", residentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/vendor/assignments", vendorAssignmentRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;

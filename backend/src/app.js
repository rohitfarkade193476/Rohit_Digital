import { toNodeHandler } from "better-auth/node";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";

import { auth } from "./lib/auth.js";
import superAdminRoutes from "./modules/auth/super-admin.routes.js";
import societyRoutes from "./modules/society/society.routes.js";

import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  // origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.options("/api/auth/{*any}", cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/super-admin", superAdminRoutes);
app.use("/api/society", societyRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;

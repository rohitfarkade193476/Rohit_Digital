import { toNodeHandler } from "better-auth/node";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";

import { auth } from "./lib/auth.js";
import superAdminRoutes from "./modules/auth/super-admin.routes.js";
import societyRoutes from "./modules/society/society.routes.js";

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/super-admin", superAdminRoutes);
app.use("/api/society", societyRoutes);

export default app;

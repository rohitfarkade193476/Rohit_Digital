import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import {
  getMyNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
} from "./notification.controller.js";
import pushRoutes from "./push.routes.js";

const router = Router();

router.use("/push", pushRoutes);

router.get("/", requireAuth, getMyNotificationsHandler);

router.patch(
  "/read-all",
  requireAuth,
  markAllNotificationsReadHandler,
);

router.patch(
  "/:id/read",
  requireAuth,
  markNotificationReadHandler,
);

export default router;

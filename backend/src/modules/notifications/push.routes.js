import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import {
  getVapidPublicKeyHandler,
  subscribePushHandler,
  unsubscribePushHandler,
} from "./push.controller.js";

const router = Router();

router.get("/vapid-public-key", requireAuth, getVapidPublicKeyHandler);

router.post("/subscribe", requireAuth, subscribePushHandler);

router.delete("/subscribe", requireAuth, unsubscribePushHandler);

export default router;

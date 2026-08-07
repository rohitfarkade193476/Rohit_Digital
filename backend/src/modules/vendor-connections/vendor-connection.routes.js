import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { requestConnectionValidation } from "./validators/requestConnection.validator.js";
import { respondConnectionValidation } from "./validators/respondConnection.validator.js";
import {
  sendConnectionRequestHandler,
  getSocietyConnectionsHandler,
  removeConnectionHandler,
  getVendorConnectionsHandler,
  getVendorPendingConnectionsHandler,
  respondConnectionHandler,
} from "./vendor-connection.controller.js";

const router = Router();

// Society Admin — vendor connections for their own society.
router.get(
  "/society",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getSocietyConnectionsHandler,
);

router.post(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  requestConnectionValidation,
  validate,
  sendConnectionRequestHandler,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  removeConnectionHandler,
);

// Vendor — connection requests to and from their company.
router.get(
  "/vendor/pending",
  requireAuth,
  requireRole("VENDOR"),
  getVendorPendingConnectionsHandler,
);

router.get(
  "/vendor",
  requireAuth,
  requireRole("VENDOR"),
  getVendorConnectionsHandler,
);

router.patch(
  "/:id/respond",
  requireAuth,
  requireRole("VENDOR"),
  respondConnectionValidation,
  validate,
  respondConnectionHandler,
);

export default router;

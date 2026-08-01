import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { registerVendorValidation } from "./validators/registerVendor.validator.js";
import { updateVendorValidation } from "./validators/updateVendor.validator.js";
import {
  registerVendorHandler,
  getVendorProfileHandler,
  updateVendorProfileHandler,
  getAllVendorsHandler,
  getVendorByIdHandler,
} from "./vendor.controller.js";

const router = Router();

// Public — vendor self-registration on the platform.
router.post(
  "/register",
  registerVendorValidation,
  validate,
  registerVendorHandler,
);

// Vendor self-service (own profile only).
router.get(
  "/me",
  requireAuth,
  requireRole("VENDOR"),
  getVendorProfileHandler,
);

router.patch(
  "/me",
  requireAuth,
  requireRole("VENDOR"),
  updateVendorValidation,
  validate,
  updateVendorProfileHandler,
);

// Society Admin vendor discovery.
router.get(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getAllVendorsHandler,
);

router.get(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getVendorByIdHandler,
);

export default router;

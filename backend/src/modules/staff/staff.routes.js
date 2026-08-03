import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { createStaffValidation } from "./validators/createStaff.validator.js";
import { updateStaffValidation } from "./validators/updateStaff.validator.js";
import {
  getAllStaffHandler,
  getStaffByIdHandler,
  createStaffHandler,
  updateStaffHandler,
  deactivateStaffHandler,
} from "./staff.controller.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getAllStaffHandler,
);

router.post(
  "/",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  createStaffValidation,
  validate,
  createStaffHandler,
);

router.get(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getStaffByIdHandler,
);

router.put(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  updateStaffValidation,
  validate,
  updateStaffHandler,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  deactivateStaffHandler,
);

export default router;

import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { updateAssignmentStatusValidation } from "./validators/updateAssignmentStatus.validator.js";
import {
  listMyAssignmentsHandler,
  getMyAssignmentHandler,
  updateMyAssignmentStatusHandler,
} from "./vendor-assignment.controller.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("VENDOR"),
  listMyAssignmentsHandler,
);

router.get(
  "/:id",
  requireAuth,
  requireRole("VENDOR"),
  getMyAssignmentHandler,
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("VENDOR"),
  updateAssignmentStatusValidation,
  validate,
  updateMyAssignmentStatusHandler,
);

export default router;

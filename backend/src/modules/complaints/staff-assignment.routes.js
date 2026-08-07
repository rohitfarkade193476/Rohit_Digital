import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import uploadComplaintImage from "../../middlewares/complaintUpload.middleware.js";
import { updateStaffAssignmentStatusValidation } from "./validators/updateStaffAssignmentStatus.validator.js";
import {
  listMyStaffAssignmentsHandler,
  getMyStaffAssignmentHandler,
  updateMyStaffAssignmentStatusHandler,
} from "./staff-assignment.controller.js";

const router = Router();

/**
 * GET /api/staff/assignments
 * Return all assignments belonging to the authenticated staff member.
 */
router.get(
  "/",
  requireAuth,
  requireRole("STAFF"),
  listMyStaffAssignmentsHandler,
);

/**
 * GET /api/staff/assignments/:id
 * Return a single assignment (ownership-verified — staff can only see their own).
 */
router.get(
  "/:id",
  requireAuth,
  requireRole("STAFF"),
  getMyStaffAssignmentHandler,
);

/**
 * PATCH /api/staff/assignments/:id/status
 * Update the status of a staff assignment.
 * For COMPLETED, the "afterImage" multipart field must contain the resolution image.
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("STAFF"),
  uploadComplaintImage.single("afterImage"),
  updateStaffAssignmentStatusValidation,
  validate,
  updateMyStaffAssignmentStatusHandler,
);

export default router;

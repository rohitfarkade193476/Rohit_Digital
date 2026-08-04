import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { createComplaintValidation } from "./validators/createComplaint.validator.js";
import { assignVendorValidation } from "./validators/assignVendor.validator.js";
import uploadComplaintImage from "../../middlewares/complaintUpload.middleware.js";
import {
  createComplaintHandler,
  getAllComplaintsHandler,
  getComplaintByIdHandler,
  getComplaintHistoryHandler,
  reopenComplaintHandler,
  changeComplaintStatusHandler,
} from "./complaint.controller.js";
import {
  assignVendorHandler,
  getComplaintAssignmentsHandler,
} from "./vendor-assignment.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("RESIDENT", "SOCIETY_ADMIN"),
  uploadComplaintImage.single("image"),
  (req, res, next) => {
    if (req.file && req.file.size > 5 * 1024 * 1024) {
      return res.status(422).json({
        success: false,
        message: "Image must be 5 MB or smaller",
      });
    }
    next();
  },
  createComplaintValidation,
  validate,
  createComplaintHandler,
);

router.get(
  "/",
  requireAuth,
  requireRole("RESIDENT", "SOCIETY_ADMIN"),
  getAllComplaintsHandler,
);

router.get(
  "/:id",
  requireAuth,
  requireRole("RESIDENT", "SOCIETY_ADMIN"),
  getComplaintByIdHandler,
);

router.post(
  "/:id/assign-vendor",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  assignVendorValidation,
  validate,
  assignVendorHandler,
);

router.get(
  "/:id/assignments",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  getComplaintAssignmentsHandler,
);

router.get(
  "/:id/history",
  requireAuth,
  requireRole("RESIDENT", "SOCIETY_ADMIN"),
  getComplaintHistoryHandler,
);

router.post(
  "/:id/reopen",
  requireAuth,
  requireRole("RESIDENT"),
  reopenComplaintHandler,
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("SOCIETY_ADMIN"),
  changeComplaintStatusHandler,
);

export default router;

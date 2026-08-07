import { body } from "express-validator";

// Valid assignment statuses a staff member may request.
// Mirrors the existing updateAssignmentStatus.validator.js used by vendors.
const VALID_STATUSES = ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const updateStaffAssignmentStatusValidation = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
  body("afterImageUrl")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("afterImageUrl must be a string"),
];

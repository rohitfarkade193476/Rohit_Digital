import { body } from "express-validator";

const VALID_STATUSES = ["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const updateAssignmentStatusValidation = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
];

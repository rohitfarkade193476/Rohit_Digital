import { body } from "express-validator";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];

export const createComplaintValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Complaint title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3-200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be at most 2000 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 100 })
    .withMessage("Category must be at most 100 characters"),

  body("priority")
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`),

  body("residentId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("residentId must not be empty"),
];

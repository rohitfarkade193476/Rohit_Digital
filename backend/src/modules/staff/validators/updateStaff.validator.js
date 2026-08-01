import { body } from "express-validator";

const VALID_STAFF_STATUSES = ["ACTIVE", "INACTIVE", "INVITED"];

export const updateStaffValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be 2-100 characters"),

  body("phone")
    .optional()
    .trim()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),

  body("role")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Role must be at most 50 characters"),

  body("department")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Department must be at most 50 characters"),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Joining date must be a valid date"),

  body("status")
    .optional()
    .isIn(VALID_STAFF_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STAFF_STATUSES.join(", ")}`),
];

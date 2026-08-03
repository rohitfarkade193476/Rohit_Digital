import { body } from "express-validator";

const VALID_STAFF_STATUSES = ["ACTIVE", "INACTIVE", "INVITED"];

export const createStaffValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be 2-100 characters"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .bail()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isLength({ max: 50 })
    .withMessage("Role must be at most 50 characters"),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
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

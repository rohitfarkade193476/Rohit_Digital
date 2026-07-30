import { body } from "express-validator";

const VALID_FLAT_TYPES = ["ONE_BHK", "TWO_BHK", "THREE_BHK", "FOUR_BHK", "PENTHOUSE"];
const VALID_FLAT_STATUSES = ["VACANT", "OCCUPIED", "BLOCKED"];

export const createFlatValidation = [
  body("flatNumber")
    .trim()
    .notEmpty()
    .withMessage("Flat number is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Flat number must be 1-50 characters"),

  body("wing")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Wing must be at most 20 characters"),

  body("floor")
    .notEmpty()
    .withMessage("Floor is required")
    .isInt({ min: 0 })
    .withMessage("Floor must be a non-negative integer"),

  body("type")
    .notEmpty()
    .withMessage("Flat type is required")
    .isIn(VALID_FLAT_TYPES)
    .withMessage(`Flat type must be one of: ${VALID_FLAT_TYPES.join(", ")}`),

  body("status")
    .optional()
    .isIn(VALID_FLAT_STATUSES)
    .withMessage(`Status must be one of: ${VALID_FLAT_STATUSES.join(", ")}`),
];

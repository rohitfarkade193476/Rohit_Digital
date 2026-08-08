import { query } from "express-validator";

export const userQueryValidation = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search must be 100 characters or fewer"),
  query("role")
    .optional()
    .isIn(["SUPER_ADMIN", "SOCIETY_ADMIN", "RESIDENT", "STAFF", "VENDOR"])
    .withMessage("Invalid role"),
  query("societyId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Society id cannot be empty"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

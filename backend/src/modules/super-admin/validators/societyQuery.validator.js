import { query } from "express-validator";

export const societyQueryValidation = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search must be 100 characters or fewer"),
  query("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .withMessage("Invalid society status"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

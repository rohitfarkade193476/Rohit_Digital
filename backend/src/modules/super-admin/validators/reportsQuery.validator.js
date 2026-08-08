import { query } from "express-validator";

export const reportsQueryValidation = [
  query("from")
    .optional()
    .isISO8601()
    .withMessage("from must be a valid ISO date"),
  query("to")
    .optional()
    .isISO8601()
    .withMessage("to must be a valid ISO date"),
];

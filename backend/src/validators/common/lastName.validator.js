import { body } from "express-validator";

export const lastNameValidation = body("lastName")
  .trim()
  .notEmpty()
  .withMessage("Last name is required")
  .isLength({ min: 2, max: 50 })
  .withMessage("Last name must be 2-50 characters");

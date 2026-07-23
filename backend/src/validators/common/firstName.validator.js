import { body } from "express-validator";

export const firstNameValidation = body("firstName")
  .trim()
  .notEmpty()
  .withMessage("First name is required")
  .isLength({ min: 2, max: 50 })
  .withMessage("First name must be 2-50 characters");

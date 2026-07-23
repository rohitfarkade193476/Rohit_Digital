import { body } from "express-validator";

export const emailValidation = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Must be a valid email")
  .normalizeEmail();

import { body } from "express-validator";

export const phoneValidation = body("phone")
  .trim()
  .notEmpty()
  .withMessage("Phone is required")
  .bail()
  .isMobilePhone("en-IN")
  .withMessage("Invalid phone number");

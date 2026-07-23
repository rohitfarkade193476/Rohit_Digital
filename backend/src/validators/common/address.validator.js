import { body } from "express-validator";

export const addressValidation = body("address")
  .trim()
  .notEmpty()
  .withMessage("Address is required");

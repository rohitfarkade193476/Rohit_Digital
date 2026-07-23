import { body } from "express-validator";

export const cityValidation = body("city")
  .trim()
  .notEmpty()
  .withMessage("City is required");

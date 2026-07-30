import { body } from "express-validator";

export const addressValidation = (field = "address") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("Address is required");

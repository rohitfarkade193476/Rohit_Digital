import { body } from "express-validator";

export const cityValidation = (field = "city") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("City is required");

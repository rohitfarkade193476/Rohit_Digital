import { body } from "express-validator";

export const stateValidation = (field = "state") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("State is required");

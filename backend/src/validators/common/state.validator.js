import { body } from "express-validator";

export const stateValidation = body("state")
  .trim()
  .notEmpty()
  .withMessage("State is required");

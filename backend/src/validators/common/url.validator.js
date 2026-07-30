import { body } from "express-validator";

export const urlValidation = (field) =>
  body(field)
    .trim()
    .isURL()
    .withMessage("Must be a valid URL");

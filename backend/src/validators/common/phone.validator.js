import { body } from "express-validator";

export const phoneValidation = (field = "phone") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .bail()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number");

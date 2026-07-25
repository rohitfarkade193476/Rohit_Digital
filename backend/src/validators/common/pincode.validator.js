import { body } from "express-validator";

export const pincodeValidation = (field = "pincode") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .bail()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Invalid pincode");

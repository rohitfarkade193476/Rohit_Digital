import { body } from "express-validator";

export const pincodeValidation = body("pincode")
  .trim()
  .notEmpty()
  .withMessage("Pincode is required")
  .bail()
  .matches(/^[1-9][0-9]{5}$/)
  .withMessage("Invalid pincode");

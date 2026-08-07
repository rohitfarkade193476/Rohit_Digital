import { body } from "express-validator";

export const requestConnectionValidation = [
  body("vendorId")
    .trim()
    .notEmpty()
    .withMessage("vendorId is required"),
];

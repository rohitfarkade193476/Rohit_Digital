import { body } from "express-validator";

export const assignVendorValidation = [
  body("vendorId")
    .trim()
    .notEmpty()
    .withMessage("vendorId is required"),
];

import { body } from "express-validator";

export const assignStaffValidation = [
  body("staffId")
    .trim()
    .notEmpty()
    .withMessage("staffId is required"),
];

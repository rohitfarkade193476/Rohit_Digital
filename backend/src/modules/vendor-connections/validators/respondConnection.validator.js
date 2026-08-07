import { body } from "express-validator";

export const respondConnectionValidation = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("status is required")
    .isIn(["ACCEPTED", "REJECTED"])
    .withMessage("status must be ACCEPTED or REJECTED"),
];

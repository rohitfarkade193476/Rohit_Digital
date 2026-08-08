import { body } from "express-validator";

export const updateUserStatusValidation = [
  body("isActive")
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

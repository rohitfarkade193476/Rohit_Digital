import { body } from "express-validator";

export const updateSocietyStatusValidation = [
  body("status")
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .withMessage("Invalid society status"),
];

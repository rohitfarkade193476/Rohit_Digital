import { body } from "express-validator";
import { firstNameValidation } from "../../../validators/common/firstName.validator.js";
import { lastNameValidation } from "../../../validators/common/lastName.validator.js";
import { emailValidation } from "../../../validators/common/email.validator.js";
import { phoneValidation } from "../../../validators/common/phone.validator.js";

export const registerVendorValidation = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company / business name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be 2-150 characters"),

  firstNameValidation("firstName"),
  lastNameValidation("lastName"),
  emailValidation("email"),
  phoneValidation("phone"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Service category is required")
    .isLength({ max: 100 })
    .withMessage("Category must be at most 100 characters"),

  body("contractType")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Contract type must be at most 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address must be at most 200 characters"),

  body("city")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("City must be at most 50 characters"),

  body("state")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("State must be at most 50 characters"),

  body("pincode")
    .optional()
    .trim()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Invalid pincode"),
];

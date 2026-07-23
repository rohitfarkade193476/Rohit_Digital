import { body } from "express-validator";
import { firstNameValidation } from "../common/firstName.validator.js";
import { lastNameValidation } from "../common/lastName.validator.js";
import { emailValidation } from "../common/email.validator.js";
import { phoneValidation } from "../common/phone.validator.js";
import { passwordValidation } from "../common/password.validator.js";
import { addressValidation } from "../common/address.validator.js";
import { cityValidation } from "../common/city.validator.js";
import { stateValidation } from "../common/state.validator.js";
import { pincodeValidation } from "../common/pincode.validator.js";

export const registerSocietyValidation = [
  firstNameValidation,
  lastNameValidation,
  emailValidation,
  phoneValidation,
  passwordValidation,

  body("societyName")
    .trim()
    .notEmpty()
    .withMessage("Society name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Society name must be 2-100 characters"),

  body("registrationNumber")
    .optional()
    .trim(),

  body("contactEmail")
    .trim()
    .notEmpty()
    .withMessage("Society contact email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),

  body("contactPhone")
    .trim()
    .notEmpty()
    .withMessage("Society contact phone is required")
    .bail()
    .isMobilePhone("en-IN")
    .withMessage("Invalid phone number"),

  addressValidation,
  cityValidation,
  stateValidation,
  pincodeValidation,

  body("logo")
    .optional()
    .trim()
    .isURL()
    .withMessage("Logo must be a valid URL"),
];

import { body } from "express-validator";
import { firstNameValidation } from "../../../validators/common/firstName.validator.js";
import { lastNameValidation } from "../../../validators/common/lastName.validator.js";
import { emailValidation } from "../../../validators/common/email.validator.js";
import { phoneValidation } from "../../../validators/common/phone.validator.js";
import { passwordValidation } from "../../../validators/common/password.validator.js";
import { addressValidation } from "../../../validators/common/address.validator.js";
import { cityValidation } from "../../../validators/common/city.validator.js";
import { stateValidation } from "../../../validators/common/state.validator.js";
import { pincodeValidation } from "../../../validators/common/pincode.validator.js";
import { urlValidation } from "../../../validators/common/url.validator.js";

export const registerSocietyValidation = [
  firstNameValidation(),
  lastNameValidation(),
  emailValidation(),
  phoneValidation(),
  passwordValidation(),

  body("societyName")
    .trim()
    .notEmpty()
    .withMessage("Society name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Society name must be 2-100 characters"),

  body("registrationNumber")
    .optional()
    .trim(),

  emailValidation("contactEmail"),
  phoneValidation("contactPhone"),

  addressValidation(),
  cityValidation(),
  stateValidation(),
  pincodeValidation(),

  urlValidation("logo").optional(),
];

import { firstNameValidation } from "../common/firstName.validator.js";
import { lastNameValidation } from "../common/lastName.validator.js";
import { emailValidation } from "../common/email.validator.js";
import { passwordValidation } from "../common/password.validator.js";

export const registerSuperAdminValidation = [
  firstNameValidation,
  lastNameValidation,
  emailValidation,
  passwordValidation,
];

import { addressValidation } from "../../../validators/common/address.validator.js";
import { emailValidation } from "../../../validators/common/email.validator.js";
import { phoneValidation } from "../../../validators/common/phone.validator.js";
import { urlValidation } from "../../../validators/common/url.validator.js";

export const updateSocietyProfileValidation = [
  addressValidation("address").optional(),
  emailValidation("contactEmail").optional(),
  phoneValidation("contactPhone").optional(),
  urlValidation("logo").optional(),
];

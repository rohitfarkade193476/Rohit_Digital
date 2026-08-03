import { z } from 'zod';
import {
  companyName,
  firstName,
  lastName,
  phone,
  category,
  contractType,
  description,
  address,
  city,
  state,
  pincode,
} from './vendorFieldsSchema.js';

/**
 * Vendor self-service profile update schema.
 * All fields optional — matches backend updateVendor.validator.js.
 */
export const vendorProfileSchema = z.object({
  companyName: companyName.optional(),

  firstName: firstName.optional(),

  lastName: lastName.optional(),

  phone: phone.optional(),

  category: category.optional(),

  contractType: contractType.optional(),

  description: description.optional(),

  address: address.optional(),

  city: city.optional(),

  state: state.optional(),

  pincode,

  isAvailable: z.boolean().optional(),
});

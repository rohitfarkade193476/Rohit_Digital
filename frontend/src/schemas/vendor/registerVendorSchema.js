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
 * Public vendor self-registration schema.
 * Mirrors the backend registerVendor.validator.js rules.
 * Registration-specific fields (email) and requiredness live here.
 */
export const registerVendorSchema = z.object({
  companyName,

  firstName,

  lastName,

  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Must be a valid email address.'),

  phone,

  category: category.min(1, 'Service category is required.'),

  contractType: contractType.optional(),

  description: description.optional(),

  address: address.optional(),

  city: city.optional(),

  state: state.optional(),

  pincode,
});

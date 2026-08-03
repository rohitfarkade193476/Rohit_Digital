import { z } from 'zod';
import { indianPhone } from '../common/phoneSchema.js';

/**
 * Shared Vendor field validators.
 * Mirrors backend registerVendor.validator.js / updateVendor.validator.js rules.
 * Reused by registerVendorSchema (required) and vendorProfileSchema (optional).
 */

export const companyName = z
  .string()
  .trim()
  .min(2, 'Company / business name must be 2-150 characters.')
  .max(150, 'Company / business name must be 2-150 characters.');

export const firstName = z
  .string()
  .trim()
  .min(2, 'First name must be 2-50 characters.')
  .max(50, 'First name must be 2-50 characters.');

export const lastName = z
  .string()
  .trim()
  .min(2, 'Last name must be 2-50 characters.')
  .max(50, 'Last name must be 2-50 characters.');

// Phone is required in registration; profile marks it optional. The min(1) sits
// before the regex so empty input reports "Phone number is required."
export const phone = indianPhone;

// Category requiredness is operation-specific (registration requires it,
// profile does not), so only the shared length rule lives here.
export const category = z
  .string()
  .trim()
  .max(100, 'Category must be at most 100 characters.');

export const contractType = z
  .string()
  .trim()
  .max(100, 'Contract type must be at most 100 characters.');

export const description = z
  .string()
  .trim()
  .max(1000, 'Description must be at most 1000 characters.');

export const address = z
  .string()
  .trim()
  .max(200, 'Address must be at most 200 characters.');

export const city = z
  .string()
  .trim()
  .max(50, 'City must be at most 50 characters.');

export const state = z
  .string()
  .trim()
  .max(50, 'State must be at most 50 characters.');

export const pincode = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, 'Invalid pincode.')
  .optional()
  .or(z.literal(''));

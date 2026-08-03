import { z } from 'zod';
import {
  indianPhone,
  INDIAN_PHONE_REGEX,
  INDIAN_PHONE_ERROR_MESSAGE,
} from '../common/phoneSchema.js';

export const registerSocietySchema = z
  .object({
    // ── Section 1: Society Information ──────────────────────────────
    societyName: z
      .string()
      .trim()
      .min(1, 'Society name is required.'),

    registrationNumber: z
      .string()
      .trim()
      .min(1, 'Registration number is required.'),

    totalFlats: z
      .string()
      .trim()
      .min(1, 'Total flats / units is required.')
      .refine(
        (val) => !isNaN(val) && Number(val) >= 1,
        'Enter a valid number of flats (minimum 1).'
      ),

    // ── Section 2: Address ──────────────────────────────────────────
    address: z
      .string()
      .trim()
      .min(1, 'Street address is required.'),

    city: z
      .string()
      .trim()
      .min(1, 'City is required.'),

    state: z
      .string()
      .trim()
      .min(1, 'State is required.'),

    pincode: z
      .string()
      .trim()
      .min(1, 'Pincode is required.')
      .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits.'),

    // ── Section 3: Society Contact ──────────────────────────────────
    contactEmail: z
      .string()
      .trim()
      .min(1, 'Contact email is required.')
      .email('Please enter a valid contact email address.'),

    contactPhone: z
      .string()
      .trim()
      .min(1, 'Contact phone is required.')
      .regex(INDIAN_PHONE_REGEX, INDIAN_PHONE_ERROR_MESSAGE),

    // logo is optional — handled outside Zod (file input)

    // ── Section 4: Society Admin ────────────────────────────────────
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required.'),

    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required.'),

    phone: indianPhone,

    email: z
      .string()
      .trim()
      .min(1, 'Admin email is required.')
      .email('Please enter a valid admin email address.'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),

    // ── Section 5: Terms ────────────────────────────────────────────
    agreedToTerms: z
      .boolean()
      .refine((val) => val === true, 'You must agree to the terms and conditions.'),
  })
  // Cross-field refinement: confirmPassword must match password
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

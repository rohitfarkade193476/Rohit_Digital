import { z } from 'zod';

/**
 * registerSocietySchema.js
 * Zod validation schema for the Register Society form.
 *
 * Sections:
 *  1. Society Information  — societyName, registrationNumber, totalFlats
 *  2. Address              — address, city, state, pincode
 *  3. Society Contact      — contactEmail, contactPhone, logo (optional)
 *  4. Society Admin        — firstName, lastName, phone, email, password, confirmPassword
 *  5. Terms                — agreedToTerms
 *
 * All string fields are trimmed before validation.
 * Phone validation targets Indian mobile numbers: 10 digits optionally
 * prefixed by +91 or 0 (e.g. 9876543210, +919876543210, 09876543210).
 */

const INDIAN_PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

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
      .regex(INDIAN_PHONE_REGEX, 'Enter a valid Indian mobile number (e.g. 9876543210).'),

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

    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required.')
      .regex(INDIAN_PHONE_REGEX, 'Enter a valid Indian mobile number (e.g. 9876543210).'),

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

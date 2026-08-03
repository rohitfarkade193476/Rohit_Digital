import { z } from 'zod';

// Indian mobile numbers — used by vendor and society registration.
export const INDIAN_PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;
export const INDIAN_PHONE_ERROR_MESSAGE = 'Enter a valid Indian mobile number (e.g. 9876543210).';

// General contact numbers — used by resident and staff management forms.
export const CONTACT_PHONE_REGEX = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]{7,12}$/;

/**
 * Required Indian mobile number.
 * The min(1) sits before the regex so empty input reports "… is required."
 */
export const indianPhone = z
  .string()
  .trim()
  .min(1, 'Phone number is required.')
  .regex(INDIAN_PHONE_REGEX, INDIAN_PHONE_ERROR_MESSAGE);

/**
 * Required general contact number (resident / staff forms).
 */
export const contactPhone = z
  .string()
  .trim()
  .min(1, 'Phone number is required.')
  .regex(CONTACT_PHONE_REGEX, 'Enter a valid phone number (min 10 digits).');

import { z } from 'zod';

// Contact email format used by the resident and staff management forms.
export const CONTACT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Required contact email (resident / staff forms).
 * Auth-related emails use Zod's built-in .email() with their own messages.
 */
export const contactEmail = z
  .string()
  .trim()
  .min(1, 'Email address is required.')
  .regex(CONTACT_EMAIL_REGEX, 'Enter a valid email address.');

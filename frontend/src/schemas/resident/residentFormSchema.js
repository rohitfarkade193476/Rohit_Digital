import { z } from 'zod';
import { contactPhone } from '../common/phoneSchema.js';
import { contactEmail } from '../common/emailSchema.js';

/**
 * Resident create/edit form schema (ResidentFormModal).
 * All fields are required in both add and edit modes.
 */
export const residentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Resident name is required.')
    .min(2, 'Name must be at least 2 characters.'),

  phone: contactPhone,

  email: contactEmail,

  flatNumber: z
    .string()
    .trim()
    .min(1, 'Flat number is required.'),

  moveInDate: z.string().min(1, 'Move-in date is required.'),
});

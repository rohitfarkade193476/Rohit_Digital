import { z } from 'zod';
import { contactPhone } from '../common/phoneSchema.js';
import { contactEmail } from '../common/emailSchema.js';

/**
 * Staff create/edit form schema (StaffFormModal).
 * All fields are required in both add and edit modes.
 */
export const staffFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .min(2, 'Full name must be at least 2 characters.'),

  phone: contactPhone,

  email: contactEmail,

  joiningDate: z.string().min(1, 'Joining date is required.'),
});

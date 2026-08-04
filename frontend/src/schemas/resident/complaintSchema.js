import { z } from 'zod';

const COMPLAINT_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Security',
  'Lift',
  'Parking',
  'Water Supply',
  'Other',
];

const COMPLAINT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'];

export const raiseComplaintSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Complaint title is required.')
    .min(3, 'Title must be at least 3 characters.')
    .max(200, 'Title must be at most 200 characters.'),

  description: z
    .string()
    .trim()
    .max(2000, 'Description must be at most 2000 characters.')
    .optional()
    .or(z.literal('')),

  category: z
    .string()
    .trim()
    .min(1, 'Please select a category.')
    .refine((val) => COMPLAINT_CATEGORIES.includes(val), {
      message: 'Invalid category.',
    }),

  priority: z
    .enum(COMPLAINT_PRIORITIES, {
      message: 'Please select a priority.',
    })
    .default('MEDIUM'),
});

export { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES };

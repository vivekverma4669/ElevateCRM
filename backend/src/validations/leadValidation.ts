import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  status: z
    .enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  source: z
    .enum(['website', 'referral', 'cold_outreach', 'social', 'event', 'other'])
    .optional(),
  tags: z.array(z.string()).optional(),
  value: z.number().min(0).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadQuerySchema = z.object({
  page: z.string().optional().transform(Number).pipe(z.number().min(1).default(1)),
  limit: z.string().optional().transform(Number).pipe(z.number().min(1).max(100).default(10)),
  status: z
    .enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  assignedTo: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;

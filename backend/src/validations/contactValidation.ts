import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  position: z.string().optional(),
  company: z.string().optional(),
  companyName: z.string().optional(),
  source: z.enum(['website', 'referral', 'cold_outreach', 'social', 'event', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  linkedLeads: z.array(z.string()).optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  revenue: z.number().min(0).optional(),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

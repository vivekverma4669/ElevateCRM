'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { Lead } from '@/types';
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  source: z.enum(['website', 'referral', 'cold_outreach', 'social', 'event', 'other']),
  value: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  lead?: Lead;
  onClose: () => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all';

const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide';

export function LeadForm({ lead, onClose }: Props) {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: lead
      ? {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          position: lead.position,
          status: lead.status,
          priority: lead.priority,
          source: lead.source,
          value: lead.value?.toString(),
          description: lead.description,
          location: lead.location,
        }
      : { status: 'new', priority: 'medium', source: 'other' },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      value: data.value ? parseFloat(data.value) : undefined,
    };

    if (lead) {
      await updateLead.mutateAsync({ id: lead._id, data: payload });
    } else {
      await createLead.mutateAsync(payload);
    }
    onClose();
  };

  const isLoading = createLead.isPending || updateLead.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            {lead ? 'Edit Lead' : 'Create New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...register('name')} placeholder="John Smith" className={inputClass} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input {...register('email')} type="email" placeholder="john@company.com" className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input {...register('phone')} placeholder="+1 (555) 000-0000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input {...register('company')} placeholder="Acme Corp" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Position</label>
              <input {...register('position')} placeholder="CEO, VP Sales..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Deal Value (₹)</label>
              <input {...register('value')} type="number" placeholder="50000" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select {...register('status')} className={inputClass}>
                {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map((s) => (
                  <option key={s} value={s} className="bg-card capitalize">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select {...register('priority')} className={inputClass}>
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <option key={p} value={p} className="bg-card capitalize">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <select {...register('source')} className={inputClass}>
                {['website', 'referral', 'cold_outreach', 'social', 'event', 'other'].map((s) => (
                  <option key={s} value={s} className="bg-card capitalize">{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input {...register('location')} placeholder="San Francisco, CA" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Notes / Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add context about this lead..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {lead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

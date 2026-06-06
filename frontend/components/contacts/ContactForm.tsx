'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { Contact } from '@/types';
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
  source: z.enum(['website', 'referral', 'cold_outreach', 'social', 'event', 'other']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all';
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide';

interface Props {
  contact?: Contact;
  onClose: () => void;
}

export function ContactForm({ contact, onClose }: Props) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: contact
      ? {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position,
          companyName: contact.companyName ?? (contact.company?.name ?? ''),
          source: contact.source,
          notes: contact.notes,
        }
      : { source: 'other' },
  });

  const onSubmit = async (data: FormData) => {
    if (contact) {
      await updateContact.mutateAsync({ id: contact._id, data });
    } else {
      await createContact.mutateAsync(data);
    }
    onClose();
  };

  const isLoading = createContact.isPending || updateContact.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {contact ? 'Edit Contact' : 'New Contact'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {contact ? 'Update contact details' : 'Add a new contact to your CRM'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input {...register('name')} className={inputClass} placeholder="Full name" />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input {...register('email')} type="email" className={inputClass} placeholder="email@example.com" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input {...register('phone')} className={inputClass} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className={labelClass}>Position</label>
                <input {...register('position')} className={inputClass} placeholder="Job title" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company</label>
                <input {...register('companyName')} className={inputClass} placeholder="Company name" />
              </div>
              <div>
                <label className={labelClass}>Source</label>
                <select {...register('source')} className={inputClass}>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="social">Social</option>
                  <option value="event">Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <textarea {...register('notes')} className={inputClass} rows={3} placeholder="Any notes about this contact..." />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 disabled:opacity-60 transition-all"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {contact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

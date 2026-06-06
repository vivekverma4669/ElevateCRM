'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { Company } from '@/types';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useContacts';

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  revenue: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all';
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide';

interface Props {
  company?: Company;
  onClose: () => void;
}

export function CompanyForm({ company, onClose }: Props) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: company
      ? {
          name: company.name,
          website: company.website,
          industry: company.industry,
          size: company.size,
          location: company.location,
          phone: company.phone,
          email: company.email,
          revenue: company.revenue?.toString(),
          description: company.description,
        }
      : {},
  });

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, revenue: data.revenue ? parseFloat(data.revenue) : undefined };
    if (company) {
      await updateCompany.mutateAsync({ id: company._id, data: payload });
    } else {
      await createCompany.mutateAsync(payload);
    }
    onClose();
  };

  const isLoading = createCompany.isPending || updateCompany.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {company ? 'Edit Company' : 'New Company'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {company ? 'Update company details' : 'Add a new company to your CRM'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className={labelClass}>Company Name *</label>
              <input {...register('name')} className={inputClass} placeholder="Acme Corp" />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Website</label>
                <input {...register('website')} className={inputClass} placeholder="https://acme.com" />
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <input {...register('industry')} className={inputClass} placeholder="SaaS, Finance..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Size</label>
                <select {...register('size')} className={inputClass}>
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-10)</option>
                  <option value="small">Small (11-50)</option>
                  <option value="medium">Medium (51-200)</option>
                  <option value="large">Large (201-1000)</option>
                  <option value="enterprise">Enterprise (1000+)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Revenue</label>
                <input {...register('revenue')} type="number" className={inputClass} placeholder="Annual revenue" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input {...register('phone')} className={inputClass} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input {...register('email')} type="email" className={inputClass} placeholder="info@acme.com" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input {...register('location')} className={inputClass} placeholder="City, Country" />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea {...register('description')} className={inputClass} rows={3} placeholder="Brief description..." />
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
              {company ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

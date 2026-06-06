'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, Copy, CheckCheck } from 'lucide-react';
import { useLogEmail } from '@/hooks/useEmails';

const schema = z.object({
  to: z.string().email('Invalid email'),
  toName: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  lead: z.string().optional(),
  contact: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all';
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide';

interface Props {
  onClose: () => void;
  defaultTo?: string;
  defaultToName?: string;
  defaultSubject?: string;
  defaultBody?: string;
  leadId?: string;
  contactId?: string;
}

export function SendEmailModal({ onClose, defaultTo, defaultToName, defaultSubject, defaultBody, leadId, contactId }: Props) {
  const logEmail = useLogEmail();
  const [copied, setCopied] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      to: defaultTo ?? '',
      toName: defaultToName ?? '',
      subject: defaultSubject ?? '',
      body: defaultBody ?? '',
      lead: leadId ?? '',
      contact: contactId ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const result = await logEmail.mutateAsync({
      ...data,
      lead: data.lead || undefined,
      contact: data.contact || undefined,
    });

    const tid = (result.data as { data: { trackingId: string } }).data?.trackingId;
    if (tid) setTrackingId(tid);
  };

  const buildTrackedBody = () => {
    if (!trackingId) return getValues('body');
    const pixel = `\n\n<img src="${API_URL}/emails/track/${trackingId}/open" width="1" height="1" style="display:none" />`;
    return getValues('body') + pixel;
  };

  const copyTrackedEmail = () => {
    navigator.clipboard.writeText(buildTrackedBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Log Email</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Record a sent email with open & click tracking</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {trackingId ? (
          <div className="px-6 py-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCheck className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">Email logged successfully</p>
              <p className="text-sm text-muted-foreground mt-1">
                Copy the tracked body below and paste it into your email client.
              </p>
            </div>
            <div className="w-full rounded-lg border border-border bg-input p-3 max-h-40 overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">{buildTrackedBody()}</pre>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyTrackedEmail}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all"
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy tracked email'}
              </button>
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>To (email) *</label>
                  <input {...register('to')} type="email" className={inputClass} placeholder="recipient@example.com" />
                  {errors.to && <p className="text-xs text-red-400 mt-1">{errors.to.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Recipient name</label>
                  <input {...register('toName')} className={inputClass} placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Subject *</label>
                <input {...register('subject')} className={inputClass} placeholder="Email subject" />
                {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Body *</label>
                <textarea {...register('body')} className={inputClass} rows={8} placeholder="Email body..." />
                {errors.body && <p className="text-xs text-red-400 mt-1">{errors.body.message}</p>}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-muted-foreground">Tracking pixel & click tracking auto-generated</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logEmail.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 disabled:opacity-60 transition-all"
                >
                  {logEmail.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Log & Get Tracking
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

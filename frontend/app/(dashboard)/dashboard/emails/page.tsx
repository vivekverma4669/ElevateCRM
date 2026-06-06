'use client';
import { useState } from 'react';
import { Mail, MailOpen, MousePointerClick, TrendingUp, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { EmailLogTable } from '@/components/emails/EmailLogTable';
import { SendEmailModal } from '@/components/emails/SendEmailModal';
import { useEmailLogs, useEmailStats } from '@/hooks/useEmails';
import { EmailLog } from '@/types';
import { cn } from '@/lib/utils';

export default function EmailsPage() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEmailLogs({ page, limit: 20 });
  const { data: stats } = useEmailStats();

  const emails = (data?.data as { emails: EmailLog[] })?.emails ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col">
      <Header
        title="Email Tracking"
        subtitle={`${meta?.total ?? 0} emails sent and tracked`}
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Total Sent', value: stats.total, icon: Mail, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
              { label: 'Opened', value: stats.opened, icon: MailOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'Clicked', value: stats.clicked, icon: MousePointerClick, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
              { label: 'Open Rate', value: `${stats.openRate}%`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Click Rate', value: `${stats.clickRate}%`, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('rounded-xl border p-4', bg)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                  <Icon className={cn('w-4 h-4', color)} />
                </div>
                <p className={cn('text-2xl font-bold', color)}>{value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan"
          >
            <Send className="w-4 h-4" />
            Log Email
          </button>
        </div>

        {/* Email log table */}
        <EmailLogTable emails={emails} isLoading={isLoading} />

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showSendModal && <SendEmailModal onClose={() => setShowSendModal(false)} />}
    </div>
  );
}

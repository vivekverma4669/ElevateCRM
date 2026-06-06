'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, MousePointerClick, Trash2, Eye } from 'lucide-react';
import { EmailLog } from '@/types';
import { formatDate, formatRelativeTime, cn } from '@/lib/utils';
import { useDeleteEmailLog } from '@/hooks/useEmails';
import { useState } from 'react';

interface Props {
  emails: EmailLog[];
  isLoading?: boolean;
}

const STATUS_STYLES: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  sent: { label: 'Sent', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', Icon: Mail },
  opened: { label: 'Opened', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', Icon: MailOpen },
  clicked: { label: 'Clicked', color: 'bg-green-500/10 text-green-400 border-green-500/20', Icon: MousePointerClick },
};

function EmailPreviewModal({ email, onClose }: { email: EmailLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">{email.subject}</h3>
            <p className="text-xs text-muted-foreground mt-1">To: {email.toName ? `${email.toName} <${email.to}>` : email.to}</p>
            <p className="text-xs text-muted-foreground">{formatDate(email.createdAt, 'MMM d, yyyy HH:mm')}</p>
          </div>
          <button onClick={onClose} className="ml-4 p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground flex-shrink-0">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{email.body}</pre>
        </div>
        <div className="px-6 py-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
          <span>Opens: <span className="text-foreground font-medium">{email.openCount}</span></span>
          <span>Clicks: <span className="text-foreground font-medium">{email.clickCount}</span></span>
          {email.openedAt && <span>First opened: {formatRelativeTime(email.openedAt)}</span>}
          {email.clickedAt && <span>First clicked: {formatRelativeTime(email.clickedAt)}</span>}
        </div>
      </div>
    </div>
  );
}

export function EmailLogTable({ emails, isLoading }: Props) {
  const deleteEmail = useDeleteEmailLog();
  const [preview, setPreview] = useState<EmailLog | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
              <div className="h-6 bg-muted rounded-full w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Mail className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No emails logged yet. Send your first tracked email!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30">
          {['Email', 'To', 'Status', 'Opens', 'Sent', ''].map((h) => (
            <p key={h} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>

        <div className="divide-y divide-border">
          <AnimatePresence>
            {emails.map((email, i) => {
              const statusInfo = STATUS_STYLES[email.status];
              const StatusIcon = statusInfo.Icon;
              return (
                <motion.div
                  key={email._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-accent/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 border border-indigo-400/20 flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{email.subject}</p>
                      {email.lead && (
                        <p className="text-xs text-muted-foreground truncate">
                          Lead: {email.lead.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground whitespace-nowrap max-w-[140px] truncate">
                    {email.toName ? email.toName : email.to}
                  </div>

                  <span className={cn('status-badge border text-xs', statusInfo.color)}>
                    {statusInfo.label}
                  </span>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                    <Eye className="w-3 h-3" />
                    <span>{email.openCount}</span>
                    {email.clickCount > 0 && (
                      <>
                        <MousePointerClick className="w-3 h-3 ml-1" />
                        <span>{email.clickCount}</span>
                      </>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(email.createdAt)}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreview(email)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="View email"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this email log?')) deleteEmail.mutate(email._id);
                      }}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {preview && <EmailPreviewModal email={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

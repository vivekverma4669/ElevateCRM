'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { Lead } from '@/types';
import { formatCurrency, formatDate, cn, STATUS_COLORS, PRIORITY_COLORS, STATUS_LABELS } from '@/lib/utils';
import { useDeleteLead } from '@/hooks/useLeads';

interface Props {
  leads: Lead[];
  isLoading?: boolean;
  onEdit?: (lead: Lead) => void;
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-slate-400',
    medium: 'bg-yellow-400',
    high: 'bg-orange-400',
    urgent: 'bg-red-400 animate-pulse',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[priority] ?? 'bg-slate-400'}`} />;
}

export function LeadTable({ leads, isLoading, onEdit }: Props) {
  const deleteLead = useDeleteLead();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="h-6 bg-muted rounded-full w-20" />
              <div className="h-6 bg-muted rounded-full w-16" />
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No leads found. Create your first lead!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30">
        {['Lead', 'Status', 'Priority', 'Value', 'Created', ''].map((h) => (
          <p key={h} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</p>
        ))}
      </div>

      <div className="divide-y divide-border">
        <AnimatePresence>
          {leads.map((lead, i) => (
            <motion.div
              key={lead._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-accent/30 transition-colors group"
            >
              {/* Lead info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-400/20 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  {lead.company && (
                    <p className="text-xs text-muted-foreground/70 truncate">{lead.company}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <span className={cn('status-badge border text-xs', STATUS_COLORS[lead.status])}>
                {STATUS_LABELS[lead.status]}
              </span>

              {/* Priority */}
              <div className="flex items-center gap-1.5">
                <PriorityDot priority={lead.priority} />
                <span className={cn('status-badge border text-xs capitalize', PRIORITY_COLORS[lead.priority])}>
                  {lead.priority}
                </span>
              </div>

              {/* Value */}
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {lead.value ? formatCurrency(lead.value) : '—'}
              </span>

              {/* Date */}
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(lead.createdAt)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(lead)}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit lead"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Archive lead "${lead.name}"?`)) {
                      deleteLead.mutate(lead._id);
                    }
                  }}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Archive lead"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

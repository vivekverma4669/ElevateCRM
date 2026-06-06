'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Globe, Building2 } from 'lucide-react';
import { Company } from '@/types';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { useDeleteCompany } from '@/hooks/useContacts';

interface Props {
  companies: Company[];
  isLoading?: boolean;
  onEdit?: (company: Company) => void;
}

const SIZE_COLORS: Record<string, string> = {
  startup: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  small: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  large: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  enterprise: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export function CompanyTable({ companies, isLoading, onEdit }: Props) {
  const deleteCompany = useDeleteCompany();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="h-6 bg-muted rounded-full w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No companies found. Add your first company!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30">
        {['Company', 'Industry', 'Size', 'Revenue', 'Added', ''].map((h) => (
          <p key={h} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</p>
        ))}
      </div>

      <div className="divide-y divide-border">
        <AnimatePresence>
          {companies.map((company, i) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-accent/30 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{company.name}</p>
                  {company.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">{company.website}</p>
                    </div>
                  )}
                  {company.location && (
                    <p className="text-xs text-muted-foreground/70 truncate">{company.location}</p>
                  )}
                </div>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {company.industry ?? '—'}
              </span>

              {company.size ? (
                <span className={cn('status-badge border text-xs capitalize', SIZE_COLORS[company.size])}>
                  {company.size}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}

              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {company.revenue ? formatCurrency(company.revenue) : '—'}
              </span>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(company.createdAt)}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(company)}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete company "${company.name}"?`)) {
                      deleteCompany.mutate(company._id);
                    }
                  }}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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

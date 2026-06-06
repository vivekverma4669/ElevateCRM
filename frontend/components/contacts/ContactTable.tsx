'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Building2, Mail, Phone } from 'lucide-react';
import { Contact } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { useDeleteContact } from '@/hooks/useContacts';

interface Props {
  contacts: Contact[];
  isLoading?: boolean;
  onEdit?: (contact: Contact) => void;
}

const SOURCE_COLORS: Record<string, string> = {
  website: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  referral: 'bg-green-500/10 text-green-400 border-green-500/20',
  cold_outreach: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  social: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  event: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function ContactTable({ contacts, isLoading, onEdit }: Props) {
  const deleteContact = useDeleteContact();

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
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No contacts found. Add your first contact!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30">
        {['Contact', 'Company', 'Source', 'Added', ''].map((h) => (
          <p key={h} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</p>
        ))}
      </div>

      <div className="divide-y divide-border">
        <AnimatePresence>
          {contacts.map((contact, i) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-accent/30 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400/20 to-violet-600/20 border border-violet-400/20 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {contact.company?.name ?? contact.companyName ?? '—'}
                </span>
              </div>

              <span className={cn('status-badge border text-xs capitalize', SOURCE_COLORS[contact.source])}>
                {contact.source.replace('_', ' ')}
              </span>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(contact.createdAt)}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(contact)}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete contact "${contact.name}"?`)) {
                      deleteContact.mutate(contact._id);
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

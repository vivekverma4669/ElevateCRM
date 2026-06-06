'use client';
import { useState } from 'react';
import { Plus, Users, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { ContactTable } from '@/components/contacts/ContactTable';
import { ContactForm } from '@/components/contacts/ContactForm';
import { CompanyTable } from '@/components/contacts/CompanyTable';
import { CompanyForm } from '@/components/contacts/CompanyForm';
import { useContacts, useCompanies } from '@/hooks/useContacts';
import { Contact, Company } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'contacts' | 'companies';

export default function ContactsPage() {
  const [tab, setTab] = useState<Tab>('contacts');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>();
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const contactsQuery = useContacts({ page, limit: 10, search: search || undefined });
  const companiesQuery = useCompanies({ page, limit: 10, search: search || undefined });

  const contactsData = contactsQuery.data?.data as { contacts: Contact[] } | undefined;
  const contactsMeta = contactsQuery.data?.meta;
  const companiesData = companiesQuery.data?.data as { companies: Company[] } | undefined;
  const companiesMeta = companiesQuery.data?.meta;

  const totalCount = tab === 'contacts' ? contactsMeta?.total ?? 0 : companiesMeta?.total ?? 0;
  const totalPages = tab === 'contacts' ? contactsMeta?.totalPages ?? 1 : companiesMeta?.totalPages ?? 1;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Contacts & Companies"
        subtitle={`${totalCount} ${tab} in your CRM`}
      />

      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg w-fit border border-border">
          <button
            onClick={() => { setTab('contacts'); setPage(1); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              tab === 'contacts'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="w-4 h-4" />
            Contacts
          </button>
          <button
            onClick={() => { setTab('companies'); setPage(1); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              tab === 'companies'
                ? 'bg-card text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Building2 className="w-4 h-4" />
            Companies
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder={`Search ${tab}...`}
            className="px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all w-64"
          />

          {tab === 'contacts' ? (
            <button
              onClick={() => { setEditingContact(undefined); setShowContactForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan"
            >
              <Plus className="w-4 h-4" />
              New Contact
            </button>
          ) : (
            <button
              onClick={() => { setEditingCompany(undefined); setShowCompanyForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan"
            >
              <Plus className="w-4 h-4" />
              New Company
            </button>
          )}
        </div>

        {/* Tables */}
        <motion.div key={tab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {tab === 'contacts' ? (
            <ContactTable
              contacts={contactsData?.contacts ?? []}
              isLoading={contactsQuery.isLoading}
              onEdit={(c) => { setEditingContact(c); setShowContactForm(true); }}
            />
          ) : (
            <CompanyTable
              companies={companiesData?.companies ?? []}
              isLoading={companiesQuery.isLoading}
              onEdit={(c) => { setEditingCompany(c); setShowCompanyForm(true); }}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    p === page ? 'bg-cyan-400 text-black font-semibold' : 'border border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showContactForm && (
        <ContactForm
          contact={editingContact}
          onClose={() => { setShowContactForm(false); setEditingContact(undefined); }}
        />
      )}
      {showCompanyForm && (
        <CompanyForm
          company={editingCompany}
          onClose={() => { setShowCompanyForm(false); setEditingCompany(undefined); }}
        />
      )}
    </div>
  );
}

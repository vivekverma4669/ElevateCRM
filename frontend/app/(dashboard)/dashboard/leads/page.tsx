'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadForm } from '@/components/leads/LeadForm';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/types';

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, limit: 10 };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.priority) params.priority = filters.priority;
  params.sortBy = filters.sortBy;
  params.sortOrder = filters.sortOrder;

  const { data, isLoading } = useLeads(params);

  useEffect(() => {
    if (searchParams.get('action') === 'new') setShowForm(true);
  }, [searchParams]);

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const leads = (data?.data as { leads: Lead[] })?.leads ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col">
      <Header title="Leads" subtitle={`${meta?.total ?? 0} total leads in your pipeline`} />

      <div className="p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <LeadFilters filters={filters} onChange={handleFilterChange} />

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => { setEditingLead(undefined); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan"
            >
              <Plus className="w-4 h-4" />
              New Lead
            </button>
          </div>
        </div>

        {/* Table */}
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          onEdit={(lead) => { setEditingLead(lead); setShowForm(true); }}
        />

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    p === page
                      ? 'bg-cyan-400 text-black font-semibold'
                      : 'border border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {p}
                </button>
              ))}
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

      {/* Lead form modal */}
      {showForm && (
        <LeadForm
          lead={editingLead}
          onClose={() => { setShowForm(false); setEditingLead(undefined); }}
        />
      )}
    </div>
  );
}

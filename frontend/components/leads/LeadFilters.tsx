'use client';
import { Search, Filter, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

interface Filters {
  search: string;
  status: string;
  priority: string;
  sortBy: string;
  sortOrder: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Partial<Filters>) => void;
}

const STATUS_OPTIONS = ['', 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const PRIORITY_OPTIONS = ['', 'low', 'medium', 'high', 'urgent'];

export function LeadFilters({ filters, onChange }: Props) {
  const [searchValue, setSearchValue] = useState(filters.search);

  const debouncedSearch = useCallback(
    debounce((value: unknown) => onChange({ search: value as string }), 400),
    []
  );

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            debouncedSearch(e.target.value);
          }}
          placeholder="Search by name, email, company..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all"
        />
        {searchValue && (
          <button
            onClick={() => { setSearchValue(''); onChange({ search: '' }); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value })}
        className="px-3 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all capitalize"
      >
        <option value="" className="bg-card">All Statuses</option>
        {STATUS_OPTIONS.filter(Boolean).map((s) => (
          <option key={s} value={s} className="bg-card capitalize">{s}</option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority}
        onChange={(e) => onChange({ priority: e.target.value })}
        className="px-3 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
      >
        <option value="" className="bg-card">All Priorities</option>
        {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
          <option key={p} value={p} className="bg-card capitalize">{p}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={`${filters.sortBy}:${filters.sortOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(':');
          onChange({ sortBy, sortOrder });
        }}
        className="px-3 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
      >
        <option value="createdAt:desc" className="bg-card">Newest First</option>
        <option value="createdAt:asc" className="bg-card">Oldest First</option>
        <option value="value:desc" className="bg-card">Highest Value</option>
        <option value="name:asc" className="bg-card">Name A-Z</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => {
            setSearchValue('');
            onChange({ search: '', status: '', priority: '', sortBy: 'createdAt', sortOrder: 'desc' });
          }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}

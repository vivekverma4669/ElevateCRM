'use client';
import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { Lead, KanbanData } from '@/types';
import { useUpdateLeadStatus } from '@/hooks/useLeads';
import { STATUS_LABELS } from '@/lib/utils';

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'border-blue-400/30' },
  { id: 'contacted', label: 'Contacted', color: 'border-purple-400/30' },
  { id: 'qualified', label: 'Qualified', color: 'border-yellow-400/30' },
  { id: 'proposal', label: 'Proposal', color: 'border-orange-400/30' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-pink-400/30' },
  { id: 'won', label: 'Won', color: 'border-green-400/30' },
  { id: 'lost', label: 'Lost', color: 'border-red-400/30' },
];

interface Props {
  data: KanbanData;
}

export function KanbanBoard({ data: initialData }: Props) {
  const [columns, setColumns] = useState<KanbanData>(initialData);
  const updateStatus = useUpdateLeadStatus();

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = Array.from(columns[source.droppableId] ?? []);
    const destCol =
      source.droppableId === destination.droppableId
        ? sourceCol
        : Array.from(columns[destination.droppableId] ?? []);

    const [moved] = sourceCol.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, moved);
      setColumns((prev) => ({ ...prev, [source.droppableId]: sourceCol }));
    } else {
      destCol.splice(destination.index, 0, { ...moved, status: destination.droppableId as Lead['status'] });
      setColumns((prev) => ({
        ...prev,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      }));
      updateStatus.mutate({ id: draggableId, status: destination.droppableId });
    }
  };

  const totalValue = Object.values(columns)
    .flat()
    .reduce((sum, lead) => sum + (lead.value ?? 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Pipeline Value', value: `₹${(totalValue / 1000).toFixed(0)}k` },
          {
            label: 'Active Leads',
            value: Object.values(columns).flat().filter(l => !['won', 'lost'].includes(l.status)).length,
          },
          {
            label: 'Won Rate',
            value: (() => {
              const total = Object.values(columns).flat().length;
              const won = columns['won']?.length ?? 0;
              return total > 0 ? `${Math.round((won / total) * 100)}%` : '0%';
            })(),
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-3 text-center">
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              colorClass={col.color}
              leads={columns[col.id] ?? []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

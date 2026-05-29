'use client';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { useKanbanLeads } from '@/hooks/useLeads';
import { KanbanData } from '@/types';
import { Kanban } from 'lucide-react';

export default function PipelinePage() {
  const { data: kanban, isLoading, error } = useKanbanLeads();

  return (
    <div className="flex flex-col h-screen">
      <Header
        title="Pipeline"
        subtitle="Drag and drop leads between stages"
      />

      <div className="flex-1 p-6 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Kanban className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-pulse" />
              <p className="text-muted-foreground text-sm">Loading pipeline...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive text-sm">Failed to load pipeline data</p>
          </div>
        ) : (
          <KanbanBoard data={kanban as KanbanData ?? {}} />
        )}
      </div>
    </div>
  );
}

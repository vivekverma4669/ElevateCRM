'use client';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Lead } from '@/types';
import { formatCurrency, cn, PRIORITY_COLORS } from '@/lib/utils';

interface Props {
  id: string;
  label: string;
  colorClass: string;
  leads: Lead[];
}

function KanbanCard({ lead, index }: { lead: Lead; index: number }) {
  return (
    <Draggable draggableId={lead._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'bg-card border border-border rounded-xl p-3.5 cursor-grab select-none transition-all',
            snapshot.isDragging
              ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/10 rotate-1 scale-105'
              : 'hover:border-border/80 hover:shadow-md'
          )}
        >
          {/* Priority indicator */}
          <div className="flex items-start justify-between mb-2">
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize', PRIORITY_COLORS[lead.priority])}>
              {lead.priority}
            </span>
            {lead.aiSentiment && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full border font-medium',
                lead.aiSentiment === 'positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                lead.aiSentiment === 'negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              )}>
                AI: {lead.aiSentiment}
              </span>
            )}
          </div>

          {/* Lead name & company */}
          <div className="mb-2">
            <p className="text-sm font-semibold text-foreground leading-snug">{lead.name}</p>
            {lead.company && (
              <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
            )}
          </div>

          {/* Value */}
          {lead.value && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-400 font-semibold">{formatCurrency(lead.value)}</span>
            </div>
          )}

          {/* Assigned avatar */}
          {lead.assignedTo && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-[9px] font-bold text-black">
                {(lead.assignedTo as { name: string }).name?.charAt(0) ?? 'U'}
              </div>
              <span className="text-[10px] text-muted-foreground truncate">
                {(lead.assignedTo as { name: string }).name}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export function KanbanColumn({ id, label, colorClass, leads }: Props) {
  const columnValue = leads.reduce((sum, l) => sum + (l.value ?? 0), 0);

  return (
    <div className={cn(
      'flex-shrink-0 w-[240px] flex flex-col rounded-xl border-2 bg-card/50',
      colorClass
    )}>
      {/* Column header */}
      <div className="px-3 py-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-medium">
            {leads.length}
          </span>
        </div>
        {columnValue > 0 && (
          <p className="text-xs text-cyan-400 mt-0.5">{formatCurrency(columnValue)}</p>
        )}
      </div>

      {/* Drop zone */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2 space-y-2 min-h-[200px] transition-colors rounded-b-xl',
              snapshot.isDraggingOver ? 'bg-cyan-400/5' : ''
            )}
          >
            {leads.map((lead, index) => (
              <KanbanCard key={lead._id} lead={lead} index={index} />
            ))}
            {provided.placeholder}

            {leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-20 border-2 border-dashed border-border/30 rounded-lg">
                <p className="text-xs text-muted-foreground/50">Drop here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

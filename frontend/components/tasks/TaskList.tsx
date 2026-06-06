'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Task } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';

interface Props {
  tasks: Task[];
  isLoading?: boolean;
  onEdit?: (task: Task) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  todo: 'text-slate-400',
  in_progress: 'text-cyan-400',
  done: 'text-green-400',
  cancelled: 'text-red-400',
};

function isOverdue(task: Task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && !['done', 'cancelled'].includes(task.status);
}

export function TaskList({ tasks, isLoading, onEdit }: Props) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const toggleDone = (task: Task) => {
    updateTask.mutate({
      id: task._id,
      data: { status: task.status === 'done' ? 'todo' : 'done' },
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
            <div className="h-6 bg-muted rounded-full w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="divide-y divide-border">
        <AnimatePresence>
          {tasks.map((task, i) => {
            const overdue = isOverdue(task);
            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 px-5 py-4 hover:bg-accent/30 transition-colors group"
              >
                <button
                  onClick={() => toggleDone(task)}
                  className="mt-0.5 flex-shrink-0 transition-colors"
                  title={task.status === 'done' ? 'Mark todo' : 'Mark done'}
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : task.status === 'in_progress' ? (
                    <Clock className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Circle className={cn('w-5 h-5', overdue ? 'text-red-400' : 'text-muted-foreground')} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground')}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {task.dueDate && (
                      <div className={cn('flex items-center gap-1 text-xs', overdue ? 'text-red-400' : 'text-muted-foreground')}>
                        {overdue && <AlertCircle className="w-3 h-3" />}
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    {task.assignedTo && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-cyan-400/20 flex items-center justify-center text-[9px] font-bold text-cyan-400">
                          {task.assignedTo.name.charAt(0)}
                        </div>
                        <span className="text-xs text-muted-foreground">{task.assignedTo.name}</span>
                      </div>
                    )}
                    {task.relatedLead && (
                      <span className="text-xs text-cyan-400/70 truncate max-w-[120px]">
                        {task.relatedLead.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('status-badge border text-xs capitalize', PRIORITY_COLORS[task.priority])}>
                    {task.priority}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete task "${task.title}"?`)) deleteTask.mutate(task._id);
                      }}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

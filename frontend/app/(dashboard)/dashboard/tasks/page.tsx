'use client';
import { useState } from 'react';
import { Plus, CheckCircle2, Clock, AlertCircle, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useTasks, useTaskStats } from '@/hooks/useTasks';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'todo' | 'in_progress' | 'done' | 'overdue';

const FILTER_OPTIONS: { value: Filter; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'All Tasks', icon: LayoutList, color: 'text-muted-foreground' },
  { value: 'todo', label: 'To Do', icon: Clock, color: 'text-slate-400' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-cyan-400' },
  { value: 'done', label: 'Done', icon: CheckCircle2, color: 'text-green-400' },
  { value: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'text-red-400' },
];

export default function TasksPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, limit: 20 };
  if (filter === 'overdue') params.overdue = 'true';
  else if (filter !== 'all') params.status = filter;

  const { data, isLoading } = useTasks(params);
  const { data: stats } = useTaskStats();

  const tasks = (data?.data as { tasks: Task[] })?.tasks ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col">
      <Header title="Tasks & Reminders" subtitle="Track your to-dos, follow-ups, and deadlines" />

      <div className="p-6 space-y-5">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'To Do', value: stats.todo, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
              { label: 'In Progress', value: stats.inProgress, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { label: 'Completed', value: stats.done, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
              { label: 'Overdue', value: stats.overdue, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            ].map(({ label, value, color, bg }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('rounded-xl border p-4', bg)}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                <p className={cn('text-2xl font-bold', color)}>{value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border flex-wrap">
            {FILTER_OPTIONS.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => { setFilter(value); setPage(1); }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  filter === value
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', filter === value ? color : '')} />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setEditingTask(undefined); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Task list */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
        />

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
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

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        />
      )}
    </div>
  );
}

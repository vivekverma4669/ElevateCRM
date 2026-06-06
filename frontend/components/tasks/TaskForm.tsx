'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { Task } from '@/types';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all';
const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide';

interface Props {
  task?: Task;
  onClose: () => void;
}

export function TaskForm({ task, onClose }: Props) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
          priority: task.priority,
          status: task.status,
        }
      : { priority: 'medium', status: 'todo' },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    };

    if (task) {
      await updateTask.mutateAsync({ id: task._id, data: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    onClose();
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {task ? 'Update task details' : 'Create a new task or reminder'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input {...register('title')} className={inputClass} placeholder="Task title" />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea {...register('description')} className={inputClass} rows={2} placeholder="Optional details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Due Date</label>
                <input {...register('dueDate')} type="datetime-local" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select {...register('priority')} className={inputClass}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {task && (
              <div>
                <label className={labelClass}>Status</label>
                <select {...register('status')} className={inputClass}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 disabled:opacity-60 transition-all"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { createTaskSchema, updateTaskSchema } from '../validations/taskValidation';

export const taskController = {
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status, priority, assignedTo, overdue } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: Record<string, unknown> = {
        $or: [{ createdBy: req.user!.userId }, { assignedTo: req.user!.userId }],
      };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignedTo) filter.assignedTo = assignedTo;
      if (overdue === 'true') {
        filter.dueDate = { $lt: new Date() };
        filter.status = { $nin: ['done', 'cancelled'] };
      }

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .populate('assignedTo', 'name avatar')
          .populate('createdBy', 'name')
          .populate('relatedLead', 'name company status')
          .populate('relatedContact', 'name email')
          .sort({ dueDate: 1, priority: -1, createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Task.countDocuments(filter),
      ]);

      sendSuccess(res, { tasks }, 'Tasks retrieved', 200, {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      next(error);
    }
  },

  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await Task.findById(req.params.id)
        .populate('assignedTo', 'name avatar')
        .populate('createdBy', 'name')
        .populate('relatedLead', 'name company status')
        .populate('relatedContact', 'name email')
        .lean();

      if (!task) throw new AppError('Task not found', 404);
      sendSuccess(res, { task });
    } catch (error) {
      next(error);
    }
  },

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await Task.create({ ...data, createdBy: req.user!.userId });
      const populated = await task.populate([
        { path: 'assignedTo', select: 'name avatar' },
        { path: 'relatedLead', select: 'name company' },
        { path: 'relatedContact', select: 'name email' },
      ]);
      sendCreated(res, { task: populated }, 'Task created');
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateTaskSchema.parse(req.body);

      // Set completedAt when marking done
      const update: Record<string, unknown> = { ...data };
      if (data.status === 'done') update.completedAt = new Date();
      else if (data.status) update.completedAt = null;

      const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
        .populate('assignedTo', 'name avatar')
        .populate('relatedLead', 'name company status')
        .populate('relatedContact', 'name email');

      if (!task) throw new AppError('Task not found', 404);
      sendSuccess(res, { task }, 'Task updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) throw new AppError('Task not found', 404);
      sendSuccess(res, null, 'Task deleted');
    } catch (error) {
      next(error);
    }
  },

  async getTaskStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const now = new Date();

      const [todo, inProgress, done, overdue] = await Promise.all([
        Task.countDocuments({ $or: [{ createdBy: userId }, { assignedTo: userId }], status: 'todo' }),
        Task.countDocuments({ $or: [{ createdBy: userId }, { assignedTo: userId }], status: 'in_progress' }),
        Task.countDocuments({ $or: [{ createdBy: userId }, { assignedTo: userId }], status: 'done' }),
        Task.countDocuments({
          $or: [{ createdBy: userId }, { assignedTo: userId }],
          dueDate: { $lt: now },
          status: { $nin: ['done', 'cancelled'] },
        }),
      ]);

      sendSuccess(res, { stats: { todo, inProgress, done, overdue } });
    } catch (error) {
      next(error);
    }
  },
};

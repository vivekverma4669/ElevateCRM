import { Request, Response, NextFunction } from 'express';
import { Activity } from '../models/Activity';
import { Note } from '../models/Note';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  leadId: z.string().min(1),
  reminderAt: z.string().datetime().optional(),
  isPinned: z.boolean().optional(),
});

export const activityController = {
  async getLeadActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [activities, total] = await Promise.all([
        Activity.find({ lead: req.params.leadId })
          .populate('user', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Activity.countDocuments({ lead: req.params.leadId }),
      ]);

      sendSuccess(res, { activities }, 'Activities retrieved', 200, {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      next(error);
    }
  },

  async getRecentActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activities = await Activity.find()
        .populate('user', 'name avatar')
        .populate('lead', 'name company')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      sendSuccess(res, { activities });
    } catch (error) {
      next(error);
    }
  },

  async getLeadNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notes = await Note.find({ lead: req.params.leadId })
        .populate('createdBy', 'name avatar')
        .sort({ isPinned: -1, createdAt: -1 })
        .lean();

      sendSuccess(res, { notes });
    } catch (error) {
      next(error);
    }
  },

  async createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, leadId, reminderAt, isPinned } = createNoteSchema.parse({
        ...req.body,
        leadId: req.params.leadId,
      });

      const note = await Note.create({
        content,
        lead: leadId,
        createdBy: req.user!.userId,
        reminderAt,
        isPinned,
      });

      await Activity.create({
        type: 'note_added',
        title: 'Note added',
        description: content.slice(0, 100),
        lead: leadId,
        user: req.user!.userId,
      });

      const populated = await note.populate('createdBy', 'name avatar');
      sendCreated(res, { note: populated }, 'Note created');
    } catch (error) {
      next(error);
    }
  },

  async updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const note = await Note.findOneAndUpdate(
        { _id: req.params.noteId, createdBy: req.user!.userId },
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name avatar');

      if (!note) throw new AppError('Note not found or unauthorized', 404);
      sendSuccess(res, { note }, 'Note updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const note = await Note.findOneAndDelete({
        _id: req.params.noteId,
        createdBy: req.user!.userId,
      });

      if (!note) throw new AppError('Note not found or unauthorized', 404);
      sendSuccess(res, null, 'Note deleted');
    } catch (error) {
      next(error);
    }
  },
};

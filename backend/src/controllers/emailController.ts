import { Request, Response, NextFunction } from 'express';
import { EmailLog } from '../models/EmailLog';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const logEmailSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  to: z.string().email(),
  toName: z.string().optional(),
  lead: z.string().optional(),
  contact: z.string().optional(),
});

// 1x1 transparent PNG in base64
const TRACKING_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

export const emailController = {
  async getEmailLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, lead, contact } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: Record<string, unknown> = { sentBy: req.user!.userId };
      if (lead) filter.lead = lead;
      if (contact) filter.contact = contact;

      const [emails, total] = await Promise.all([
        EmailLog.find(filter)
          .populate('lead', 'name company')
          .populate('contact', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        EmailLog.countDocuments(filter),
      ]);

      sendSuccess(res, { emails }, 'Email logs retrieved', 200, {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      next(error);
    }
  },

  async logEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = logEmailSchema.parse(req.body);
      const emailLog = await EmailLog.create({ ...data, sentBy: req.user!.userId });

      const populated = await emailLog.populate([
        { path: 'lead', select: 'name company' },
        { path: 'contact', select: 'name email' },
      ]);

      sendCreated(res, { email: populated, trackingId: emailLog.trackingId }, 'Email logged');
    } catch (error) {
      next(error);
    }
  },

  async deleteEmailLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = await EmailLog.findOneAndDelete({ _id: req.params.id, sentBy: req.user!.userId });
      if (!email) throw new AppError('Email log not found', 404);
      sendSuccess(res, null, 'Email log deleted');
    } catch (error) {
      next(error);
    }
  },

  // Tracking pixel endpoint — no auth required
  async trackOpen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trackingId } = req.params;
      await EmailLog.findOneAndUpdate(
        { trackingId },
        { $inc: { openCount: 1 }, $set: { status: 'opened' }, $setOnInsert: { openedAt: new Date() } },
        { new: false }
      );

      // Set first openedAt if not set
      await EmailLog.updateOne(
        { trackingId, openedAt: { $exists: false } },
        { $set: { openedAt: new Date() } }
      );

      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.send(TRACKING_PIXEL);
    } catch (error) {
      next(error);
    }
  },

  // Click tracking redirect — no auth required
  async trackClick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { trackingId } = req.params;
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        res.status(400).send('Missing url');
        return;
      }

      await EmailLog.findOneAndUpdate(
        { trackingId },
        {
          $inc: { clickCount: 1 },
          $set: { status: 'clicked' },
          $setOnInsert: { clickedAt: new Date() },
        },
        { new: false }
      );

      await EmailLog.updateOne(
        { trackingId, clickedAt: { $exists: false } },
        { $set: { clickedAt: new Date() } }
      );

      res.redirect(decodeURIComponent(url));
    } catch (error) {
      next(error);
    }
  },

  async getEmailStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const [total, opened, clicked] = await Promise.all([
        EmailLog.countDocuments({ sentBy: userId }),
        EmailLog.countDocuments({ sentBy: userId, status: { $in: ['opened', 'clicked'] } }),
        EmailLog.countDocuments({ sentBy: userId, status: 'clicked' }),
      ]);

      const openRate = total > 0 ? Math.round((opened / total) * 100) : 0;
      const clickRate = total > 0 ? Math.round((clicked / total) * 100) : 0;

      sendSuccess(res, { stats: { total, opened, clicked, openRate, clickRate } });
    } catch (error) {
      next(error);
    }
  },
};

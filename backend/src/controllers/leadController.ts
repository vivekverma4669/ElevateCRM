import { Request, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead';
import { Activity } from '../models/Activity';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { cache, CACHE_KEYS } from '../redis/cache';
import { AppError } from '../middleware/errorHandler';

export const leadController = {
  async getLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', assignedTo } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const cacheKey = CACHE_KEYS.leads(req.user!.userId, JSON.stringify(req.query));
      const cached = await cache.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const filter: Record<string, unknown> = { isArchived: false };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignedTo) filter.assignedTo = assignedTo;
      if (search) {
        filter.$text = { $search: search as string };
      }

      const sort: Record<string, 1 | -1> = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

      const [leads, total] = await Promise.all([
        Lead.find(filter)
          .populate('assignedTo', 'name email avatar')
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Lead.countDocuments(filter),
      ]);

      const result = {
        status: 'success' as const,
        message: 'Leads retrieved',
        data: { leads },
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };

      await cache.set(cacheKey, result, 60);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cached = await cache.get(CACHE_KEYS.lead(req.params.id));
      if (cached) {
        sendSuccess(res, cached);
        return;
      }

      const lead = await Lead.findById(req.params.id)
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email');

      if (!lead) throw new AppError('Lead not found', 404);

      await cache.set(CACHE_KEYS.lead(req.params.id), lead, 120);
      sendSuccess(res, { lead });
    } catch (error) {
      next(error);
    }
  },

  async createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await Lead.create({ ...req.body, createdBy: req.user!.userId });

      await Activity.create({
        type: 'lead_created',
        title: `Lead "${lead.name}" created`,
        lead: lead._id,
        user: req.user!.userId,
      });

      await cache.delPattern(`leads:${req.user!.userId}:*`);
      sendCreated(res, { lead }, 'Lead created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await Lead.findById(req.params.id);
      if (!existing) throw new AppError('Lead not found', 404);

      const statusChanged = req.body.status && req.body.status !== existing.status;

      const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate('assignedTo', 'name email avatar');

      if (statusChanged) {
        await Activity.create({
          type: 'status_changed',
          title: `Status changed to "${req.body.status}"`,
          description: `From "${existing.status}" to "${req.body.status}"`,
          lead: lead!._id,
          user: req.user!.userId,
          metadata: { from: existing.status, to: req.body.status },
        });
      } else {
        await Activity.create({
          type: 'lead_updated',
          title: `Lead "${existing.name}" updated`,
          lead: lead!._id,
          user: req.user!.userId,
        });
      }

      await Promise.all([
        cache.del(CACHE_KEYS.lead(req.params.id)),
        cache.delPattern(`leads:${req.user!.userId}:*`),
      ]);

      sendSuccess(res, { lead }, 'Lead updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { isArchived: true },
        { new: true }
      );
      if (!lead) throw new AppError('Lead not found', 404);

      await Promise.all([
        cache.del(CACHE_KEYS.lead(req.params.id)),
        cache.delPattern(`leads:${req.user!.userId}:*`),
      ]);

      sendSuccess(res, null, 'Lead archived successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateLeadStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );
      if (!lead) throw new AppError('Lead not found', 404);

      await Activity.create({
        type: 'status_changed',
        title: `Pipeline stage moved to "${status}"`,
        lead: lead._id,
        user: req.user!.userId,
        metadata: { status },
      });

      await Promise.all([
        cache.del(CACHE_KEYS.lead(req.params.id)),
        cache.delPattern(`leads:${req.user!.userId}:*`),
      ]);

      sendSuccess(res, { lead }, 'Status updated');
    } catch (error) {
      next(error);
    }
  },

  async getKanbanLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

      const leads = await Lead.find({ isArchived: false })
        .populate('assignedTo', 'name email avatar')
        .sort({ priority: -1, createdAt: -1 })
        .lean();

      const kanban = statuses.reduce<Record<string, unknown[]>>((acc, status) => {
        acc[status] = leads.filter((l) => l.status === status);
        return acc;
      }, {});

      sendSuccess(res, { kanban });
    } catch (error) {
      next(error);
    }
  },
};

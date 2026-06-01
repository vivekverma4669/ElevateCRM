import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService';
import { Lead } from '../models/Lead';
import { Activity } from '../models/Activity';
import { sendSuccess } from '../utils/response';
import { cache, CACHE_KEYS } from '../redis/cache';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const summarizeSchema = z.object({
  notes: z.string().min(10, 'Notes must be at least 10 characters').max(10000),
  leadId: z.string().optional(),
});

const emailSchema = z.object({
  type: z.enum(['follow_up', 'cold_outreach', 'meeting_reminder', 'proposal']),
  leadId: z.string().optional(),
  leadName: z.string().min(1),
  company: z.string().optional().default('their company'),
  context: z.string().optional().default(''),
});

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const aiController = {
  async summarizeLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notes, leadId } = summarizeSchema.parse(req.body);

      let leadName = 'Unknown Lead';
      if (leadId) {
        const lead = await Lead.findById(leadId);
        if (lead) leadName = lead.name;
      }

      const result = await aiService.generateLeadSummary(
        notes,
        leadName,
        req.user!.userId,
        leadId
      );

      if (leadId) {
        await Lead.findByIdAndUpdate(leadId, {
          aiSummary: result.summary,
          aiSentiment: result.sentiment,
          aiUrgency: result.urgency,
          aiNextAction: result.nextAction,
        });

        await Activity.create({
          type: 'ai_summary_generated',
          title: 'AI summary generated',
          description: result.summary,
          lead: leadId,
          user: req.user!.userId,
        });

        await cache.del(CACHE_KEYS.lead(leadId));
      }

      sendSuccess(res, result, 'AI summary generated');
    } catch (error) {
      next(error);
    }
  },

  async generateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, leadId, leadName, company, context } = emailSchema.parse(req.body);

      const result = await aiService.generateEmail(
        type,
        leadName,
        company,
        context,
        req.user!.userId,
        leadId
      );

      if (leadId) {
        await Activity.create({
          type: 'ai_email_generated',
          title: `AI ${type.replace('_', ' ')} email generated`,
          lead: leadId,
          user: req.user!.userId,
        });
      }

      sendSuccess(res, result, 'Email generated');
    } catch (error) {
      next(error);
    }
  },

  async getSalesInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.analytics(req.user!.userId);
      const cached = await cache.get(cacheKey + ':insights');
      if (cached) {
        sendSuccess(res, cached, 'Sales insights retrieved');
        return;
      }

      const leads = await Lead.find({ isArchived: false })
        .populate('assignedTo', 'name')
        .lean();

      const summary = {
        totalLeads: leads.length,
        byStatus: leads.reduce<Record<string, number>>((acc, l) => {
          acc[l.status] = (acc[l.status] ?? 0) + 1;
          return acc;
        }, {}),
        highValue: leads.filter((l) => (l.value ?? 0) > 10000).map((l) => ({
          name: l.name,
          company: l.company,
          value: l.value,
          status: l.status,
          lastContact: l.lastContactedAt,
        })),
        stale: leads.filter((l) => {
          if (!l.lastContactedAt) return true;
          const daysSince = (Date.now() - new Date(l.lastContactedAt).getTime()) / 86400000;
          return daysSince > 14;
        }).map((l) => ({ name: l.name, company: l.company, lastContact: l.lastContactedAt })),
      };

      const result = await aiService.generateSalesInsights(summary, req.user!.userId);

      await cache.set(cacheKey + ':insights', result, 600);
      sendSuccess(res, result, 'Sales insights generated');
    } catch (error) {
      next(error);
    }
  },

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message } = chatSchema.parse(req.body);

      const [totalLeads, wonLeads, recentLeads] = await Promise.all([
        Lead.countDocuments({ isArchived: false }),
        Lead.countDocuments({ status: 'won' }),
        Lead.find({ isArchived: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name status priority company value')
          .lean(),
      ]);

      const context = `
Total leads: ${totalLeads}
Won leads: ${wonLeads}
Recent leads: ${recentLeads.map((l) => `${l.name} (${l.company ?? 'N/A'}, ${l.status}, ₹${l.value ?? 0})`).join('; ')}
Today's date: ${new Date().toLocaleDateString()}
      `.trim();

      const response = await aiService.chat(message, context, req.user!.userId);
      sendSuccess(res, { response }, 'Assistant response');
    } catch (error) {
      next(error);
    }
  },
};

import { Request, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead';
import { Activity } from '../models/Activity';
import { sendSuccess } from '../utils/response';
import { cache, CACHE_KEYS } from '../redis/cache';

export const dashboardController = {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.dashboard(req.user!.userId);
      const cached = await cache.get(cacheKey);
      if (cached) {
        sendSuccess(res, cached, 'Dashboard stats retrieved');
        return;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const [
        totalLeads,
        newLeadsThisMonth,
        newLeadsLastMonth,
        wonLeads,
        wonLeadsLastMonth,
        recentActivities,
        pipelineData,
        monthlyRevenue,
      ] = await Promise.all([
        Lead.countDocuments({ isArchived: false }),
        Lead.countDocuments({ isArchived: false, createdAt: { $gte: startOfMonth } }),
        Lead.countDocuments({
          isArchived: false,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        }),
        Lead.aggregate([
          { $match: { status: 'won', isArchived: false } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$value' } } },
        ]),
        Lead.aggregate([
          {
            $match: {
              status: 'won',
              isArchived: false,
              updatedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            },
          },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$value' } } },
        ]),
        Activity.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('user', 'name avatar')
          .populate('lead', 'name company')
          .lean(),
        Lead.aggregate([
          { $match: { isArchived: false } },
          { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$value' } } },
        ]),
        Lead.aggregate([
          { $match: { status: 'won', isArchived: false } },
          {
            $group: {
              _id: {
                year: { $year: '$updatedAt' },
                month: { $month: '$updatedAt' },
              },
              revenue: { $sum: '$value' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
          { $limit: 12 },
        ]),
      ]);

      const currentRevenue = wonLeads[0]?.revenue ?? 0;
      const lastRevenue = wonLeadsLastMonth[0]?.revenue ?? 0;
      const revenueGrowth = lastRevenue > 0
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
        : 0;

      const leadsGrowth = newLeadsLastMonth > 0
        ? ((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100
        : 0;

      const conversionRate = totalLeads > 0
        ? ((wonLeads[0]?.count ?? 0) / totalLeads) * 100
        : 0;

      const data = {
        stats: {
          totalLeads,
          newLeadsThisMonth,
          leadsGrowth: Math.round(leadsGrowth * 10) / 10,
          totalRevenue: currentRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          wonDeals: wonLeads[0]?.count ?? 0,
          conversionRate: Math.round(conversionRate * 10) / 10,
        },
        pipeline: pipelineData.map((p) => ({
          status: p._id,
          count: p.count,
          value: p.value ?? 0,
        })),
        monthlyRevenue: monthlyRevenue.map((m) => ({
          month: new Date(m._id.year, m._id.month - 1).toLocaleString('default', {
            month: 'short',
            year: '2-digit',
          }),
          revenue: m.revenue,
          deals: m.count,
        })),
        recentActivities,
      };

      await cache.set(cacheKey, data, 300);
      sendSuccess(res, data, 'Dashboard stats retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period as string);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [leadsBySource, leadsByPriority, conversionFunnel, topLeads] = await Promise.all([
        Lead.aggregate([
          { $match: { isArchived: false, createdAt: { $gte: startDate } } },
          { $group: { _id: '$source', count: { $sum: 1 } } },
        ]),
        Lead.aggregate([
          { $match: { isArchived: false } },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        Lead.aggregate([
          { $match: { isArchived: false } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalValue: { $sum: '$value' },
            },
          },
        ]),
        Lead.find({ isArchived: false, value: { $gt: 0 } })
          .sort({ value: -1 })
          .limit(5)
          .select('name company value status priority')
          .lean(),
      ]);

      sendSuccess(res, {
        leadsBySource,
        leadsByPriority,
        conversionFunnel,
        topLeads,
      });
    } catch (error) {
      next(error);
    }
  },
};

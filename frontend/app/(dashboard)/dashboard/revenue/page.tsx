'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, CheckCircle2, XCircle, Target, Award,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { dashboardApi } from '@/lib/api';
import { DashboardData } from '@/types';
import { formatCurrency, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils';

interface AnalyticsData {
  leadsBySource: { _id: string; count: number }[];
  leadsByPriority: { _id: string; count: number }[];
  conversionFunnel: { _id: string; count: number; totalValue: number }[];
  topLeads: {
    _id: string;
    name: string;
    company?: string;
    value?: number;
    status: string;
    priority: string;
  }[];
}

const PIPELINE_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const PIPELINE_BAR_COLORS: Record<string, string> = {
  new: '#60a5fa',
  contacted: '#a78bfa',
  qualified: '#facc15',
  proposal: '#fb923c',
  negotiation: '#f472b6',
  won: '#4ade80',
  lost: '#f87171',
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function RevenueTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-cyan-400">{formatCurrency(payload[0]?.value ?? 0)}</p>
      {payload[1] && (
        <p className="text-xs text-muted-foreground">{payload[1].value} deals</p>
      )}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  isLoading?: boolean;
  delay?: number;
}

function KPICard({ label, value, sub, change, icon: Icon, iconColor, iconBg, isLoading, delay = 0 }: KPICardProps) {
  if (isLoading) {
    return <div className="rounded-xl border border-border bg-card p-5 animate-pulse h-[110px]" />;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-border bg-card p-5 card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function RevenuePage() {
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
    select: (r) => r.data.data as DashboardData,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard', 'analytics', '90'],
    queryFn: () => dashboardApi.getAnalytics('90'),
    select: (r) => r.data.data as AnalyticsData,
  });

  const isLoading = dashLoading || analyticsLoading;

  const stats = dashData?.stats;
  const pipeline = dashData?.pipeline ?? [];
  const monthlyRevenue = dashData?.monthlyRevenue ?? [];

  const wonItem = pipeline.find((p) => p.status === 'won');
  const lostItem = pipeline.find((p) => p.status === 'lost');
  const lostCount = lostItem?.count ?? 0;
  const lostValue = lostItem?.value ?? 0;
  const activeCount = pipeline
    .filter((p) => !['won', 'lost'].includes(p.status))
    .reduce((s, p) => s + p.count, 0);
  const closedDeals = (wonItem?.count ?? 0) + lostCount;
  const winRate = closedDeals > 0 ? ((wonItem?.count ?? 0) / closedDeals) * 100 : 0;
  const avgDealValue =
    (wonItem?.count ?? 0) > 0 ? (stats?.totalRevenue ?? 0) / (wonItem?.count ?? 1) : 0;

  const pieData = [
    { name: 'Won', value: wonItem?.count ?? 0, color: '#4ade80' },
    { name: 'Lost', value: lostCount, color: '#f87171' },
    { name: 'Active', value: activeCount, color: '#22d3ee' },
  ].filter((d) => d.value > 0);

  const sortedPipeline = [...pipeline].sort(
    (a, b) => PIPELINE_ORDER.indexOf(a.status) - PIPELINE_ORDER.indexOf(b.status)
  );
  const maxPipelineCount = Math.max(...pipeline.map((p) => p.count), 1);

  const sourceData = (analytics?.leadsBySource ?? [])
    .sort((a, b) => b.count - a.count)
    .map((s) => ({
      name: (s._id ?? 'unknown').replace(/_/g, ' '),
      count: s.count,
    }));

  return (
    <div className="flex flex-col">
      <Header
        title="Revenue & Analytics"
        subtitle="Track revenue, deal performance, and pipeline health"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            label="Total Revenue"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            change={stats?.revenueGrowth}
            icon={DollarSign}
            iconColor="text-cyan-400"
            iconBg="bg-cyan-400/10"
            isLoading={isLoading}
            delay={0}
          />
          <KPICard
            label="Won Deals"
            value={String(stats?.wonDeals ?? 0)}
            sub={formatCurrency(wonItem?.value ?? 0) + ' total value'}
            icon={CheckCircle2}
            iconColor="text-green-400"
            iconBg="bg-green-400/10"
            isLoading={isLoading}
            delay={0.05}
          />
          <KPICard
            label="Lost Deals"
            value={String(lostCount)}
            sub={formatCurrency(lostValue) + ' lost value'}
            icon={XCircle}
            iconColor="text-red-400"
            iconBg="bg-red-400/10"
            isLoading={isLoading}
            delay={0.1}
          />
          <KPICard
            label="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            sub={`of ${closedDeals} closed deals`}
            icon={Target}
            iconColor="text-purple-400"
            iconBg="bg-purple-400/10"
            isLoading={isLoading}
            delay={0.15}
          />
          <KPICard
            label="Avg Deal Value"
            value={formatCurrency(avgDealValue)}
            sub="per won deal"
            icon={Award}
            iconColor="text-yellow-400"
            iconBg="bg-yellow-400/10"
            isLoading={isLoading}
            delay={0.2}
          />
        </div>

        {/* Revenue Trend + Deal Outcomes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 h-[320px] animate-pulse" />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 card-hover">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-foreground">Revenue Trend</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Monthly won-deal revenue
                    </p>
                  </div>
                  {stats?.revenueGrowth !== undefined && (
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stats.revenueGrowth >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {Math.abs(stats.revenueGrowth)}% vs last month
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fill="url(#revGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#22d3ee', stroke: '#000', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Deal Outcomes Donut */}
          <div>
            {isLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 h-[320px] animate-pulse" />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 card-hover flex flex-col">
                <div className="mb-2">
                  <h3 className="font-semibold text-foreground">Deal Outcomes</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Won, lost & active</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number, name: string) => [v + ' deals', name]}
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-auto">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Funnel */}
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 h-[260px] animate-pulse" />
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 card-hover">
            <div className="mb-5">
              <h3 className="font-semibold text-foreground">Pipeline Funnel</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deal count and total value at each stage
              </p>
            </div>
            <div className="space-y-3">
              {sortedPipeline.map((item) => {
                const pct = (item.count / maxPipelineCount) * 100;
                const color = PIPELINE_BAR_COLORS[item.status] ?? '#22d3ee';
                return (
                  <div key={item.status} className="flex items-center gap-4">
                    <span className="w-24 text-xs text-muted-foreground capitalize text-right flex-shrink-0">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                    <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="h-full rounded-lg flex items-center justify-end pr-2"
                        style={{
                          background: color,
                          minWidth: item.count > 0 ? '2rem' : 0,
                        }}
                      >
                        {pct > 10 && (
                          <span className="text-[10px] font-bold text-black/70">
                            {item.count}
                          </span>
                        )}
                      </motion.div>
                    </div>
                    <span className="w-32 text-xs text-muted-foreground text-right flex-shrink-0">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="w-8 text-xs font-semibold text-foreground text-right flex-shrink-0">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Deals + Source Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Deals */}
          {isLoading ? (
            <div className="rounded-xl border border-border bg-card p-6 h-[280px] animate-pulse" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 card-hover">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Top Deals by Value</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Highest value leads in your pipeline
                </p>
              </div>
              <div className="space-y-3">
                {(analytics?.topLeads ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No deals with value found.
                  </p>
                ) : (
                  analytics?.topLeads.map((lead, i) => (
                    <div key={lead._id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {lead.name}
                        </p>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${
                          STATUS_COLORS[lead.status] ?? ''
                        }`}
                      >
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                      <span className="text-sm font-semibold text-cyan-400 flex-shrink-0">
                        {formatCurrency(lead.value ?? 0)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Source Breakdown */}
          {isLoading ? (
            <div className="rounded-xl border border-border bg-card p-6 h-[280px] animate-pulse" />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 card-hover">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Leads by Source</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Where your leads are coming from
                </p>
              </div>
              {sourceData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No source data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={sourceData}
                    layout="vertical"
                    margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PipelineItem } from '@/types';
import { formatCurrency, STATUS_LABELS } from '@/lib/utils';

const COLORS = ['#3b82f6', '#8b5cf6', '#eab308', '#f97316', '#ec4899', '#22c55e', '#ef4444'];

interface Props {
  data: PipelineItem[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{payload[0]?.payload.name}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0]?.value} leads</p>
    </div>
  );
}

export function PipelineChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    count: d.count,
    value: d.value,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6 card-hover">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Pipeline Overview</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Lead count by stage</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Value summary */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
        {data.filter(d => d.value > 0).slice(0, 2).map((d) => (
          <div key={d.status} className="text-center">
            <p className="text-xs text-muted-foreground capitalize">{STATUS_LABELS[d.status]}</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(d.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

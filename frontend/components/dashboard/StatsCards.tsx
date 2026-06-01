'use client';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, IndianRupee, Target, Trophy } from 'lucide-react';
import { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  gradient: string;
}

function StatCard({ title, value, change, icon: Icon, iconColor, gradient }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-6 card-hover cursor-default'
      )}
    >
      <div className={cn('absolute inset-0 opacity-5', gradient)} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2.5 rounded-lg', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            isPositive
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-muted" />
        <div className="w-16 h-6 rounded-full bg-muted" />
      </div>
      <div className="w-24 h-8 rounded bg-muted mb-2" />
      <div className="w-32 h-4 rounded bg-muted" />
    </div>
  );
}

interface Props {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!stats) return null;

  const cards: StatsCardProps[] = [
    {
      title: 'Total Leads',
      value: stats.totalLeads.toLocaleString(),
      change: stats.leadsGrowth,
      icon: Users,
      iconColor: 'bg-blue-500/10 text-blue-400',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueGrowth,
      icon: IndianRupee,
      iconColor: 'bg-cyan-500/10 text-cyan-400',
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-700',
    },
    {
      title: 'Deals Won',
      value: stats.wonDeals.toLocaleString(),
      change: stats.revenueGrowth,
      icon: Trophy,
      iconColor: 'bg-yellow-500/10 text-yellow-400',
      gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: stats.leadsGrowth,
      icon: Target,
      iconColor: 'bg-green-500/10 text-green-400',
      gradient: 'bg-gradient-to-br from-green-500 to-green-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}

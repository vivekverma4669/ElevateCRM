'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { dashboardApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { DashboardData } from '@/types';
import { Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
    select: (r) => r.data.data as DashboardData,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" subtitle="Welcome back — here's your sales overview" />

      <div className="p-6 space-y-6">
        {/* AI Quick Actions Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/5 to-transparent p-4 flex items-center justify-between"
        >
          <div className="absolute inset-0 bg-cyber-grid opacity-30" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center animate-glow-pulse">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                ElevateAI is active
                <span className="ai-badge">AI</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Get AI insights, generate emails, and analyze your pipeline
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/ai"
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan flex-shrink-0"
          >
            <TrendingUp className="w-4 h-4" />
            Open AI Studio
          </Link>
        </motion.div>

        {/* Stats */}
        <StatsCards stats={data?.stats} isLoading={isLoading} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 h-[340px] animate-pulse" />
            ) : (
              <RevenueChart data={data?.monthlyRevenue ?? []} />
            )}
          </div>
          <div>
            {isLoading ? (
              <div className="rounded-xl border border-border bg-card p-6 h-[340px] animate-pulse" />
            ) : (
              <PipelineChart data={data?.pipeline ?? []} />
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivities
            activities={data?.recentActivities ?? []}
            isLoading={isLoading}
          />

          {/* Quick Pipeline Summary */}
          <div className="rounded-xl border border-border bg-card p-6 card-hover">
            <h3 className="font-semibold text-foreground mb-4">Pipeline Summary</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {data?.pipeline.map((item) => {
                  const total = data.pipeline.reduce((s, p) => s + p.count, 0);
                  const pct = total > 0 ? (item.count / total) * 100 : 0;
                  const statusColors: Record<string, string> = {
                    new: 'bg-blue-400',
                    contacted: 'bg-purple-400',
                    qualified: 'bg-yellow-400',
                    proposal: 'bg-orange-400',
                    negotiation: 'bg-pink-400',
                    won: 'bg-green-400',
                    lost: 'bg-red-400',
                  };
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground capitalize">{item.status}</span>
                        <span className="text-xs font-medium text-foreground">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${statusColors[item.status] ?? 'bg-cyan-400'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { AISalesInsights } from '@/types';
import {
  TrendingUp, Users, Target, Brain, RefreshCw, Loader2, Flame, Clock, Lightbulb, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightSectionProps {
  title: string;
  icon: React.ElementType;
  items: string[];
  color: string;
  delay: number;
}

function InsightSection({ title, icon: Icon, items, color, delay }: InsightSectionProps) {
  if (!items.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-border bg-muted/30 p-4"
    >
      <div className={cn('flex items-center gap-2 mb-3')}>
        <Icon className={cn('w-4 h-4', color)} />
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="ml-auto text-xs text-muted-foreground">{items.length} items</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className={cn('mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0', color.replace('text-', 'bg-'))} />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function SalesInsights() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => aiApi.getInsights(),
    select: (r) => r.data.data as AISalesInsights,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-cyan-400/5 to-transparent">
        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <p className="font-semibold text-foreground">AI Sales Insights</p>
          <p className="text-xs text-muted-foreground">Real-time CRM analysis & recommendations</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="ai-badge">AI</span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh insights"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing your pipeline with AI...</p>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-3">
            {/* Strategy */}
            {data.weeklyStrategy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-cyan-400/5 to-transparent border border-cyan-400/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <p className="text-sm font-semibold text-cyan-400">Weekly Strategy</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{data.weeklyStrategy}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <InsightSection
                title="Hot Leads"
                icon={Flame}
                items={data.hotLeads}
                color="text-orange-400"
                delay={0.1}
              />
              <InsightSection
                title="Inactive Clients"
                icon={Clock}
                items={data.inactiveClients}
                color="text-yellow-400"
                delay={0.2}
              />
              <InsightSection
                title="Conversion Tips"
                icon={Target}
                items={data.conversionSuggestions}
                color="text-green-400"
                delay={0.3}
              />
              <InsightSection
                title="Performance Insights"
                icon={BarChart3}
                items={data.performanceInsights}
                color="text-blue-400"
                delay={0.4}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No insights available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

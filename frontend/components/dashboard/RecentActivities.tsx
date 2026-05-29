'use client';
import { motion } from 'framer-motion';
import {
  UserPlus, RefreshCw, StickyNote, Mail, Phone, Calendar, Sparkles, Activity,
} from 'lucide-react';
import { Activity as ActivityType } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  lead_created: UserPlus,
  lead_updated: RefreshCw,
  status_changed: RefreshCw,
  note_added: StickyNote,
  email_sent: Mail,
  call_made: Phone,
  meeting_scheduled: Calendar,
  ai_summary_generated: Sparkles,
  ai_email_generated: Sparkles,
};

const ACTIVITY_COLORS: Record<string, string> = {
  lead_created: 'text-blue-400 bg-blue-500/10',
  lead_updated: 'text-purple-400 bg-purple-500/10',
  status_changed: 'text-yellow-400 bg-yellow-500/10',
  note_added: 'text-orange-400 bg-orange-500/10',
  email_sent: 'text-green-400 bg-green-500/10',
  call_made: 'text-pink-400 bg-pink-500/10',
  ai_summary_generated: 'text-cyan-400 bg-cyan-500/10',
  ai_email_generated: 'text-cyan-400 bg-cyan-500/10',
};

interface Props {
  activities: ActivityType[];
  isLoading?: boolean;
}

export function RecentActivities({ activities, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-muted flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 card-hover">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <Activity className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity, i) => {
            const Icon = ACTIVITY_ICONS[activity.type] ?? RefreshCw;
            const colorClass = ACTIVITY_COLORS[activity.type] ?? 'text-muted-foreground bg-muted';

            return (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colorClass)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium leading-snug truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activity.lead && (
                      <span className="text-xs text-muted-foreground truncate">
                        {(activity.lead as { name: string }).name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground/60">·</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

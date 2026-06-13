'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Sparkles,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  BookUser,
  CheckSquare,
  Mail,
  TrendingUp,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/pipeline', icon: Kanban, label: 'Pipeline' },
  { href: '/dashboard/contacts', icon: BookUser, label: 'Contacts' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/dashboard/emails', icon: Mail, label: 'Email Tracking' },
  { href: '/dashboard/revenue', icon: TrendingUp, label: 'Revenue' },
  { href: '/dashboard/ai', icon: Sparkles, label: 'AI Studio', ai: true },
  { href: '/dashboard/activities', icon: Activity, label: 'Activities' },
];

const bottomItems = [
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-card border-r border-border z-40 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <Logo size="sm" showTagline />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Main
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-item group relative', isActive && 'sidebar-item-active')}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon className="w-4 h-4 flex-shrink-0 relative z-10" />
              <span className="relative z-10 flex-1">{item.label}</span>
              {item.ai && (
                <span className="relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 dark:bg-cyan-400/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 dark:border-cyan-400/30">
                  AI
                </span>
              )}
              {isActive && (
                <ChevronRight className="w-3 h-3 relative z-10 text-cyan-500 dark:text-cyan-400" />
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            System
          </p>
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('sidebar-item', isActive && 'sidebar-item-active')}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full sidebar-item text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

'use client';
import { Bell, Search, Plus, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border border-border bg-input px-3 py-2 transition-all duration-200',
              searchOpen ? 'w-56' : 'w-10 justify-center cursor-pointer'
            )}
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {searchOpen && (
              <input
                autoFocus
                placeholder="Search leads..."
                onBlur={() => setSearchOpen(false)}
                className="bg-transparent text-sm outline-none text-foreground placeholder-muted-foreground w-full"
              />
            )}
          </div>

          {/* New Lead CTA */}
          <Link
            href="/dashboard/leads?action=new"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold hover:bg-cyan-300 transition-all glow-cyan"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:block">New Lead</span>
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="w-10 h-10 rounded-lg border border-border bg-input flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Notifications */}
          <button className="relative w-10 h-10 rounded-lg border border-border bg-input flex items-center justify-center hover:bg-accent transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

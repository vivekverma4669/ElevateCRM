'use client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { User, Shield, Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — only render theme UI after mount
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col">
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <User className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <h2 className="font-semibold text-foreground">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-2xl font-bold text-black flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="mt-1 inline-block text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Palette className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <h2 className="font-semibold text-foreground">Appearance</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mounted ? `Currently using ${theme} mode` : 'Loading...'}
              </p>
            </div>

            {mounted && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    theme === 'light'
                      ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    theme === 'dark'
                      ? 'bg-zinc-900 text-white shadow-sm border border-zinc-700'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Configuration */}
        <div className="rounded-xl border border-cyan-500/20 dark:border-cyan-400/20 bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <h2 className="font-semibold text-foreground">AI Configuration</h2>
            <span className="ai-badge ml-auto">AI</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">AI Model</p>
                <p className="text-xs text-muted-foreground">Claude Sonnet 4.6</p>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">AI Rate Limit</p>
                <p className="text-xs text-muted-foreground">50 requests per 15 minutes</p>
              </div>
              <span className="text-xs text-cyan-600 dark:text-cyan-400">Configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle, TrendingUp, MessageCircle, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { AILeadSummary } from '@/types';
import { cn, SENTIMENT_COLORS } from '@/lib/utils';

export function LeadSummaryTool() {
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<AILeadSummary | null>(null);

  const mutation = useMutation({
    mutationFn: () => aiApi.summarizeLead({ notes }),
    onSuccess: (r) => setResult(r.data.data),
  });

  const urgencyColors: Record<string, string> = {
    low: 'text-green-400 bg-green-500/10 border-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-cyan-400/5 to-transparent">
        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <p className="font-semibold text-foreground">AI Lead Summary</p>
          <p className="text-xs text-muted-foreground">Analyze client notes for smart insights</p>
        </div>
        <span className="ml-auto ai-badge">AI</span>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Paste client notes or emails
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Paste any client notes, emails, or conversation history here...&#10;&#10;Example: 'Had a call with John today. He seemed interested in our enterprise plan but was concerned about pricing. His team of 50 needs onboarding support...'"
            className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/50 transition-all resize-none"
          />
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={notes.length < 10 || mutation.isPending}
          className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-semibold text-sm hover:bg-cyan-300 transition-all glow-cyan flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate AI Summary
            </>
          )}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Summary */}
              <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                <p className="text-xs font-medium text-cyan-400 mb-2 uppercase tracking-wide">Summary</p>
                <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
              </div>

              {/* Meta badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                  <MessageCircle className={cn('w-4 h-4 mx-auto mb-1', SENTIMENT_COLORS[result.sentiment])} />
                  <p className="text-xs text-muted-foreground">Sentiment</p>
                  <p className={cn('text-xs font-semibold capitalize', SENTIMENT_COLORS[result.sentiment])}>
                    {result.sentiment}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                  <AlertCircle className={cn('w-4 h-4 mx-auto mb-1', urgencyColors[result.urgency]?.split(' ')[0])} />
                  <p className="text-xs text-muted-foreground">Urgency</p>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border capitalize', urgencyColors[result.urgency])}>
                    {result.urgency}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-xs font-semibold text-cyan-400">
                    {result.urgency === 'high' ? '9/10' : result.urgency === 'medium' ? '6/10' : '3/10'}
                  </p>
                </div>
              </div>

              {/* Next action */}
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-green-400 mb-1">Recommended Next Action</p>
                    <p className="text-sm text-foreground">{result.nextAction}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mutation.isError && (
          <p className="text-sm text-destructive text-center">
            Failed to generate summary. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}

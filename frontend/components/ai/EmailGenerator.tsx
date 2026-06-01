'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { AIEmail } from '@/types';

const EMAIL_TYPES = [
  { value: 'follow_up', label: 'Follow-up', desc: 'After initial contact' },
  { value: 'cold_outreach', label: 'Cold Outreach', desc: 'First contact' },
  { value: 'meeting_reminder', label: 'Meeting Reminder', desc: 'Upcoming meeting' },
  { value: 'proposal', label: 'Proposal', desc: 'Send proposal/pricing' },
];

export function EmailGenerator() {
  const [form, setForm] = useState({
    type: 'follow_up',
    leadName: '',
    company: '',
    context: '',
  });
  const [result, setResult] = useState<AIEmail | null>(null);
  const [copied, setCopied] = useState<'subject' | 'body' | null>(null);

  const mutation = useMutation({
    mutationFn: () => aiApi.generateEmail(form),
    onSuccess: (r) => setResult(r.data.data),
  });

  const copy = (field: 'subject' | 'body', text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-cyan-400/5 to-transparent">
        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <Mail className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <p className="font-semibold text-foreground">AI Email Generator</p>
          <p className="text-xs text-muted-foreground">Craft personalized sales emails instantly</p>
        </div>
        <span className="ml-auto ai-badge">AI</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Email type */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Email Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EMAIL_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  form.type === t.value
                    ? 'border-cyan-400/50 bg-cyan-400/10 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground'
                }`}
              >
                <p className="text-xs font-semibold">{t.label}</p>
                <p className="text-[10px] mt-0.5 opacity-70">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Lead Name *</label>
            <input
              value={form.leadName}
              onChange={(e) => setForm((f) => ({ ...f, leadName: e.target.value }))}
              placeholder="John Smith"
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Company</label>
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="Acme Corp"
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Context / Key Points</label>
          <textarea
            value={form.context}
            onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
            rows={2}
            placeholder="They're interested in our enterprise plan, budget is ~₹50k, need quick onboarding..."
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all resize-none"
          />
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={!form.leadName || mutation.isPending}
          className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-semibold text-sm hover:bg-cyan-300 transition-all glow-cyan flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Email</>
          )}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Subject */}
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</p>
                  <button
                    onClick={() => copy('subject', result.subject)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === 'subject' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'subject' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-foreground font-medium">{result.subject}</p>
              </div>

              {/* Body */}
              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email Body</p>
                  <button
                    onClick={() => copy('body', result.body)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === 'body' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'body' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                  {result.body}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

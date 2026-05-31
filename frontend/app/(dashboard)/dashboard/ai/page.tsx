'use client';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { LeadSummaryTool } from '@/components/ai/LeadSummary';
import { EmailGenerator } from '@/components/ai/EmailGenerator';
import { SalesInsights } from '@/components/ai/SalesInsights';

const AI_FEATURES = [
  { icon: Sparkles, label: 'Smart Analysis', desc: 'AI-powered lead scoring' },
  { icon: Zap, label: 'Instant Generation', desc: 'Emails in seconds' },
  { icon: Shield, label: 'Data Secure', desc: 'Your data stays private' },
  { icon: Clock, label: 'Always On', desc: '24/7 AI assistance' },
];

export default function AIStudioPage() {
  return (
    <div className="flex flex-col">
      <Header title="AI Studio" subtitle="Supercharge your sales with AI-powered intelligence" />

      <div className="p-6 space-y-6">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent p-6"
        >
          <div className="absolute inset-0 bg-cyber-grid opacity-40" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center animate-glow-pulse">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-lg font-bold gradient-text">ElevateAI Studio</span>
              <span className="ai-badge">Powered by Gemini</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg mb-4">
              Your AI-powered sales copilot. Analyze leads, generate professional emails, get real-time insights, and chat with your personal sales assistant.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AI_FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card/50 border border-border/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Assistant */}
          <div className="xl:row-span-2" style={{ minHeight: '600px' }}>
            <div className="h-full">
              <AIAssistant />
            </div>
          </div>

          {/* Right top: Lead Summary */}
          <LeadSummaryTool />

          {/* Right bottom: Email Generator */}
          <EmailGenerator />
        </div>

        {/* Full-width Sales Insights */}
        <SalesInsights />
      </div>
    </div>
  );
}

import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { AILog, AIFeature } from '../models/AILog';
import { cache, CACHE_KEYS } from '../redis/cache';
import crypto from 'crypto';

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

function hashPrompt(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16);
}

async function callClaude(prompt: string, systemPrompt: string): Promise<{
  content: string;
  tokensUsed: number;
  latencyMs: number;
}> {
  const cacheKey = CACHE_KEYS.aiResponse(hashPrompt(systemPrompt + prompt));
  const cached = await cache.get<{ content: string; tokensUsed: number; latencyMs: number }>(cacheKey);
  if (cached) return cached;

  const start = Date.now();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const result = {
    content: message.content[0].type === 'text' ? message.content[0].text : '',
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    latencyMs: Date.now() - start,
  };

  await cache.set(cacheKey, result, 300);
  return result;
}

export const aiService = {
  async generateLeadSummary(
    notes: string,
    leadName: string,
    userId: string,
    leadId?: string
  ): Promise<{
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high';
    nextAction: string;
  }> {
    const systemPrompt = `You are an expert CRM sales analyst. Analyze client notes and emails to extract key insights.
Always respond with valid JSON in this exact format:
{
  "summary": "concise 2-3 sentence summary",
  "sentiment": "positive|neutral|negative",
  "urgency": "low|medium|high",
  "nextAction": "specific recommended action"
}`;

    const prompt = `Analyze the following notes/emails for lead "${leadName}" and provide insights:\n\n${notes}`;

    const { content, tokensUsed, latencyMs } = await callClaude(prompt, systemPrompt);

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? content);
    } catch {
      parsed = {
        summary: content.slice(0, 300),
        sentiment: 'neutral',
        urgency: 'medium',
        nextAction: 'Review notes and follow up with the lead.',
      };
    }

    await AILog.create({
      feature: 'lead_summary' as AIFeature,
      prompt,
      response: content,
      tokensUsed,
      latencyMs,
      lead: leadId,
      user: userId,
    });

    return parsed;
  },

  async generateEmail(
    type: 'follow_up' | 'cold_outreach' | 'meeting_reminder' | 'proposal',
    leadName: string,
    company: string,
    context: string,
    userId: string,
    leadId?: string
  ): Promise<{ subject: string; body: string }> {
    const emailTypes = {
      follow_up: 'professional follow-up email after initial contact',
      cold_outreach: 'personalized cold outreach email',
      meeting_reminder: 'friendly meeting reminder email',
      proposal: 'compelling proposal response email',
    };

    const systemPrompt = `You are an expert sales copywriter. Write professional, personalized sales emails.
Always respond with valid JSON:
{
  "subject": "email subject line",
  "body": "full email body with proper formatting"
}`;

    const prompt = `Write a ${emailTypes[type]} for:
Lead Name: ${leadName}
Company: ${company}
Context: ${context}`;

    const { content, tokensUsed, latencyMs } = await callClaude(prompt, systemPrompt);

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? content);
    } catch {
      parsed = { subject: `Following up - ${leadName}`, body: content };
    }

    await AILog.create({
      feature: 'email_generator' as AIFeature,
      prompt,
      response: content,
      tokensUsed,
      latencyMs,
      lead: leadId,
      user: userId,
    });

    return parsed;
  },

  async generateSalesInsights(
    leadsData: unknown,
    userId: string
  ): Promise<{
    hotLeads: string[];
    inactiveClients: string[];
    conversionSuggestions: string[];
    performanceInsights: string[];
    weeklyStrategy: string;
  }> {
    const systemPrompt = `You are a senior sales strategist and CRM expert. Analyze CRM data and provide actionable insights.
Always respond with valid JSON:
{
  "hotLeads": ["lead insight 1", ...],
  "inactiveClients": ["client insight 1", ...],
  "conversionSuggestions": ["suggestion 1", ...],
  "performanceInsights": ["insight 1", ...],
  "weeklyStrategy": "overall strategy paragraph"
}`;

    const prompt = `Analyze this CRM data and provide sales insights:\n${JSON.stringify(leadsData, null, 2)}`;

    const { content, tokensUsed, latencyMs } = await callClaude(prompt, systemPrompt);

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? content);
    } catch {
      parsed = {
        hotLeads: [],
        inactiveClients: [],
        conversionSuggestions: ['Review your pipeline regularly'],
        performanceInsights: ['Keep tracking your metrics'],
        weeklyStrategy: content.slice(0, 500),
      };
    }

    await AILog.create({
      feature: 'sales_insights' as AIFeature,
      prompt: 'Sales insights analysis',
      response: content,
      tokensUsed,
      latencyMs,
      user: userId,
    });

    return parsed;
  },

  async chat(
    message: string,
    context: string,
    userId: string
  ): Promise<string> {
    const systemPrompt = `You are ElevateAI, an intelligent CRM assistant for ElevateCRM.
You help sales teams manage leads, track pipelines, and grow revenue.
You have access to the user's CRM context below. Provide helpful, concise, actionable responses.
Keep responses under 200 words unless more detail is explicitly needed.

CRM Context:
${context}`;

    const { content, tokensUsed, latencyMs } = await callClaude(message, systemPrompt);

    await AILog.create({
      feature: 'assistant' as AIFeature,
      prompt: message,
      response: content,
      tokensUsed,
      latencyMs,
      user: userId,
    });

    return content;
  },
};

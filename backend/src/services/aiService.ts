import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import { AILog, AIFeature } from "../models/AILog";
import { cache, CACHE_KEYS } from "../redis/cache";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const MODEL = "gemini-2.0-flash-lite";
const MAX_TOKENS = 1024;

function hashPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

async function callGemini(
  prompt: string,
  systemPrompt: string,
): Promise<{
  content: string;
  tokensUsed: number;
  latencyMs: number;
}> {
  const cacheKey = CACHE_KEYS.aiResponse(hashPrompt(systemPrompt + prompt));
  const cached = await cache.get<{
    content: string;
    tokensUsed: number;
    latencyMs: number;
  }>(cacheKey);
  if (cached) return cached;

  const start = Date.now();

  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: MAX_TOKENS },
  });

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("429") ||
      msg.includes("Too Many Requests") ||
      msg.includes("quota")
    ) {
      throw new AppError(
        "AI quota exceeded. Please try again in a few minutes.",
        429,
      );
    }
    if (msg.includes("404") || msg.includes("not found")) {
      throw new AppError(
        "AI model not available. Please check your Google AI Studio plan.",
        503,
      );
    }
    throw new AppError("AI service error. Please try again.", 503);
  }

  const response = result.response;

  const out = {
    content: response.text(),
    tokensUsed: response.usageMetadata?.totalTokenCount ?? 0,
    latencyMs: Date.now() - start,
  };

  await cache.set(cacheKey, out, 300);
  return out;
}

export const aiService = {
  async generateLeadSummary(
    notes: string,
    leadName: string,
    userId: string,
    leadId?: string,
  ): Promise<{
    summary: string;
    sentiment: "positive" | "neutral" | "negative";
    urgency: "low" | "medium" | "high";
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

    const { content, tokensUsed, latencyMs } = await callGemini(
      prompt,
      systemPrompt,
    );

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? content);
    } catch {
      parsed = {
        summary: content.slice(0, 300),
        sentiment: "neutral",
        urgency: "medium",
        nextAction: "Review notes and follow up with the lead.",
      };
    }

    await AILog.create({
      feature: "lead_summary" as AIFeature,
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
    type: "follow_up" | "cold_outreach" | "meeting_reminder" | "proposal",
    leadName: string,
    company: string,
    context: string,
    userId: string,
    leadId?: string,
  ): Promise<{ subject: string; body: string }> {
    const emailTypes = {
      follow_up: "professional follow-up email after initial contact",
      cold_outreach: "personalized cold outreach email",
      meeting_reminder: "friendly meeting reminder email",
      proposal: "compelling proposal response email",
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

    const { content, tokensUsed, latencyMs } = await callGemini(
      prompt,
      systemPrompt,
    );

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? content);
    } catch {
      parsed = { subject: `Following up - ${leadName}`, body: content };
    }

    await AILog.create({
      feature: "email_generator" as AIFeature,
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
    userId: string,
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

    const { content, tokensUsed, latencyMs } = await callGemini(
      prompt,
      systemPrompt,
    );

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? content);
    } catch {
      parsed = {
        hotLeads: [],
        inactiveClients: [],
        conversionSuggestions: ["Review your pipeline regularly"],
        performanceInsights: ["Keep tracking your metrics"],
        weeklyStrategy: content.slice(0, 500),
      };
    }

    await AILog.create({
      feature: "sales_insights" as AIFeature,
      prompt: "Sales insights analysis",
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
    userId: string,
  ): Promise<string> {
    const systemPrompt = `You are ElevateAI, an intelligent CRM assistant for ElevateCRM — India's smart sales CRM.
You help Indian sales teams manage leads, track pipelines, and grow revenue.
You have access to the user's CRM context below. Provide helpful, concise, actionable responses.
Keep responses under 200 words unless more detail is explicitly needed.

CRM Context:
${context}`;

    const { content, tokensUsed, latencyMs } = await callGemini(
      message,
      systemPrompt,
    );

    await AILog.create({
      feature: "assistant" as AIFeature,
      prompt: message,
      response: content,
      tokensUsed,
      latencyMs,
      user: userId,
    });

    return content;
  },
};

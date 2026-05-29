import mongoose, { Document, Schema } from 'mongoose';

export type AIFeature = 'lead_summary' | 'email_generator' | 'sales_insights' | 'assistant';

export interface IAILog extends Document {
  feature: AIFeature;
  prompt: string;
  response: string;
  tokensUsed?: number;
  latencyMs?: number;
  lead?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const aiLogSchema = new Schema<IAILog>(
  {
    feature: {
      type: String,
      enum: ['lead_summary', 'email_generator', 'sales_insights', 'assistant'],
      required: true,
    },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    tokensUsed: { type: Number },
    latencyMs: { type: Number },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

aiLogSchema.index({ user: 1, createdAt: -1 });
aiLogSchema.index({ feature: 1 });
aiLogSchema.index({ lead: 1 });
aiLogSchema.index({ createdAt: -1 });

export const AILog = mongoose.model<IAILog>('AILog', aiLogSchema);

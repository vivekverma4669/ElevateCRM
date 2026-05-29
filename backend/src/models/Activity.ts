import mongoose, { Document, Schema } from 'mongoose';

export type ActivityType =
  | 'lead_created'
  | 'lead_updated'
  | 'status_changed'
  | 'note_added'
  | 'email_sent'
  | 'call_made'
  | 'meeting_scheduled'
  | 'follow_up'
  | 'ai_summary_generated'
  | 'ai_email_generated';

export interface IActivity extends Document {
  type: ActivityType;
  title: string;
  description?: string;
  lead: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: [
        'lead_created',
        'lead_updated',
        'status_changed',
        'note_added',
        'email_sent',
        'call_made',
        'meeting_scheduled',
        'follow_up',
        'ai_summary_generated',
        'ai_email_generated',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

activitySchema.index({ lead: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);

import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export type EmailStatus = 'sent' | 'opened' | 'clicked';

export interface IEmailLog extends Document {
  subject: string;
  body: string;
  to: string;
  toName?: string;
  lead?: mongoose.Types.ObjectId;
  contact?: mongoose.Types.ObjectId;
  sentBy: mongoose.Types.ObjectId;
  status: EmailStatus;
  trackingId: string;
  openedAt?: Date;
  clickedAt?: Date;
  openCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    to: { type: String, required: true, lowercase: true, trim: true },
    toName: { type: String, trim: true },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['sent', 'opened', 'clicked'], default: 'sent' },
    trackingId: { type: String, unique: true, default: () => crypto.randomBytes(16).toString('hex') },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

emailLogSchema.index({ sentBy: 1, createdAt: -1 });
emailLogSchema.index({ lead: 1 });
emailLogSchema.index({ contact: 1 });
emailLogSchema.index({ trackingId: 1 });

export const EmailLog = mongoose.model<IEmailLog>('EmailLog', emailLogSchema);

import mongoose, { Document, Schema } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'website' | 'referral' | 'cold_outreach' | 'social' | 'event' | 'other';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  tags: string[];
  value?: number;
  expectedCloseDate?: Date;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  description?: string;
  website?: string;
  location?: string;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  aiSummary?: string;
  aiSentiment?: 'positive' | 'neutral' | 'negative';
  aiUrgency?: 'low' | 'medium' | 'high';
  aiNextAction?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'cold_outreach', 'social', 'event', 'other'],
      default: 'other',
    },
    tags: [{ type: String, trim: true }],
    value: { type: Number, min: 0 },
    expectedCloseDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, maxlength: 2000 },
    website: { type: String, trim: true },
    location: { type: String, trim: true },
    lastContactedAt: { type: Date },
    nextFollowUpAt: { type: Date },
    aiSummary: { type: String },
    aiSentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    aiUrgency: { type: String, enum: ['low', 'medium', 'high'] },
    aiNextAction: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

leadSchema.index({ status: 1, priority: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdBy: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ tags: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ value: -1 });
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);

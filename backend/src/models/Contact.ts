import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  company?: mongoose.Types.ObjectId;
  companyName?: string;
  source: string;
  tags: string[];
  notes?: string;
  linkedLeads: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    phone: { type: String, trim: true },
    position: { type: String, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    companyName: { type: String, trim: true },
    source: { type: String, enum: ['website', 'referral', 'cold_outreach', 'social', 'event', 'other'], default: 'other' },
    tags: [{ type: String, trim: true }],
    notes: { type: String, maxlength: 2000 },
    linkedLeads: [{ type: Schema.Types.ObjectId, ref: 'Lead' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

contactSchema.index({ createdBy: 1, email: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ name: 'text', email: 'text', companyName: 'text' });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);

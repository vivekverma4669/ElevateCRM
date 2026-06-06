import mongoose, { Document, Schema } from 'mongoose';

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface ICompany extends Document {
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  location?: string;
  phone?: string;
  email?: string;
  revenue?: number;
  description?: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    location: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    revenue: { type: Number, min: 0 },
    description: { type: String, maxlength: 2000 },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

companySchema.index({ createdBy: 1 });
companySchema.index({ createdAt: -1 });
companySchema.index({ name: 'text', industry: 'text' });

export const Company = mongoose.model<ICompany>('Company', companySchema);

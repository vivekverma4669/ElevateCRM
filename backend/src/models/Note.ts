import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  content: string;
  lead: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isPinned: boolean;
  reminderAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [5000, 'Note cannot exceed 5000 characters'],
    },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPinned: { type: Boolean, default: false },
    reminderAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

noteSchema.index({ lead: 1, createdAt: -1 });
noteSchema.index({ createdBy: 1 });
noteSchema.index({ reminderAt: 1 });

export const Note = mongoose.model<INote>('Note', noteSchema);

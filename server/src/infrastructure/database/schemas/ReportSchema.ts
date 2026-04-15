import mongoose, { Schema, Document } from 'mongoose';

export interface Report extends Document {
  reporterId: string;
  reportedId: string;
  reason: string;
  context?: string; // e.g. Session ID
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    context: { type: String, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

export const ReportModel = mongoose.model<Report>('Report', reportSchema);

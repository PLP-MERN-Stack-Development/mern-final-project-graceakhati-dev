import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Certificate Document Interface
 */
export interface ICertificate extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  url: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Certificate Schema
 */
const certificateSchema = new Schema<ICertificate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    url: {
      type: String,
      required: [true, 'Certificate URL is required'],
      trim: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
certificateSchema.index({ userId: 1 });
certificateSchema.index({ courseId: 1 });

// Prevent duplicate certificates for same user and course (unique index)
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

/**
 * Certificate Model
 */
const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);

export default Certificate;


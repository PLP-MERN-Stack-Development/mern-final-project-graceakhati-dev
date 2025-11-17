import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Certificate Document Interface
 */
export interface ICertificate extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  certificateId: string;
  issuedAt: Date;
  impactSummary: string;
  hash: string;
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
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
    },
    issuedAt: {
      type: Date,
      required: [true, 'Issued date is required'],
      default: Date.now,
    },
    impactSummary: {
      type: String,
      required: [true, 'Impact summary is required'],
      trim: true,
      maxlength: [1000, 'Impact summary cannot exceed 1000 characters'],
    },
    hash: {
      type: String,
      required: [true, 'Hash is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
certificateSchema.index({ userId: 1 });
certificateSchema.index({ courseId: 1 });
certificateSchema.index({ certificateId: 1 }, { unique: true });

// Prevent duplicate certificates for same user and course (unique index)
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

/**
 * Certificate Model
 */
const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);

export default Certificate;


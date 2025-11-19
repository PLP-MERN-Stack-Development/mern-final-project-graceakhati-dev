import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Certificate Document Interface
 */
export interface ICertificate extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  certificateId?: string;
  moduleId?: Types.ObjectId;
  assignmentId?: Types.ObjectId;
  url: string;
  publicId?: string;
  grade?: number;
  issuedAt: Date;
  impactSummary?: string;
  hash?: string;
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
      unique: true,
      sparse: true,
      trim: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    url: {
      type: String,
      required: [true, 'Certificate URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    grade: {
      type: Number,
      min: [0, 'Grade cannot be negative'],
      max: [100, 'Grade cannot exceed 100'],
    },
    issuedAt: {
      type: Date,
      required: [true, 'Issued date is required'],
      default: Date.now,
    },
    impactSummary: {
      type: String,
      trim: true,
      maxlength: [1000, 'Impact summary cannot exceed 1000 characters'],
    },
    hash: {
      type: String,
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
// Note: certificateId index is automatically created by unique: true in field definition

// Prevent duplicate certificates for same user and course (unique index)
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

/**
 * Certificate Model
 */
const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);

export default Certificate;


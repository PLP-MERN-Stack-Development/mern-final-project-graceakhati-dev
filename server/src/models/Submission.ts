import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Geolocation Interface
 */
export interface IGeotag {
  lat: number;
  lng: number;
}

/**
 * Submission Metadata Interface
 */
export interface ISubmissionMetadata {
  geotag?: IGeotag;
  notes?: string;
}

/**
 * Submission Document Interface
 */
export interface ISubmission extends Document {
  assignmentId: Types.ObjectId;
  courseId: Types.ObjectId;
  userId: Types.ObjectId;
  files: string[];
  metadata: ISubmissionMetadata;
  score: number | null;
  feedback: string;
  status: 'submitted' | 'graded' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Geolocation Schema
 */
const geotagSchema = new Schema<IGeotag>(
  {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
  },
  { _id: false }
);

/**
 * Submission Metadata Schema
 */
const submissionMetadataSchema = new Schema<ISubmissionMetadata>(
  {
    geotag: {
      type: geotagSchema,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  { _id: false }
);

/**
 * Submission Schema
 */
const submissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    files: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      type: submissionMetadataSchema,
      default: {},
    },
    score: {
      type: Number,
      default: null,
      min: [0, 'Score cannot be negative'],
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'rejected'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
submissionSchema.index({ assignmentId: 1, userId: 1 });
submissionSchema.index({ courseId: 1 });
submissionSchema.index({ userId: 1 });
submissionSchema.index({ status: 1 });

/**
 * Submission Model
 */
const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

export default Submission;


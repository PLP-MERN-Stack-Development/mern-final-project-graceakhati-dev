import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Lesson Document Interface
 */
export interface ILesson extends Document {
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number; // in minutes
  order: number;
  moduleId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lesson Schema
 */
const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      minlength: [3, 'Lesson title must be at least 3 characters'],
      maxlength: [200, 'Lesson title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required'],
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Video URL must be a valid HTTP/HTTPS URL',
      },
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: [1, 'Lesson order must be at least 1'],
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ moduleId: 1 });

/**
 * Lesson Model
 */
const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);

export default Lesson;


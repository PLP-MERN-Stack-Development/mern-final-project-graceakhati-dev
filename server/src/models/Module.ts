import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Module Document Interface
 */
export interface IModule extends Document {
  title: string;
  courseId: Types.ObjectId;
  order: number;
  lessons: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Module Schema
 */
const moduleSchema = new Schema<IModule>(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      minlength: [3, 'Module title must be at least 3 characters'],
      maxlength: [200, 'Module title cannot exceed 200 characters'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    order: {
      type: Number,
      required: [true, 'Module order is required'],
      min: [1, 'Module order must be at least 1'],
    },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes
moduleSchema.index({ courseId: 1, order: 1 });
moduleSchema.index({ courseId: 1 });

/**
 * Module Model
 */
const Module = mongoose.model<IModule>('Module', moduleSchema);

export default Module;


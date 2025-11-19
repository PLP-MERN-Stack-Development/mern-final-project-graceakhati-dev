import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Assignment Document Interface
 */
export interface IAssignment extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  lessonId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  dueDate: Date;
  maxScore: number;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Assignment Schema
 */
const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      minlength: [3, 'Assignment title must be at least 3 characters'],
      maxlength: [200, 'Assignment title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      trim: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (v: Date) {
          return v > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score is required'],
      min: [1, 'Maximum score must be at least 1'],
      default: 100,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validation: Either lessonId or courseId must be provided
assignmentSchema.pre('validate', function (next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (!this.lessonId && !this.courseId) {
    next(new Error('Either lessonId or courseId must be provided'));
  } else {
    next();
  }
});

// Create indexes
assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ lessonId: 1 });
assignmentSchema.index({ dueDate: 1 });

/**
 * Assignment Model
 */
const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;


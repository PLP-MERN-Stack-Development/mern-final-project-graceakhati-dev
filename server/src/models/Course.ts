import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Course Module Interface
 */
export interface ICourseModule {
  title: string;
  description: string;
  order: number;
  duration?: number; // in minutes
  videoUrl?: string;
  content?: string;
}

/**
 * Course Impact Type
 */
export type ImpactType = 'climate' | 'waste' | 'energy' | 'water' | 'community' | 'other';

/**
 * Course Document Interface
 */
export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  authorId: Types.ObjectId;
  modules: ICourseModule[];
  tags: string[];
  price: number;
  impact_type: ImpactType;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Course Schema
 */
const courseModuleSchema = new Schema<ICourseModule>(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Module description is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Module order is required'],
      min: [1, 'Module order must be at least 1'],
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Course title must be at least 3 characters'],
      maxlength: [200, 'Course title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Course slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      minlength: [10, 'Course description must be at least 10 characters'],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
    },
    modules: {
      type: [courseModuleSchema],
      default: [],
      validate: {
        validator: function (modules: ICourseModule[]) {
          return modules.length > 0;
        },
        message: 'Course must have at least one module',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Course cannot have more than 10 tags',
      },
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    impact_type: {
      type: String,
      enum: ['climate', 'waste', 'energy', 'water', 'community', 'other'],
      required: [true, 'Impact type is required'],
      default: 'climate',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
courseSchema.index({ authorId: 1 });
// Note: slug already has unique: true which creates an index, so we don't need to add it again
courseSchema.index({ status: 1 });
courseSchema.index({ impact_type: 1 });
courseSchema.index({ tags: 1 });

/**
 * Generate slug from title before saving
 */
courseSchema.pre('save', function (next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

/**
 * Course Model
 */
const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;


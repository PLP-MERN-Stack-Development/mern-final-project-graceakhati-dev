import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Quiz Option Interface
 */
export interface IQuizOption {
  text: string;
  correct: boolean;
}

/**
 * Quiz Question Interface
 */
export interface IQuizQuestion {
  question: string;
  options: IQuizOption[];
  points: number;
}

/**
 * Quiz Document Interface
 */
export interface IQuiz extends Document {
  _id: Types.ObjectId;
  title: string;
  lessonId: Types.ObjectId;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quiz Option Schema
 */
const quizOptionSchema = new Schema<IQuizOption>(
  {
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
    },
    correct: {
      type: Boolean,
      required: [true, 'Option correctness is required'],
      default: false,
    },
  },
  { _id: false }
);

/**
 * Quiz Question Schema
 */
const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [quizOptionSchema],
      required: [true, 'Question options are required'],
      validate: {
        validator: function (options: IQuizOption[]) {
          return options.length >= 2 && options.length <= 6;
        },
        message: 'Question must have between 2 and 6 options',
      },
    },
    points: {
      type: Number,
      required: [true, 'Question points are required'],
      min: [1, 'Points must be at least 1'],
      default: 1,
    },
  },
  { _id: false }
);

/**
 * Quiz Schema
 */
const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: [3, 'Quiz title must be at least 3 characters'],
      maxlength: [200, 'Quiz title cannot exceed 200 characters'],
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson ID is required'],
    },
    questions: {
      type: [quizQuestionSchema],
      required: [true, 'Quiz questions are required'],
      validate: {
        validator: function (questions: IQuizQuestion[]) {
          return questions.length > 0;
        },
        message: 'Quiz must have at least one question',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
quizSchema.index({ lessonId: 1 });

/**
 * Quiz Model
 */
const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

export default Quiz;


import mongoose, { Document, Schema, Types, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Role Types
 */
export type UserRole = 'student' | 'instructor' | 'admin';

/**
 * User Document Interface
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  firebaseUid?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  xp: number;
  badges: string[];
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Virtual property for id (string representation of _id)
  id: string;
}

/**
 * User Schema
 */
const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
      required: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative'],
    },
    badges: {
      type: [String],
      default: [],
    },
    googleId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        const { _id, __v, password, ...rest } = ret;
        return rest;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        const { _id, __v, password, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Create indexes
// Note: email already has unique: true which creates an index, so we don't need to add it again
userSchema.index({ firebaseUid: 1 });
userSchema.index({ googleId: 1 });

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password with cost of 12
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Static method: Find user by email
 */
userSchema.statics.findByEmail = async function (
  email: string,
  includePassword: boolean = false
): Promise<IUser | null> {
  const query = this.findOne({ email: email.toLowerCase() });
  if (includePassword) {
    return query.select('+password').exec();
  }
  return query.exec();
};

/**
 * Static method: Find user by Firebase UID
 */
userSchema.statics.findByFirebaseUid = async function (uid: string): Promise<IUser | null> {
  return this.findOne({ firebaseUid: uid }).exec();
};

/**
 * Static method: Find user by Google ID
 */
userSchema.statics.findByGoogleId = async function (googleId: string): Promise<IUser | null> {
  return this.findOne({ googleId }).exec();
};

/**
 * Static method: Find user by email or Google ID
 */
userSchema.statics.findByEmailOrGoogleId = async function (
  email: string,
  googleId: string
): Promise<IUser | null> {
  const user = await this.findOne({
    $or: [{ email: email.toLowerCase() }, { googleId }],
  }).exec();
  return user;
};

/**
 * Static method: Update user
 */
userSchema.statics.update = async function (
  id: string,
  updates: Partial<IUser>
): Promise<IUser | null> {
  // Remove fields that shouldn't be updated directly
  const updateData: any = { ...updates };
  delete updateData._id;
  delete updateData.id;
  delete updateData.createdAt;

  const user = await this.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  return user;
};

// Define the interface for the User model with static methods
// Model<IUser> already includes all standard Mongoose methods (findOne, find, create, deleteMany, countDocuments, etc.)
// We only need to add our custom static methods
interface IUserModel extends Model<IUser> {
  // Custom static methods
  findByEmail(email: string, includePassword?: boolean): Promise<IUser | null>;
  findByFirebaseUid(uid: string): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  findByEmailOrGoogleId(email: string, googleId: string): Promise<IUser | null>;
  update(id: string, updates: Partial<IUser>): Promise<IUser | null>;
}

/**
 * User Model
 */
export const UserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

export default UserModel;

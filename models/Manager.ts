import mongoose, { Document, Schema } from 'mongoose';

export interface IManager extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManagerSchema = new Schema<IManager>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
}, {
  timestamps: true,
});

// Index for faster queries
ManagerSchema.index({ email: 1 });
ManagerSchema.index({ createdAt: -1 });

export default mongoose.models.Manager || mongoose.model<IManager>('Manager', ManagerSchema);

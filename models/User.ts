import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  managerId: string; // Reference to the manager who created this user
  name: string;
  email: string;
  phoneNumber: string;
  linkedinUrl?: string;
  workExperience: Array<{
    companyName: string;
    role: string;
    startDate: string;
    endDate: string;
  }>;
  education: Array<{
    university: string;
    diploma: string;
    startDate: string;
    endDate: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  managerId: {
    type: String,
    required: [true, 'Manager ID is required'],
    ref: 'Manager',
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  linkedinUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(v);
      },
      message: 'Please enter a valid LinkedIn URL',
    },
  },
  workExperience: [{
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
    },
  }],
  education: [{
    university: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    diploma: {
      type: String,
      required: [true, 'Diploma/Degree is required'],
      trim: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
    },
  }],
}, {
  timestamps: true,
});

// Index for faster queries
UserSchema.index({ managerId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Force clear any existing model to ensure fresh schema
const modelName = 'User';
if (mongoose.models[modelName]) {
  delete (mongoose.models as any)[modelName];
}
if (mongoose.connection.models[modelName]) {
  delete (mongoose.connection.models as any)[modelName];
}

// Create a fresh model with the updated schema
const UserModel = mongoose.model<IUser>(modelName, UserSchema);
export default UserModel;

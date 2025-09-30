import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  _id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  generatedResume?: string;
  htmlContent?: string;
  filePath?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  jobDescription: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
  },
  generatedResume: {
    type: String,
    required: false,
  },
  htmlContent: {
    type: String,
    required: false,
  },
  filePath: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending',
  },
  errorMessage: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

ResumeSchema.index({ userId: 1 });
ResumeSchema.index({ companyName: 1, jobTitle: 1 });
ResumeSchema.index({ status: 1 });
ResumeSchema.index({ createdAt: -1 });

const modelName = 'Resume';
if (mongoose.models[modelName]) {
  delete (mongoose.models as any)[modelName];
}
if (mongoose.connection.models[modelName]) {
  delete (mongoose.connection.models as any)[modelName];
}

const ResumeModel = mongoose.model<IResume>(modelName, ResumeSchema);
export default ResumeModel;

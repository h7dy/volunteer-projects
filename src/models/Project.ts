import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  leadId: mongoose.Types.ObjectId; // Link to Lead User
  status: 'active' | 'completed' | 'draft';
  capacity?: number;
  enrolledCount?: number;
  location?: string; 
  startDate?: Date;  
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  leadId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'draft'], 
    default: 'draft' 
  },
  capacity: { type: Number, default: null },
  enrolledCount: { type: Number, default: 0 },
  location: { type: String, required: false },
  startDate: { type: Date, required: false }
}, { timestamps: true });

export const Project: Model<IProject> = 
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
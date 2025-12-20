import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipation extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  role: string; // e.g., 'developer', 'designer'
  status: 'accepted' | 'completed' | 'rejected' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const ParticipationSchema = new Schema<IParticipation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  role: { type: String, default: 'volunteer' },
  status: { 
    type: String, 
    enum: ['accepted', 'completed', 'rejected', 'pending'], 
    default: 'pending' 
  }
}, { timestamps: true });

// Ensures a user can't join the same project twice
ParticipationSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export const Participation: Model<IParticipation> = 
  mongoose.models.Participation || mongoose.model<IParticipation>('Participation', ParticipationSchema);
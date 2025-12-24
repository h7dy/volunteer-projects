import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipation extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipationSchema = new Schema<IParticipation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

// Ensures a user can't join the same project twice
ParticipationSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export const Participation: Model<IParticipation> = 
  mongoose.models.Participation || mongoose.model<IParticipation>('Participation', ParticipationSchema);
export default Participation;
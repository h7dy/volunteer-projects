import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  role: 'volunteer' | 'lead' | 'admin';
  status: 'active' | 'pending';
  auth0Id?: string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
    },
    role: {
      type: String,
      enum: ['volunteer', 'lead', 'admin'],
      default: 'volunteer',
    },
    status: {
      type: String,
      enum: ['active', 'pending'],
      default: 'pending',
    },
    auth0Id: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple users to have no auth0Id (null/undefined) initially
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
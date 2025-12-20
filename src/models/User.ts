import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  role: 'volunteer' | 'lead' | 'admin';
  status: 'active' | 'pending' | 'rejected' | 'banned';
  auth0Id: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
      enum: ['active', 'pending', 'rejected', 'banned'],
      default: 'pending',
    },
    auth0Id: {
      type: String,
      required: true, // Required as we rely on this for syncing
      unique: true,
      index: true,    // To speed up the login sync query
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: 'volunteer' | 'lead' | 'admin';
  status: 'active' | 'banned';
  hasRequestedLeadAccess: boolean;
  isLeadAccessRejected: boolean;
  reports: Array<{
    reporterId: mongoose.Types.ObjectId;
    reason: string;
    projectId: mongoose.Types.ObjectId;
    date: Date;
  }>;
  auth0Id: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String
    },
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
      enum: ['active', 'banned'],
      default: 'active',
    },
    hasRequestedLeadAccess: {
      type: Boolean, 
      default: false 
    },
    isLeadAccessRejected: {
      type: Boolean, default: false
    },
    reports: [{
      reporterId: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      projectId: { type: Schema.Types.ObjectId, ref: 'Project'},
      date: { type: Date, default: Date.now }
    }],
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
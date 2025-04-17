import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    role: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export default mongoose.model<IUser>('User', userSchema);

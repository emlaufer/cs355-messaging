import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  userIds: string[];
  message: string;
  timestamp: string;
  id: string;
}

const messageSchema = new mongoose.Schema(
  {
    userIds: [String],
    message: String,
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IMessage>('Message', messageSchema);

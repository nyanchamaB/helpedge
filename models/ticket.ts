import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  subject: string;
  body: string;
  from: string;
  to: string[];
  cc?: string[];
  date: Date;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'normal' | 'high';
  source: 'email' | 'manual' | 'web';
  sender?: string;
  attachments?: string[]; // Paths or URLs
  tags?: string[];
  threadId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TicketSchema: Schema = new Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    from: { type: String, required: true },
    to: [{ type: String, required: true }],
    cc: [{ type: String }],
    date: { type: Date, required: true },
    status: { type: String, enum: ['open', 'pending', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    source: { type: String, enum: ['email', 'manual', 'web'], default: 'email' },
    sender: { type: String },
    attachments: [{ type: String }],
    tags: [{ type: String }],
    threadId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

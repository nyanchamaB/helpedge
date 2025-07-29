// import mongoose, { Schema, Document } from 'mongoose';

// export interface ITicket extends Document {
//   subject: string;
//   body: string;
//   from: string;
//   to: string[];
//   cc?: string[];
//   date: Date;
//   status: 'open' | 'pending' | 'closed';
//   priority: 'low' | 'normal' | 'high';
//   source: 'email' | 'manual' | 'web';
//   sender?: string;
//   attachments?: string[]; // Paths or URLs
//   tags?: string[];
//   threadId?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const TicketSchema: Schema = new Schema(
//   {
//     subject: { type: String, required: true },
//     body: { type: String, required: true },
//     from: { type: String, required: true },
//     to: [{ type: String, required: true }],
//     cc: [{ type: String }],
//     date: { type: Date, required: true },
//     status: { type: String, enum: ['open', 'pending', 'closed'], default: 'open' },
//     priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
//     source: { type: String, enum: ['email', 'manual', 'web'], default: 'email' },
//     sender: { type: String },
//     attachments: [{ type: String }],
//     tags: [{ type: String }],
//     threadId: { type: String },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdBy: string;
  customerEmail: string;
  customerName?: string;
  source: 'email' | 'web' | 'phone' | 'chat';
  tags: string[];
  attachments: {
    filename: string;
    url: string;
    uploadedAt: Date;
  }[];
  comments: {
    author: string;
    content: string;
    isInternal: boolean;
    createdAt: Date;
  }[];
  resolutionTime?: number; // in minutes
  firstResponseTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

const TicketSchema = new Schema<ITicket>({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^TKT-\d{6}$/, 'Invalid ticket number format']
  },
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  customerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  source: {
    type: String,
    enum: ['email', 'web', 'phone', 'chat'],
    default: 'web',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionTime: {
    type: Number, // in minutes
    min: 0
  },
  firstResponseTime: {
    type: Number, // in minutes
    min: 0
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
TicketSchema.index({ ticketNumber: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ createdBy: 1 });
TicketSchema.index({ customerEmail: 1 });
TicketSchema.index({ source: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ updatedAt: -1 });

// Compound indexes for common queries
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ category: 1, status: 1 });

// Pre-save middleware to generate ticket number
TicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to update resolution time
TicketSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = now;
      this.resolutionTime = Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60));
    }
    
    if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = now;
    }
  }
  next();
});

// Prevent duplicate model compilation in development
const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
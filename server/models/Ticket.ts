import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface ITicket extends Document {
  _id: Types.ObjectId;
  ticketNumber: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: Types.ObjectId;
  requester: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  customerEmail: string;
  customerName?: string;
  source: "email" | "web" | "phone" | "chat";
  tags: string[];
  attachments: {
    filename: string;
    url: string;
    uploadedAt: Date;
  }[];
  comments: {
    author: Types.ObjectId;
    content: string;
    isInternal: boolean;
    createdAt: Date;
  }[];
  resolutionTime?: number;
  firstResponseTime?: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  date?: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: [/^TKT-\d{6}$/, "Invalid ticket number format"],
    },
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    customerName: {
      type: String,
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    source: {
      type: String,
      enum: ["email", "web", "phone", "chat"],
      default: "web",
      required: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: [2000, "Comment cannot exceed 2000 characters"],
        },
        isInternal: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolutionTime: { type: Number, min: 0 },
    firstResponseTime: { type: Number, min: 0 },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

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

TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ category: 1, status: 1 });

TicketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model<ITicket>("Ticket").countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

TicketSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    if (this.status === "resolved" && !this.resolvedAt) {
      this.resolvedAt = now;
      this.resolutionTime = Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60));
    }
    if (this.status === "closed" && !this.closedAt) {
      this.closedAt = now;
    }
  }
  next();
});

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;

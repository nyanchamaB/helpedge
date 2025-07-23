import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  subject: String,
  body: String,
  sender: String,
  source: { type: String, default: "email" },
  status: { type: String, default: "open" },
  priority: { type: String, default: "normal" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);

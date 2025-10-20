import Counter from "../models/Counter";

export async function getNextTicketNumber(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { name: "ticketNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TKT-${String(counter.seq).padStart(6, "0")}`;
}

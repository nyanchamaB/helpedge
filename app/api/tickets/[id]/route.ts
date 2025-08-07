import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/ticket";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  const { id } = await params; // Await params before accessing properties
  
  try {
    await dbConnect();
    const ticket = await Ticket.findById(id);
    
    if (!ticket) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ message: "Error fetching ticket" }, { status: 500 });
  }
}
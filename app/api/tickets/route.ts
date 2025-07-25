import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const newTicket = await Ticket.create(body);
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const tickets = await Ticket.find().sort({ date: -1 });
    return NextResponse.json(tickets);
  } catch (error) {
    // console.log(error.message);
    return NextResponse.json({ message: 'Failed to fetch tickets' }, { status: 500 });
  }
}


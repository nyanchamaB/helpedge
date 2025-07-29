// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import Ticket from '@/models/Ticket';

// export async function POST(req: NextRequest) {
//   try {
//     await dbConnect();
//     const body = await req.json();
//     const newTicket = await Ticket.create(body);
//     return NextResponse.json(newTicket, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: 'Failed to create ticket' }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     await dbConnect();
//     const tickets = await Ticket.find().populate('requester assignedTo category').sort({ date: -1 });
//     return NextResponse.json(tickets);
//   } catch (error) {
//     // console.log(error.message);
//     return NextResponse.json({ message: 'Failed to fetch tickets' }, { status: 500 });
//   }
// }

// app/api/tickets/route.ts (Enhanced)
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const userRole = req.headers.get('x-user-role');
    const currentUserId = req.headers.get('x-user-id');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Build query based on user role
    let query: any = {};
    
    if (userRole === 'end_user') {
      // End users can only see their own tickets
      query.requester = currentUserId;
    } else if (userRole === 'agent') {
      // Agents can see tickets assigned to them and unassigned tickets
      query.$or = [
        { assignedTo: currentUserId },
        { assignedTo: { $exists: false } },
        { assignedTo: null }
      ];
    }
    // Admins can see all tickets (no additional filter)

    // Apply search filters
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { subject: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { ticketNumber: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (category) query.category = category;

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('requester', 'name email')
        .populate('assignedTo', 'name email')
        .populate('category', 'name color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ticket.countDocuments(query)
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const currentUserId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    const body = await req.json();
    const { subject, description, priority, category, assignedTo } = body;

    // Validate required fields
    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      );
    }

    // Create ticket data
    const ticketData: any = {
      subject,
      description,
      priority: priority || 'medium',
      requester: currentUserId,
      source: 'web'
    };

    if (category) ticketData.category = category;
    
    // Only agents and admins can assign tickets during creation
    if ((userRole === 'agent' || userRole === 'admin') && assignedTo) {
      ticketData.assignedTo = assignedTo;
    }

    const ticket = await Ticket.create(ticketData);
    
    // Populate the created ticket
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('requester', 'name email')
      .populate('assignedTo', 'name email')
      .populate('category', 'name color');

    return NextResponse.json({
      message: 'Ticket created successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
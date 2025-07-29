// app/api/tickets/[id]/assign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    
    const userRole = req.headers.get('x-user-role');
    
    // Only agents and admins can assign tickets
    if (userRole !== 'agent' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { assignedTo } = body;

    // Validate that the assigned user exists and is an agent or admin
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee || (assignee.role !== 'agent' && assignee.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Invalid assignee' },
          { status: 400 }
        );
      }
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { 
        assignedTo: assignedTo || null,
        status: assignedTo ? 'in_progress' : 'open',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('requester', 'name email')
     .populate('assignedTo', 'name email')
     .populate('category', 'name color');

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
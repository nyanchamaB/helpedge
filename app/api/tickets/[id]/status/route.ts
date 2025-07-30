// app/api/tickets/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    
    const userRole = req.headers.get('x-user-role');
    const currentUserId = req.headers.get('x-user-id');

    const body = await req.json();
    const { status, resolution } = body;

    // Validate status
    const validStatuses = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find the ticket
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canUpdate = userRole === 'admin' || 
                     (userRole === 'agent' && ticket.assignedTo?.toString() === currentUserId) ||
                     (userRole === 'end_user' && ticket.requester.toString() === currentUserId);

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update ticket
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
      if (resolution) {
        updateData.resolution = resolution;
      }
    } else if (status === 'closed') {
      updateData.closedAt = new Date();
      if (!ticket.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      if (resolution) {
        updateData.resolution = resolution;
      }
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email')
     .populate('category', 'name color');

    return NextResponse.json({
      message: 'Ticket status updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
